<template>
	<div>
		<h2 class="title">Communities</h2>
		<b-button
			class="add-button"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
		>
			Create
		</b-button>
		<GridList :tableData="tableData" />
	</div>
</template>

<script>
import { fetcher } from "@/utils/fetcher";
import GridList from "@/components/Beneficiaries/GridList";

export default {
	name: "Communities",

	components: {
		GridList,
	},

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
				const loadingComponent = this.$buefy.loading.open();

				this.tableData = [];

				const uri = "beneficiaries/households";
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
	},
};
</script>

<style scoped>
	.add-button {
		margin-bottom: 20px;
	}
</style>
