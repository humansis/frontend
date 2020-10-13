<template>
	<div>
		<h2 class="title">Projects summary</h2>
		<div class="columns" ref="projectsSummary">
			<div v-for="{ id, title, value } in projectsSummary" :key="id" class="column is-half">
				<div class="box">
					<p class="title is-6">{{ title }}</p>
					<p class="subtitle is-4">{{ value }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { fetcher } from "@/utils/fetcher";

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
		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open({
					container: this.$refs.projectsSummary,
				});

				this.projectsSummary = [];

				const uri = "projects-summary";
				const { data } = await fetcher({ uri, auth: true });

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
