<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">{{ $t('Projects') }}</h1>
			</div>

			<div class="level-right">
				<b-button
					v-if="userCan.addProject"
					type="is-primary"
					icon-left="plus"
					@click="addNewProject"
				>
					{{ $t('New') }}
				</b-button>
			</div>
		</div>

		<ProjectList
			ref="projectList"
			@showDetail="showDetail"
			@showEdit="showEdit"
			@onDelete="onProjectDelete"
		/>
	</div>
</template>

<script>
import { mapState } from "vuex";
import ProjectService from "@/services/ProjectService";
import { Toast, Notification } from "@/utils/UI.js";
import ProjectList from "@/components/Projects/ProjectsList";
import permissions from "@/mixins/permissions";

export default {
	name: "ProjectPage",

	components: {
		ProjectList,
	},

	mixins: [permissions],

	computed: {
		...mapState(["country"]),
	},

	methods: {
		showEdit(project) {
			this.$router.push({
				name: "ProjectEdit",
				params: { projectId: project.id },
			});
		},

		addNewProject() {
			this.$router.push({ name: "AddProject" });
		},

		showDetail(project) {
			this.$router.push({
				name: "ProjectDetail",
				params: { projectId: project.id },
			});
		},

		async onProjectDelete(id) {
			await ProjectService.deleteProject(id).then((response) => {
				if (response.status === 204) {
					Toast(this.$t("Project Successfully Deleted"), "is-success");
					this.$refs.projectList.removeFromList(id);
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Project")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
