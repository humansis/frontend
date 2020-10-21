<template>
	<div>
		<h2 class="title">Vendors</h2>
		<b-button
			class="mb-5"
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
						icon="search">
					</b-input>
				</b-field>
			</div>
		</div>

		<b-table
			striped
			hoverable
			paginated
			selectable
			default-sort="id"
			aria-next-label="Next page"
			aria-previous-label="Previous page"
			aria-page-label="Page"
			aria-current-label="Current page"
			:data="tableData"
			:per-page="'15'"
			:current-page="1"
			:pagination-simple="false"
			:pagination-position="'bottom'"
			:default-sort-direction="'asc'"
			:sort-icon="'arrow-up'"
			:sort-icon-size="'is-small'"
			@select="goToDetail"
		>
			<template v-for="column in tableColumns">
				<b-table-column :key="column.id" v-bind="column">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>

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
						icon="print"
						type="is-dark"
						size="is-medium">
					</b-icon>
				</div>
			</b-table-column>
		</b-table>
	</div>
</template>

<script>
import { fetcher } from "@/utils/fetcher";
import { generateColumnsFromData } from "@/utils/datagrid";

export default {
	name: "VendorsList",

	data() {
		return {
			fetch: {
				error: null,
			},
			tableData: [],
			tableColumns: [],
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
				this.tableColumns = [];

				const uri = "vendors";
				const { data } = await fetcher({ uri, auth: true });

				this.tableData = data;
				this.tableColumns = generateColumnsFromData(data);
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

		goToDetail() {
			// TODO go to vendor detail
		},

	},
};
</script>
