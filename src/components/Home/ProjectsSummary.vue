<template>
	<div>
		<h2 class="title">Projects summary</h2>
		<div
			class="columns is-multiline projects-summary"
			ref="projectsSummary"
		>
			<div
				v-for="{id, name, target} in projectsSummary"
				class="column is-3"
				:key="id"
			>
				<div class="box">
					<p class="title is-6">{{ normalizeText(name) }}</p>
					<p class="subtitle is-4">{{ target }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ProjectsService from "@/services/ProjectsService";
import { normalizeProjectName } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "ProjectsSummary",

	data() {
		return {
			isLoading: true,
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
			return normalizeProjectName(text);
		},

		async fetchData() {
			const loadingComponent = this.$buefy.loading.open({
				container: this.$refs.projectsSummary,
			});

			await ProjectsService.getListOfProjects(
			).then((response) => {
				this.projectsSummary = response.data;
			}).catch((e) => {
				Notification(`Projects ${e}`, "is-danger");
			});

			loadingComponent.close();
		},
	},
};
</script>

<style scoped>
.columns {
	margin-bottom: 20px;
}

.projects-summary {
	min-height: 70px;
	position: relative;
}
</style>
