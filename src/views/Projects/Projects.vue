<template>
	<v-container fluid>
		<div class="d-flex mb-4">
			<h2 class="me-auto" data-cy="page-title-text">{{ $t('Projects') }}</h2>

			<ButtonAction
				:required-permissions="PERMISSIONS.PROJECT_MANAGEMENT_MANAGE"
				:to="{ name: ROUTER.ROUTE_NAME.PROJECTS.ADD }"
				:is-only-icon="false"
				color="primary"
				icon="plus"
				label="New"
			/>
		</div>

		<ProjectsList
			ref="projectsList"
			@showDetail="(id) => $router.push(getProjectDetailPage(id))"
			@showEdit="(id) => $router.push(getProjectEditPage(id))"
			@delete="onProjectDelete"
		/>
	</v-container>
</template>

<script>
import { mapState } from "vuex";
import ProjectService from "@/services/ProjectService";
import ButtonAction from "@/components/ButtonAction";
import ProjectsList from "@/components/Projects/ProjectsList";
import permissions from "@/mixins/permissions";
import routerHelper from "@/mixins/routerHelper";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ROUTER } from "@/consts";

export default {
	name: "Projects",

	components: {
		ButtonAction,
		ProjectsList,
	},

	mixins: [permissions, routerHelper],

	data() {
		return {
			ROUTER,
		};
	},

	computed: {
		...mapState(["country"]),
	},

	methods: {
		async onProjectDelete(id) {
			try {
				const {
					status,
					message,
				} = await ProjectService.deleteProject(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Project Successfully Deleted"), "success");
				this.$refs.projectsList.removeFromList(id);
			} catch (e) {
				Notification(`${this.$t("Project")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
