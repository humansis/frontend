<template>
	<div>
		<h2 class="title">Projects</h2>
		<Modal
			:active="projectModal.isOpened"
			:can-cancel="true"
			:header="projectModal.isEditing ? 'Edit project' : 'Create new project'"
			@close="closeProjectModal"
		>
			<form @submit.prevent="submitProjectForm">
				<section class="modal-card-body">
					<b-field label="Project Name">
						<b-input v-model="project.name" />
					</b-field>

					<b-field label="Internal ID">
						<b-input v-model="project.internalId" />
					</b-field>

					<b-field label="Sectors">
						<b-tag
							v-for="selectedSector in project.selectedSectors"
							:key="selectedSector"
							type="is-success"
							closable
						>
							{{ selectedSector }}
						</b-tag>
						<b-dropdown
							v-model="project.selectedSectors"
							multiple
						>
							<button class="button is-primary is-light" type="button" slot="trigger">
								<span>Select sectors</span>
								<b-icon icon="chevron-circle-down"></b-icon>
							</button>
							<b-dropdown-item
								v-for="{code, value} in sectors"
								:value="value"
								:key="value"
							>
								<span>{{ code }}</span>
							</b-dropdown-item>
						</b-dropdown>
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
						<b-tag
							v-for="selectedDonor in project.selectedDonors"
							:key="selectedDonor"
							type="is-success"
							closable
						>
							{{ selectedDonor }}
						</b-tag>
						<b-dropdown
							v-model="project.selectedDonors"
							multiple
						>
							<button class="button is-primary is-light" type="button" slot="trigger">
								<span>Select donors</span>
								<b-icon icon="chevron-circle-down"></b-icon>
							</button>
							<b-dropdown-item
								v-for="{id, shortname} in donors"
								:value="id"
								:key="id"
							>
								<span>{{ shortname }}</span>
							</b-dropdown-item>
						</b-dropdown>
					</b-field>

					<b-field label="Target Type">
						<b-tag
							v-for="selectedTargetType in project.selectedTargetTypes"
							:key="selectedTargetType"
							type="is-success"
							closable
						>
							{{ selectedTargetType }}
						</b-tag>
						<b-dropdown
							v-model="project.selectedTargetTypes"
							multiple
						>
							<button class="button is-primary is-light" type="button" slot="trigger">
								<span>Select target types</span>
								<b-icon icon="chevron-circle-down"></b-icon>
							</button>
							<b-dropdown-item
								v-for="{code, value} in targetTypes"
								:value="value"
								:key="value"
							>
								<span>{{ code }}</span>
							</b-dropdown-item>
						</b-dropdown>
					</b-field>

					<b-field label="Total Target">
						<b-numberinput v-model="project.totalTarget" min="0" />
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
			visibleColumns: [
				"id",
				"name",
				"donorIds",
				"startDate",
				"endDate",
				"target",
				"numberOfHouseholds",
			],
			sectors: [],
			donors: [],
			targetTypes: [],
			project: {
				name: "",
				internalId: "",
				selectedSectors: [],
				startDate: new Date(),
				endDate: new Date(),
				selectedDonors: [],
				selectedTargetTypes: [],
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

				const { data } = await fetcher({ uri: "projects?page=1&size=15&sort=asc", auth: true });

				this.tableData = data[0].data;
				this.tableColumns = generateColumnsFromData(this.tableData, this.visibleColumns);

				const sectors = await fetcher({ uri: "sectors/CODE/subsectors", auth: true });
				this.sectors = sectors.data.data;

				const donors = await fetcher({ uri: "donors", auth: true });
				this.donors = donors.data.data;

				const targetTypes = await fetcher({ uri: "assistances/targets", auth: true });
				this.targetTypes = targetTypes.data.data;

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
			this.$router.push({ name: "Project", params: { projectId: item.id } });
		},

		editProject(id) {
			this.projectModal = {
				isEditing: true,
				isOpened: true,
			};

			console.log(this.tableData.find((item) => item.id === id));

			const {
				name,
				id: internalId,
				sectorIds: selectedSectors,
				donorIds: selectedDonors,
				target: totalTarget,
				notes,
			} = this.tableData.find((item) => item.id === id);

			this.project = {
				name,
				internalId,
				selectedSectors,
				startDate: new Date("DD/MMM/YY"),
				endDate: new Date("DD/MMM/YY"),
				selectedDonors,
				selectedTargetTypes: [],
				totalTarget,
				notes,
			};
		},

		addNewProject() {
			this.projectModal = {
				isEditing: false,
				isOpened: true,
			};

			this.project = {
				name: "",
				internalId: "",
				sectors: [],
				selectedSectors: [],
				startDate: new Date(),
				endDate: new Date(),
				donors: [],
				selectedDonors: [],
				targetTypes: [],
				selectedTargetTypes: [],
				totalTarget: 0,
				notes: "",
			};
		},

		closeProjectModal() {
			this.projectModal.isOpened = false;
		},

		submitProjectForm(id = null) {
			if (this.projectModal.isEditing && id) {
				// TODO update item
			} else {
				// TODO put new item
			}

			this.closeProjectModal();
		},

	},
};
</script>
