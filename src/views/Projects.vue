<template>
	<div>
		<h2 class="title">Projects</h2>
		<Modal
			can-cancel
			:active="projectModal.isOpened"
			:header="modalHeader"
			@close="closeProjectModal"
		>
			<ProjectForm
				close-button
				:formModel="projectModel"
				:submit-button-label="projectModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="projectModal.isDetail"
				@formSubmitted="submitProjectForm"
				@formClosed="closeProjectModal"
			/>
		</Modal>

		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewProject"
		>
			New
		</b-button>

		<ProjectsList
			ref="projectList"
			:project-model="projectModel"
			@onShowDetail="showDetail"
			@onEdit="editProject"
			@onDelete="onProjectDelete"
		/>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI.js";
import { getArrayOfIdsByParam, getArrayOfCodeListByKey } from "@/utils/codeList";
import ProjectsService from "@/services/ProjectsService";
import Modal from "@/components/Modal";
import ProjectForm from "@/components/Projects/ProjectForm";
import ProjectsList from "@/components/Projects/ProjectsList";

export default {
	name: "Projects",

	components: {
		ProjectsList,
		Modal,
		ProjectForm,
	},

	data() {
		return {
			projectModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			projectModel: {
				id: null,
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
				result = "Detail of Project";
			} else if (this.projectModal.isEditing) {
				result = "Edit Project";
			} else {
				result = "Create new Project";
			}
			return result;
		},
	},

	methods: {
		editProject(project) {
			this.projectModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};

			this.mapToFormModel(project);
		},

		addNewProject() {
			this.projectModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
			};

			this.projectModel = {
				...this.projectModel,
				id: null,
				name: "",
				internalId: null,
				selectedSectors: [],
				startDate: new Date(),
				endDate: new Date(),
				selectedDonors: [],
				selectedTargetType: [],
				totalTarget: 0,
				notes: "",
			};
		},

		submitProjectForm(projectForm) {
			const {
				id,
				name,
				selectedSectors,
				startDate,
				endDate,
				selectedDonors,
				selectedTargetType: { code: targetType },
				totalTarget: target,
				notes,
			} = projectForm;

			const projectBody = {
				iso3: "",
				name,
				notes,
				target,
				targetType,
				numberOfHouseholds: 0,
				startDate,
				endDate,
				sectorIds: getArrayOfIdsByParam(selectedSectors, "code"),
				donorIds: getArrayOfIdsByParam(selectedDonors, "id"),
			};

			if (this.projectModal.isEditing && id) {
				this.updateProject(id, projectBody);
			} else {
				this.createProject(projectBody);
			}

			this.closeProjectModal();
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
				name,
				sectorIds,
				donorIds,
				target: totalTarget,
				notes,
			},
		) {
			this.projectModel = {
				...this.projectModel,
				id,
				name,
				internalId: id,
				selectedSectors: getArrayOfCodeListByKey(sectorIds, this.projectModel.sectors, "code"),
				startDate: new Date("10.10.2020"),
				endDate: new Date("10.10.2020"),
				selectedDonors: getArrayOfCodeListByKey(donorIds, this.projectModel.donors, "id"),
				selectedTargetType: getArrayOfCodeListByKey([], this.projectModel.targetTypes, "code"),
				totalTarget,
				notes,
			};
		},

		async createProject(projectBody) {
			await ProjectsService.createProject(projectBody).then((response) => {
				if (response.status === 200) {
					Toast("Project Successfully Created", "is-success");
					this.$refs.projectList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Project) ${e}`, "is-danger");
			});
		},

		async updateProject(id, projectBody) {
			await ProjectsService.updateProject(id, projectBody).then((response) => {
				if (response.status === 200) {
					Toast("Project Successfully Updated", "is-success");
					this.$refs.projectList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Project) ${e}`, "is-danger");
			});
		},

		async onProjectDelete(id) {
			await ProjectsService.deleteProject(id).then((response) => {
				if (response.status === 204) {
					Toast("Project Successfully Deleted", "is-success");
					this.$refs.projectList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Project) ${e}`, "is-danger");
			});
		},
	},
};
</script>
