<template>
	<v-container fluid>
		<div class="d-flex mb-4">
			<h2 class="me-auto">{{ $t('Projects') }}</h2>

			<v-btn
				:to="{ name: 'AddProject' }"
				color="primary"
				prepend-icon="plus"
				class="text-none ml-0"
			>
				{{ $t('New') }}
			</v-btn>
		</div>

		<ProjectsList
			ref="projectsList"
			@showDetail="onShowDetail"
			@showEdit="onShowEdit"
			@delete="onProjectDelete"
		/>
	</v-container>
</template>

<script>
import { mapState } from "vuex";
import ProjectService from "@/services/ProjectService";
import ProjectsList from "@/components/Projects/ProjectsList";
import permissions from "@/mixins/permissions";
import { Notification } from "@/utils/UI";

export default {
	name: "Projects",

	components: {
		ProjectsList,
	},

	mixins: [permissions],

	computed: {
		...mapState(["country"]),
	},

	methods: {
		onShowEdit(id) {
			this.$router.push({
				name: "ProjectEdit",
				params: { projectId: id },
			});
		},

		onShowDetail(id) {
			this.$router.push({
				name: "ProjectDetail",
				params: { projectId: id },
			});
		},

		async onProjectDelete(id) {
			await ProjectService.deleteProject(id).then((response) => {
				if (response.status === 204) {
					Notification(this.$t("Project Successfully Deleted"), "success");
					this.$refs.projectsList.removeFromList(id);
				}
			}).catch((e) => {
				Notification(`${this.$t("Project")} ${e.message || e}`, "error");
			});
		},
	},
};
</script>
