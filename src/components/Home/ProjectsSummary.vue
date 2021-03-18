<template>
	<div class="mb-6">
		<h2 class="title">Projects summary</h2>

		<div class="level-left">
			<div
				v-for="{id, name, target} in projectSummary"
				class="level-item has-text-centered"
				ref="projectSummary"
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
import ProjectService from "@/services/ProjectService";
import { normalizeProjectName } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "projectSummary",

	data() {
		return {
			isLoading: true,
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
				container: this.$refs.projectSummary,
			});

			await ProjectService.getListOfProjects(
			).then((response) => {
				this.projectSummary = response.data;
			}).catch((e) => {
				Notification(`Projects ${e}`, "is-danger");
			});

			loadingComponent.close();
		},
	},
};
</script>
