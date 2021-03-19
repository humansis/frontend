<template>
	<div class="mb-6">
		<h2 class="title">Projects summary</h2>
		<b-notification
			v-if="projectsSummaryLoading"
			class="projects-summary-notification mb-0"
			ref="projectsSummaryLoading"
			:closable="false"
		/>

		<div class="level-left " ref="projectsSummary">
			<div
				v-for="{id, name, target} in projectsSummary"
				class="level-item has-text-centered"
				:key="id"
			>
				<div class="box">
					<p class="heading">{{ normalizeText(name) }}</p>
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
			projectsSummary: [],
			projectsSummaryLoading: true,
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
				container: this.$refs.projectsSummaryLoading.$el,
			});

			await ProjectsService.getListOfProjects(
			).then((response) => {
				this.projectsSummary = response.data;
			}).catch((e) => {
				Notification(`Projects ${e}`, "is-danger");
			});

			this.projectsSummaryLoading = false;
			loadingComponent.close();
		},
	},
};
</script>

<style lang="scss">
.projects-summary-notification {
	background-color: transparent;
	padding: 2rem;

	.loading-background {
		background: none;
	}
}
</style>
