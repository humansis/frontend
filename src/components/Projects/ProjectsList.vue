<template>
	<div>
		<h2 class="title">Projects</h2>

		<Modal
			:active="projectModal.isOpened"
			:can-cancel="true"
			:header="projectModal.isEditing ? 'Edit project' : 'Create new project'"
			@close="closeProjectModal"
		>
			<template v-slot:content>
				<form @submit.prevent="submitProjectForm">
					<section class="modal-card-body">
						<b-field label="Project Name">
							<b-input v-model="project.name"></b-input>
						</b-field>

						<b-field label="Internal ID">
							<b-input v-model="project.internalId"></b-input>
						</b-field>

						<b-field label="Sectors">
							<b-select v-model="project.selectedSector" placeholder="Sectors">
								<option
									v-for="sector in project.sectors"
									:value="sector.value"
									:key="sector.value">
									{{ sector.label }}
								</option>
							</b-select>
						</b-field>

						<b-field label="Start date">
							<b-datepicker
								v-model="project.startDate"
								show-week-number
								locale="en-GB"
								placeholder="Click to select..."
								icon="calendar-day"
								trap-focus>
							</b-datepicker>
						</b-field>

						<b-field label="Start end">
							<b-datepicker
								v-model="project.endDate"
								show-week-number
								locale="en-US"
								placeholder="Click to select..."
								icon="calendar-day"
								trap-focus>
							</b-datepicker>
						</b-field>

						<b-field label="Donors">
							<b-select v-model="project.selectedDonor" placeholder="Donors">
								<option
									v-for="donor in project.donors"
									:value="donor.value"
									:key="donor.value"
								>
									{{ donor.label }}
								</option>
							</b-select>
						</b-field>

						<b-field label="Target Type">
							<b-select v-model="project.selectedTargetType" placeholder="Target Types">
								<option
									v-for="targetType in project.targetTypes"
									:value="targetType.value"
									:key="targetType.value"
								>
									{{ targetType.label }}
								</option>
							</b-select>
						</b-field>

						<b-field label="Total Target">
							<b-numberinput v-model="project.totalTarget" :min="0" />
						</b-field>

						<b-field label="Notes">
							<b-input v-model="project.notes" type="textarea"></b-input>
						</b-field>

					</section>

					<footer class="modal-card-foot">
						<button class="button" type="button" @click="closeProjectModal">
							Close
						</button>
						<b-button tag="input"
							class="is-success"
							native-type="submit"
							:value="projectModal.isEditing ? 'Update' : 'Create'" />
					</footer>
				</form>

			</template>
		</Modal>

		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="createProject"
		>
			New
		</b-button>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search..."
						type="search"
						icon="search">
					</b-input>
				</b-field>
			</div>
		</div>

		<b-table
			:data="tableData"
			:paginated="true"
			:per-page="'15'"
			:current-page="1"
			:pagination-simple="false"
			:pagination-position="'bottom'"
			:default-sort-direction="'asc'"
			:sort-icon="'arrow-up'"
			:sort-icon-size="'is-small'"
			:striped="true"
			:hoverable="true"
			default-sort="id"
			aria-next-label="Next page"
			aria-previous-label="Previous page"
			aria-page-label="Page"
			aria-current-label="Current page"
			selectable
			@dblclick="goToDetail"
		>
			<template v-for="column in tableColumns">
				<b-table-column
					v-bind="column"
					:key="column.id"
				>
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>

			<b-table-column
				label="Actions"
				v-slot="props"
			>
				<div class="block">
					<button @click.prevent="editProject(props.row.id)" class="button is-light">
						<b-icon
							icon="edit"
							type="is-link"
							size="is-medium"
						/>
					</button>
					<button class="button is-light">
						<b-icon
							icon="search"
							type="is-info"
							size="is-medium"
						/>
					</button>
					<button class="button is-light">
						<b-icon
							icon="trash"
							type="is-danger"
							size="is-medium"
						/>
					</button>
					<button class="button is-light">
						<b-icon
							icon="copy"
							type="is-dark"
							size="is-medium"
						/>
					</button>
				</div>
			</b-table-column>

		</b-table>
	</div>
</template>

<script>
import { fetcher } from "@/utils/fetcher";
import { generateColumnsFromData } from "@/utils/datagrid";
import Modal from "@/components/Modal";

export default {
	name: "ProjectsList",

	components: {
		Modal,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			tableData: [],
			tableColumns: [],
			projectModal: {
				isOpened: false,
				isEditing: true,
			},
			isProjectModalOpened: false,
			project: {
				name: "",
				internalId: "",
				sectors: [],
				selectedSector: [],
				startDate: new Date(),
				endDate: new Date(),
				donors: [],
				selectedDonor: [],
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
				const loadingComponent = this.$buefy.loading.open({
					container: this.$refs.projectsList,
				});

				this.tableData = [];
				this.tableColumns = [];

				const { data } = await fetcher({ uri: "projects", auth: true });

				this.tableData = data;
				this.tableColumns = generateColumnsFromData(data);

				const sectors = await fetcher({ uri: "sectors", auth: true });
				this.project.sectors = sectors.data;

				const donors = await fetcher({ uri: "donors", auth: true });
				this.project.donors = donors.data;

				const targetTypes = await fetcher({ uri: "target-types", auth: true });
				this.project.targetTypes = targetTypes.data;

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

		goToDetail(item) {
			console.log("detail");
			this.$router.push({ name: "Project", params: { projectId: item.id } });
		},

		editProject(id) {
			this.projectModal.isEditing = true;
			this.projectModal.isOpened = true;
			const project = this.tableData.find((item) => item.id === id);
			this.project.name = project.name;
			this.project.internalId = project.internal_id;
			this.project.selectedSector = project.selected_sector;
			this.project.startDate = new Date();
			this.project.endDate = new Date();
			this.project.selectedDonor = project.selected_donor;
			this.project.selectedTargetType = project.selected_target_type;
			this.project.totalTarget = project.total_target;
			this.project.selectedTargetType = project.target_type;
			this.project.notes = project.notes;
		},

		createProject() {
			this.projectModal.isEditing = false;
			this.projectModal.isOpened = true;

			this.project.name = "";
			this.project.internalId = "";
			this.project.selectedSector = "";
			this.project.startDate = new Date();
			this.project.endDate = new Date();
			this.project.selectedDonor = "";
			this.project.selectedTargetType = "";
			this.project.totalTarget = "";
			this.project.notes = "";
		},

		closeProjectModal() {
			this.projectModal.isOpened = false;
		},

		submitProjectForm(id = null) {
			if (this.projectModal.isEditing && id) {
				// update item
			} else {
				const newProject = {
					beneficiaries_reached: 0,
					donors: this.project.selectedDonor,
					end_date: this.project.endDate,
					id: Math.floor(Math.random() * 200) + 1,
					name: this.project.name,
					number_of_households: 0,
					project_permissions: "CRUD",
					sectors: this.project.selectedSector,
					start_date: this.project.startDate,
					total_target: this.project.totalTarget,
					target_type: this.project.selectedTargetType,
				};

				this.tableData.push(newProject);
			}
		},

	},
};
</script>
