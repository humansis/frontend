<template>
	<div>
		<h2 class="title">Projects</h2>
		<Modal
			:active="projectModal.isOpened"
			:can-cancel="true"
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
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search..."
						type="search"
						icon="search"
					/>
				</b-field>
			</div>
		</div>

		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="goToDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					:key="column.id"
				>
					<template v-slot="props">
						<div v-if="column.field === 'donorIds'">
							{{ props.row[column.field].length }}
						</div>
						<div v-else>
							{{ props.row[column.field] }}
						</div>
					</template>
				</b-table-column>
			</template>

			<b-table-column
				label="Actions"
				v-slot="props"
			>
				<div class="block">
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="editProject(props.row.id)"
					/>
					<ActionButton
						icon="search"
						type="is-link"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Project"
						:id="props.row.id"
						@submitted="onProjectDelete"
					/>
					<ActionButton icon="copy" type="is-dark" />
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import { Toast } from "@/utils/UI.js";
import { getArrayOfIdsByParam, getArrayOfCodeListByKey } from "@/utils/codeList";
import AssistancesService from "@/services/AssistancesService";
import ProjectsService from "@/services/ProjectsService";
import HomeService from "@/services/HomeService";
import SectorsService from "@/services/SectorsService";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import ActionButton from "@/components/ActionButton";
import ProjectForm from "@/components/Projects/ProjectForm";
import SafeDelete from "@/components/SafeDelete";

export default {
	name: "ProjectsList",

	components: {
		SafeDelete,
		Modal,
		Table,
		ActionButton,
		ProjectForm,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "id",
						label: "Id",
					},
					{
						key: "name",
						label: "Name",
					},
					{
						key: "donorIds",
						label: "Donor Ids",
					},
					{
						key: "startDate",
						label: "Start Date",
					},
					{
						key: "endDate",
						label: "End Date",
					},
					{
						key: "target",
						label: "Target",
					},
					{
						key: "numberOfHouseHolds",
						label: "Number of Households",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
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

	watch: {
		$route: "fetchData",
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

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open();

				await ProjectsService.getListOfProjects(
					this.table.currentPage,
					this.table.perPage,
					"desc",
				).then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(this.table.visibleColumns);
				});

				await SectorsService.getListOfSectors().then((response) => {
					this.projectModel.sectors = response.data;
				});

				await HomeService.getListOfDonors().then((response) => {
					this.projectModel.donors = response.data;
				});

				await AssistancesService.getListOfTargetsForAssistances().then((response) => {
					this.projectModel.targetTypes = response.data;
				});

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
		},

		editProject(id) {
			this.projectModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};

			this.mapToFormModel(this.table.data.find((item) => item.id === id));
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

		async createProject(projectBody) {
			await ProjectsService.createProject(projectBody).then((response) => {
				if (response.status === 200) {
					Toast("Project Successfully Created", "is-success");
					this.fetchData();
				}
			});
		},

		async updateProject(id, projectBody) {
			await ProjectsService.updateProject(id, projectBody).then((response) => {
				if (response.status === 200) {
					Toast("Project Successfully Updated", "is-success");
					this.fetchData();
				}
			});
		},

		async onProjectDelete(id) {
			await ProjectsService.deleteProject(id).then((response) => {
				if (response.status === 204) {
					Toast("Project Successfully Deleted", "is-success");
					this.fetchData();
				}
			});
		},

		closeProjectModal() {
			this.projectModal.isOpened = false;
		},

		showDetailWithId(id) {
			const project = this.table.data.find((item) => item.id === id);
			this.showDetail(project);
		},

		showDetail(project) {
			this.mapToFormModel(project);
			this.projectModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel({
			id,
			name,
			sectorIds,
			donorIds,
			target: totalTarget,
			notes,
		}) {
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

		goToDetail(project) {
			this.$router.push({ name: "Project", params: { projectId: project.id } });
		},

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
