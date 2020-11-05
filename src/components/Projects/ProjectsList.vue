<template>
	<div>
		<h2 class="title">Projects</h2>
		<Modal
			:active="projectModal.isOpened"
			:can-cancel="true"
			:header="projectModal.isEditing ? 'Edit project' : 'Create new project'"
			@close="closeProjectModal"
		>
			<ProjectForm
				close-button
				:formModel="projectModel"
				:submit-button-label="projectModal.isEditing ? 'Update' : 'Create'"
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
					<ActionButton icon="search" type="is-info" />
					<ActionButton icon="trash" type="is-danger" />
					<ActionButton icon="copy" type="is-dark" />
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumnsFromData } from "@/utils/datagrid";
import { Toast } from "@/utils/UI.js";
import AssistancesService from "@/services/AssistancesService";
import ProjectsService from "@/services/ProjectsService";
import HomeService from "@/services/HomeService";
import SectorsService from "@/services/SectorsService";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import ActionButton from "@/components/ActionButton";
import ProjectForm from "@/components/Projects/ProjectForm";

export default {
	name: "ProjectsList",

	components: {
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
					"id",
					"name",
					"donorIds",
					"startDate",
					"endDate",
					"target",
					"numberOfHouseholds",
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			projectModal: {
				isOpened: false,
				isEditing: true,
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
					this.table.columns = generateColumnsFromData(
						response.data,
						this.table.visibleColumns,
					);
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
			};

			const {
				name,
				sectorIds: selectedSectors,
				donorIds: selectedDonors,
				target: totalTarget,
				notes,
			} = this.table.data.find((item) => item.id === id);

			this.projectModel = {
				...this.projectModel,
				id,
				name,
				internalId: id,
				selectedSectors,
				startDate: new Date("DD/MMM/YY"),
				endDate: new Date("DD/MMM/YY"),
				selectedDonors,
				selectedTargetType: [],
				totalTarget,
				notes,
			};
		},

		addNewProject() {
			this.projectModal = {
				isEditing: false,
				isOpened: true,
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
				selectedSectors: sectorIds,
				startDate,
				endDate,
				selectedDonors: donorIds,
				selectedTargetType: targetType,
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
				sectorIds,
				donorIds,
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
				}
			});
		},

		async updateProject(id, projectBody) {
			await ProjectsService.updateProject(id, projectBody).then((response) => {
				if (response.status === 200) {
					Toast("Project Successfully Updated", "is-success");
				}
			});
		},

		closeProjectModal() {
			this.projectModal.isOpened = false;
		},

		goToDetail(item) {
			this.$router.push({ name: "Project", params: { projectId: item.id } });
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
