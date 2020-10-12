<template>
	<div>
		<h2 class="title">institutions</h2>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
		>
			Create
		</b-button>
		<DataGrid :gridData="gridData" :gridFilters="gridFilters" />
	</div>
</template>

<script>
import { fetcher } from "@/utils/fetcher";
import DataGrid from "@/components/Beneficiaries/DataGrid";

export default {
	name: "Institutions",

	components: {
		DataGrid,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			gridData: [],
			gridFilters: [],
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

				this.gridData = data;
				this.gridFilters = filters.data;

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
