<template>
	<div>
		<h2 class="title">Summary</h2>
		<div class="columns is-multiline" ref="summary">
			<div v-for="{ id, code, value } in summary" :key="id" class="column is-half">
				<div class="box">
					<p class="title is-6">{{ normalizeText(code) }}</p>
					<p class="subtitle is-4">{{ value }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { normalizeText } from "@/utils/datagrid";
import HomeService from "@/services/HomeService";
import { Toast } from "@/utils/UI";

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
		normalizeText(text) {
			return normalizeText(text);
		},

		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open({
					container: this.$refs.summary,
				});

				await HomeService.getSummariesForHomePage(
					"total_registrations",
				).then((response) => {
					this.summary = response.data;
				}).catch((e) => { Toast(e, "is-danger"); });

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
