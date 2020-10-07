<template>
	<div>
		<h2 class="title">Projects</h2>
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
                    :to="{ name: 'Vouchers' }"
                    field="name" label="Name" sortable>
                    {{ props.row.name }}
                </b-table-column>

                <b-table-column field="sectors" label="Sectors" sortable>
                    {{ props.row.sectors }}
                </b-table-column>

                <b-table-column field="startDate" label="Start date" sortable>
                    {{ props.row.startDate }}
                </b-table-column>

                <b-table-column field="endDate" label="End date" sortable>
                    {{ props.row.endDate }}
                </b-table-column>

                <b-table-column
                    field="numberOfHouseholds"
                    label="Number of households"
                    sortable numeric
                >
                    {{ props.row.numberOfHouseholds }}
                </b-table-column>

                <b-table-column field="donors" label="Donors" sortable numeric>
                    {{ props.row.donors }}
                </b-table-column>

                <b-table-column
                    field="totalTargetBeneficiaries"
                    label="Total target beneficiaries"
                    sortable numeric
                >
                    {{ props.row.totalTargetBeneficiaries }}
                </b-table-column>

                <b-table-column
                    field="beneficiariesReached"
                    label="Beneficiaries reached"
                    sortable numeric
                >
                    {{ props.row.beneficiariesReached }}
                </b-table-column>

                <b-table-column label="Actions" sortable></b-table-column>

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
			console.log(item.id);
			// this.$router.push({ path: "/details/:recordId" });
		},

	},
};
</script>

<style scoped>
	.columns {
		margin-bottom: 20px;
	}
</style>
