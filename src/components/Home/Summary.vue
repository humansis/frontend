<template>
	<div>
		<h2 class="title">Summary</h2>

		<div class="columns is-multiline" ref="summary">
			<div v-for="{ id, title, value } in summary" :key="id" class="column is-half">
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
	name: "Summary",

	data() {
		return {
			fetch: {
				error: null,
			},
			summary: [],
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
					container: this.$refs.summary,
				});

				this.summary = [];

				const uri = "home-summary";
				const { data } = await fetcher({ uri, auth: true });

				this.summary = data;
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
		position: relative;
		min-height: 64px;
	}
</style>
