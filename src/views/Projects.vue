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

		<Modal
			can-cancel
			:active="projectModal.isOpened"
			:header="modalHeader"
			:is-waiting="projectModal.isWaiting"
			@close="closeProjectModal"
		>
			<ProjectForm
				close-button
				class="modal-card"
				:formModel="projectModel"
				:submit-button-label="projectModal.isEditing ? $t('Update') : $t('Create')"
				:form-disabled="projectModal.isDetail"
				@formSubmitted="submitProjectForm"
				@formClosed="closeProjectModal"
			/>
		</Modal>

		<ProjectList
			ref="projectList"
			@onShowDetail="showDetail"
			@onEdit="editProject"
			@onDelete="onProjectDelete"
		/>
	</div>
</template>

<script>
import { mapState } from "vuex";
import ProjectForm from "@/components/Projects/ProjectForm";
import Modal from "@/components/Modal";
import ProjectService from "@/services/ProjectService";
import { Toast, Notification } from "@/utils/UI.js";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import ProjectList from "@/components/Projects/ProjectsList";
import permissions from "@/mixins/permissions";

export default {
	name: "ProjectPage",

	components: {
		ProjectList,
		Modal,
		ProjectForm,
	},

	mixins: [permissions],

	data() {
		return {
			projectModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
				isWaiting: false,
			},
			projectModel: {
				id: null,
				iso3: "",
				name: "",
				internalId: "",
				sectors: [],
				selectedSectors: [],
				startDate: new Date(),
				endDate: new Date(),
				donors: [],
				selectedDonors: [],
				targetTypes: [],
				selectedTargetType: [],
				totalTarget: 0,
				notes: "",
			},
		};
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.projectModal.isDetail) {
				result = this.$t("Detail of Project");
			} else if (this.projectModal.isEditing) {
				result = this.$t("Edit Project");
			} else {
				result = this.$t("Create New Project");
			}
			return result;
		},

		...mapState(["country"]),
	},

	methods: {
		editProject(project) {
			this.projectModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
			this.mapToFormModel(project);
		},

		addNewProject() {
			this.projectModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};

			this.projectModel = {
				...this.projectModel,
				id: null,
				name: "",
				internalId: "",
				donorIds: [],
				sectors: [],
				targetTypes: [],
				selectedSectors: [],
				startDate: new Date(),
				endDate: new Date(),
				selectedDonors: [],
				selectedTargetType: [],
				totalTarget: 0,
				notes: "",
			};
		},

		closeProjectModal() {
			this.projectModal.isOpened = false;
		},

		showDetail(project) {
			this.mapToFormModel(project);
			this.projectModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel(
			{
				id,
				iso3,
				internalId,
				name,
				sectors,
				donorIds,
				target: totalTarget,
				notes,
				startDate,
				endDate,
			},
		) {
			this.projectModel = {
				...this.projectModel,
				id,
				iso3,
				name,
				sectors,
				donorIds,
				internalId,
				startDate: new Date(startDate),
				endDate: new Date(endDate),
				targetType: [],
				selectedSectors: [],
				selectedDonors: [],
				selectedTargetType: [],
				totalTarget,
				notes,
			};
		},

		submitProjectForm(projectForm) {
			const {
				id,
				iso3,
				name,
				internalId,
				selectedSectors,
				startDate,
				endDate,
				selectedDonors,
				selectedTargetType: { code: targetType },
				totalTarget: target,
				notes,
			} = projectForm;
			const projectBody = {
				iso3: iso3 || this.country.iso3,
				name,
				internalId,
				notes,
				target,
				targetType,
				numberOfHouseholds: 0,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
				sectors: getArrayOfIdsByParam(selectedSectors, "code"),
				donorIds: getArrayOfIdsByParam(selectedDonors, "id"),
			};

			if (this.projectModal.isEditing && id) {
				this.updateProject(id, projectBody);
			} else {
				this.createProject(projectBody);
			}
		},

		async createProject(projectBody) {
			this.projectModal.isWaiting = true;

			await ProjectService.createProject(projectBody).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Project Successfully Created"), "is-success");
					this.$refs.projectList.fetchData();
					this.closeProjectModal();
				}
			}).catch((e) => {
				Notification(`${this.$t("Project")} ${e}`, "is-danger");
				this.projectModal.isWaiting = false;
			});
		},

		async updateProject(id, projectBody) {
			this.projectModal.isWaiting = true;

			await ProjectService.updateProject(id, projectBody).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Project Successfully Updated"), "is-success");
					this.$refs.projectList.fetchData();
					this.closeProjectModal();
				}
			}).catch((e) => {
				Notification(`${this.$t("Project")} ${e}`, "is-danger");
				this.projectModal.isWaiting = false;
			});
		},

		async onProjectDelete(id) {
			await ProjectService.deleteProject(id).then((response) => {
				if (response.status === 204) {
					Toast(this.$t("Project Successfully Deleted"), "is-success");
					this.$refs.projectList.removeFromList(id);
				}
			}).catch((e) => {
				Notification(`${this.$t("Project")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
