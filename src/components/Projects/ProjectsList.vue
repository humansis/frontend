<template>
	<div>
		<h2 class="title">Projects</h2>
        <b-button
            class="add-button"
            size="is-medium"
            type="is-danger"
            icon-left="plus"
        >
                Add
        </b-button>
        <div class="columns">
            <div class="column is-two-fifths">
                <b-field>
                    <b-input placeholder="Search..."
                        type="search"
                        icon-pack="fas"
                        icon="search">
                    </b-input>
                </b-field>
            </div>
        </div>

        <b-table
            :data="tableData"
            :paginated="true"
            :per-page="'15'"
            :current-page="1"
            :pagination-simple="false"
            :pagination-position="'bottom'"
            :default-sort-direction="'asc'"
            :sort-icon="'arrow-up'"
            :sort-icon-size="'is-small'"
            :striped="true"
            :hoverable="true"
            default-sort="id"
            aria-next-label="Next page"
            aria-previous-label="Previous page"
            aria-page-label="Page"
            aria-current-label="Current page"
            selectable
            @select="goToDetail"
            >
            <template slot-scope="props">
                <b-table-column
                    tag="router-link"
                    :to="{ name: '' }"
                    field="name" label="Name"
                    sortable
                >
                    {{ props.row.name }}
                </b-table-column>

                <b-table-column
                    field="sectors"
                    label="Sectors"
                    sortable
                >
                    {{ props.row.sectors }}
                </b-table-column>

                <b-table-column
                    field="start_date"
                    label="Start date"
                    sortable
                >
                    {{ props.row.start_date }}
                </b-table-column>

                <b-table-column
                    field="end_date"
                    label="End date"
                    sortable
                >
                    {{ props.row.end_date }}
                </b-table-column>

                <b-table-column
                    field="number_of_households"
                    label="Number of households"
                    sortable numeric
                >
                    {{ props.row.number_of_households }}
                </b-table-column>

                <b-table-column
                    field="donors"
                    label="Donors"
                    sortable
                    numeric
                >
                    {{ props.row.donors }}
                </b-table-column>

                <b-table-column
                    field="total_target_beneficiaries"
                    label="Total target beneficiaries"
                    sortable numeric
                >
                    {{ props.row.total_target_beneficiaries }}
                </b-table-column>

                <b-table-column
                    field="beneficiaries_reached"
                    label="Beneficiaries reached"
                    sortable numeric
                >
                    {{ props.row.beneficiaries_reached }}
                </b-table-column>

                <b-table-column
                    label="Actions"
                >
                <div class="block">
                    <b-icon
                        icon="edit"
                        type="is-link"
                        size="is-medium">
                    </b-icon>
                    <b-icon
                        icon="search"
                        type="is-info"
                        size="is-medium">
                    </b-icon>
                    <b-icon
                        icon="trash"
                        type="is-danger"
                        size="is-medium">
                    </b-icon>
                    <b-icon
                        icon="copy"
                        type="is-dark"
                        size="is-medium">
                    </b-icon>
                </div>
                </b-table-column>

            </template>
        </b-table>
	</div>
</template>

<script>
import { fetcher } from "@/utils/fetcher";

export default {
	name: "ProjectsList",

	data() {
		return {
			fetch: {
				error: null,
			},
			tableData: [],
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open({
					container: this.$refs.projectsList,
				});

				this.tableData = [];

				const uri = "projects";
				const { data } = await fetcher({ uri, auth: true });

				this.tableData = data;
				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
		},

		goToDetail(item) {
			this.$router.push({ name: "Project", params: { id: item.id } });
		},

	},
};
</script>

<style scoped>
	.add-button {
		margin-bottom: 20px;
	}
</style>
