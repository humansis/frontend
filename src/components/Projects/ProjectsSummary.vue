<template>
	<div>
		<h2 class="title">Projects summary</h2>
		<div class="columns is-multiline" ref="projectsSummary">
			<div v-for="{id, name, target} in projectsSummary" :key="id" class="column is-half">
				<div class="box">
					<p class="title is-6">{{ normalizeText(name) }}</p>
					<p class="subtitle is-4">{{ target }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { fetcher } from "@/utils/fetcher";
import { normalizeText } from "@/utils/datagrid";

export default {
	name: "ProjectsSummary",

	data() {
		return {
			fetch: {
				error: null,
			},
			projectsSummary: [],
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		normalizeText(text) {
			return normalizeText(text);
		},

		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open({
					container: this.$refs.projectsSummary,
				});

				this.projectsSummary = [];

				const uri = "projects?page=1&size=15&sort=asc";
				const { data: { data } } = await fetcher({ uri, auth: true });
				this.projectsSummary = data;

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
	.columns {
		margin-bottom: 20px;
	}
</style>
