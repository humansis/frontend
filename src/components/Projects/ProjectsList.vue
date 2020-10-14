<template>
	<div>
		<h2 class="title">Projects</h2>

		<Modal
			:active="modalCreateNewOpened"
			:can-cancel="true"
			header="Create new project"
			@close="closeModalCreateNew"
		>
			<template v-slot:content>
				<form @submit.prevent="submit(event)">
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
							<b-select v-model="project.selectedDonor" placeholder="Sectors">
								<option
									v-for="donor in project.donors"
									:value="donor.value"
									:key="donor.value">
									{{ donor.label }}
								</option>
							</b-select>
						</b-field>

						<b-field label="Target Type">
							<b-select v-model="project.selectedTargetType" placeholder="Sectors">
								<option
									v-for="targetType in project.targetTypes"
									:value="targetType.value"
									:key="targetType.value">
									{{ targetType.label }}
								</option>
							</b-select>
						</b-field>

						<b-field label="Total Target">
							<b-numberinput v-model="project.totalTargetBeneficiaries" :min="0"></b-numberinput>
						</b-field>

						<b-field label="Notes">
							<b-input v-model="project.notes" type="textarea"></b-input>
						</b-field>

					</section>

					<footer class="modal-card-foot">
						<button class="button" type="button" @click="closeModalCreateNew">
							Close
						</button>
						<b-button tag="input"
							class="is-success"
							native-type="submit"
							value="Create" />
					</footer>
				</form>

			</template>
		</Modal>

		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="openModalCreateNew"
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
			@select="goToDetail"
		>
			<template v-for="column in tableColumns">
				<b-table-column :key="column.id" v-bind="column">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>

			<b-table-column
				label="Actions"
			>
				<div class="block">
					<b-icon
						icon="edit"
						type="is-link"
						size="is-medium">
					</b-icon>
					<b-icon
						icon="search"
						type="is-info"
						size="is-medium">
					</b-icon>
					<b-icon
						icon="trash"
						type="is-danger"
						size="is-medium">
					</b-icon>
					<b-icon
						icon="copy"
						type="is-dark"
						size="is-medium">
					</b-icon>
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
			modalCreateNewOpened: false,
			project: {
				name: "Name of project",
				internalId: "",
				sectors: [
					{ value: 1, label: "label" },
					{ value: 2, label: "label 2" },
					{ value: 3, label: "label 3" },
				],
				selectedSector: [],
				startDate: new Date(),
				endDate: new Date(),
				donors: [
					{ value: 1, label: "label" },
					{ value: 2, label: "label 2" },
					{ value: 3, label: "label 3" },
				],
				selectedDonor: [],
				targetTypes: [
					{ value: 1, label: "activity" },
					{ value: 2, label: "distribution" },
				],
				selectedTargetType: [],
				totalTarget: 1200,
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

				const uri = "projects";
				const { data } = await fetcher({ uri, auth: true });

				this.tableData = data;
				this.tableColumns = generateColumnsFromData(data);
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

		openModalCreateNew() {
			this.modalCreateNewOpened = true;
		},

		closeModalCreateNew() {
			this.modalCreateNewOpened = false;
		},

		submit(event) {
			console.log(event);
		},

	},
};
</script>
