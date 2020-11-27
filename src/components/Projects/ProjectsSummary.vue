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
import { normalizeText } from "@/utils/datagrid";
import ProjectsService from "@/services/ProjectsService";
import { Toast } from "@/utils/UI";

export default {
	name: "ProjectsSummary",

	data() {
		return {
			projectsSummary: [],
			currentPage: 1,
			perPage: 15,
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
			const loadingComponent = this.$buefy.loading.open({
				container: this.$refs.projectsSummary,
			});

			await ProjectsService.getListOfProjects(
				this.currentPage,
				this.perPage,
				"desc",
			).then((response) => {
				this.projectsSummary = response.data;
			}).catch((e) => { Toast(e, "is-danger"); });

			loadingComponent.close();
		},
	},
};
</script>

<style scoped>
.columns {
	margin-bottom: 20px;
}
</style>
