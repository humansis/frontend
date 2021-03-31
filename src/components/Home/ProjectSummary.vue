<template>
	<div class="mb-6">
		<h2 class="title">{{ $t('Projects Summary') }}</h2>
		<b-notification
			v-if="projectSummaryLoading"
			class="projects-summary-notification mb-0"
			ref="projectSummaryLoading"
			:closable="false"
		/>
		<div class="level-left">
			<div
				v-for="{id, name, target} in projectSummary"
				class="level-item has-text-centered"
				:key="id"
			>
				<div class="box">
					<p class="heading">{{ $t(normalizeText(name)) }}</p>
					<p class="subtitle is-4">{{ target }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ProjectService from "@/services/ProjectService";
import { normalizeProjectName } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "ProjectSummary",

	data() {
		return {
			projectSummaryLoading: true,
			projectSummary: [],
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
				container: this.$refs.projectSummaryLoading.$el,
			});

			await ProjectService.getListOfProjects(
			).then((response) => {
				this.projectSummary = response.data;
			}).catch((e) => {
				Notification(`${this.$t("Projects")} ${e}`, "is-danger");
			});

			this.projectSummaryLoading = false;
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
