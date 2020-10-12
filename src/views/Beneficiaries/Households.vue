<template>
	<div>
		<h2 class="title">Households</h2>
		<b-button
			class="add-button"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
		>
			Create
		</b-button>
		<GridList :tableData="tableData" :tableFilters="tableFilters" />
	</div>
</template>

<script>
import { fetcher } from "@/utils/fetcher";
import GridList from "@/components/Beneficiaries/GridList";

export default {
	name: "households",

	components: {
		GridList,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			tableData: [],
			tableFilters: [],
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
				const loadingComponent = this.$buefy.loading.open();

				const { data } = await fetcher({ uri: "beneficiaries/households", auth: true });
				const filters = await fetcher({ uri: "beneficiaries/filters", auth: true });

				this.tableData = data;
				this.tableFilters = filters.data;

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
	},
};
</script>

<style scoped>
	.add-button {
		margin-bottom: 20px;
	}
</style>
