<template>
	<div>
		<Modal
			can-cancel
			header="Assistance Detail"
			:active="assistanceModal.isOpened"
			@close="closeAssistanceModal"
		>
			<AssistanceForm
				close-button
				:formModel="assistanceModel"
				:editing="assistanceModal.isEditing"
				@formClosed="closeAssistanceModal"
				@formSubmitted="editAssistance"
			/>
		</Modal>
		<h2 class="title">Project assistances</h2>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="goToAddAssistance"
		>
			New
		</b-button>
		<div class="columns">
			<Search class="column is-two-fifths" @search="onSearch" />
			<ExportButton
				class="column"
				type="is-success"
				size="is-default"
				space-between
				:formats="{ xlsx: true, csv: true, ods: true}"
				@exportData="exportAssistance"
			/>
		</div>
		<b-progress :value="table.progress" format="percent" />
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			@clicked="goToValidateAndLock"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
		>
			<template v-for="column in table.columns">
				<b-table-column
					sortable
					v-bind="column"
					:key="column.id"
					v-slot="props"
				>
					<ColumnField :data="props" :column="column" />
				</b-table-column>
			</template>
			<b-table-column
				v-slot="props"
				label="Actions"
				centered
				width="230"
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-info"
						tooltip="Show Detail"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						tooltip="Edit"
						@click.native="showEdit(props.row.id)"
					/>
					<ActionButton
						icon="lock"
						type="is-danger"
						tooltip="Lock"
						@click.native="goToValidateAndLockWithId(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Project"
						tooltip="Delete"
						:id="props.row.id"
						@submitted="removeAssistance"
					/>
					<ActionButton
						icon="copy"
						type="is-dark"
						tooltip="Print"
						@click.native="printAssistance(props.row.id)"
					/>
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import ActionButton from "@/components/ActionButton";
import ExportButton from "@/components/ExportButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import AssistanceForm from "@/components/Assistance/AssistanceForm";
import Modal from "@/components/Modal";
import Search from "@/components/Search";
import AssistancesService from "@/services/AssistancesService";
import LocationsService from "@/services/LocationsService";
import { Toast, Notification } from "@/utils/UI";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import grid from "@/mixins/grid";

export default {
	name: "AssistancesList",

	components: {
		Search,
		AssistanceForm,
		Table,
		ActionButton,
		SafeDelete,
		ColumnField,
		ExportButton,
		Modal,
	},

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "id",
						label: "Assistance ID",
					},
					{ key: "name" },
					{
						key: "location",
						label: "Location",
					},
					{
						key: "beneficiaries",
						label: "Beneficiaries",
					},
					{
						key: "dateDistribution",
						label: "Date Of Distribution",
						type: "date",
					},
					{ key: "target" },
					{
						key: "commodity",
						label: "Commodity",
					},
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
				progress: null,
			},
			assistanceModal: {
				isOpened: false,
				isEditing: false,
			},
			assistanceModel: {
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
				dateDistribution: new Date(),
				target: "",
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	computed: {
		...mapState(["perPage"]),
	},

	methods: {
		...mapActions(["addAssistanceToState"]),

		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await AssistancesService.getListOfProjectAssistances(
				this.$route.params.projectId,
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.table.progress = 0;
				this.table.total = totalCount;
				if (totalCount !== 0) {
					this.table.data = await this.prepareDataForTable(data);
				}
			}).catch((e) => {
				Notification(`Assistance ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		async prepareDataForTable(data) {
			const filledData = [];
			const locationIds = [];
			const assistanceIds = [];
			const commodityIds = [];
			let promise = data.map(async (item, key) => {
				filledData[key] = item;
				filledData[key].target = normalizeText(item.target);
				locationIds.push(item.locationId);
				assistanceIds.push(item.id);
				commodityIds.push(item.commodityIds);
			});
			const locations = await this.getLocations(locationIds);
			const commodities = await this.getCommodities(assistanceIds);
			const statistics = await this.getStatistics(assistanceIds);

			await Promise.all(promise);
			promise = data.map(async (item, key) => {
				filledData[key] = item;
				filledData[key].location = await this.prepareLocation(item.locationId, locations);
				filledData[key].commodity = await this.prepareCommodity(item.id, commodities);
				filledData[key].beneficiaries = await this.prepareBeneficiaries(item.id, statistics);
				filledData[key].target = normalizeText(item.target);
			});

			await Promise.all(promise);
			this.table.progress = 100;
			return filledData;
		},

		async getLocations(ids) {
			return LocationsService.getLocations(ids)
				.then(({ data }) => {
					this.table.progress += 5;
					return data;
				})
				.catch((e) => {
					Notification(`Locations ${e}`, "is-danger");
				});
		},

		async getCommodities(ids) {
			return AssistancesService.getCommodities(ids)
				.then(({ data }) => {
					this.table.progress += 5;
					return data;
				})
				.catch((e) => {
					Notification(`Commodities ${e}`, "is-danger");
				});
		},

		async getStatistics(ids) {
			return AssistancesService.getStatistics(ids)
				.then(({ data }) => {
					this.table.progress += 5;
					return data;
				})
				.catch((e) => {
					Notification(`Commodities ${e}`, "is-danger");
				});
		},

		async prepareLocation(id, locations) {
			if (!locations) return "";
			const location = await locations.find((item) => item.id === id);
			this.table.progress += 1;
			return location ? location.adm.name : "";
		},

		async prepareCommodity(id, commodities) {
			if (!commodities) return "";
			const commodity = await commodities.find((item) => item.id === id);
			this.table.progress += 1;
			return commodity ? commodity.modalityType : "";
		},

		async prepareBeneficiaries(id, statistics) {
			if (!statistics) return "";
			const assistanceStatistic = await statistics.find((item) => item.id === id);
			this.table.progress += 1;
			return assistanceStatistic ? assistanceStatistic.numberOfBeneficiaries : 0;
		},

		async removeAssistance(id) {
			await AssistancesService.removeAssistance(id).then((response) => {
				if (response.status === 204) {
					Toast("Assistance Successfully Deleted", "is-success");
					this.fetchData();
				}
			}).catch((e) => {
				Notification(`Assistance ${e}`, "is-danger");
			});
		},

		async printAssistance(id) {
			await AssistancesService.printAssistance(id).then((response) => {
				if (response.status === 200) {
					Toast("Download starting", "is-success");
				}
			}).catch((e) => {
				Notification(`Assistance ${e}`, "is-danger");
			});
		},

		goToAddAssistance() {
			this.$router.push({ name: "AddAssistance", params: { projectId: this.$route.params.projectId } });
		},

		goToValidateAndLockWithId(id) {
			const assistance = this.table.data.find((item) => item.id === id);
			this.goToValidateAndLock(assistance);
		},

		goToValidateAndLock(assistance) {
			this.addAssistanceToState(assistance);
			this.$router.push({ name: "Assistance",
				params: {
					assistanceId: assistance.id,
				},
			});
		},

		showDetailWithId(id) {
			this.assistanceModel = this.mapToFormModel(this.table.data.find((item) => item.id === id));
			this.assistanceModal = {
				isOpened: true,
				isEditing: false,
			};
		},

		showEdit(id) {
			this.assistanceModel = this.mapToFormModel(this.table.data.find((item) => item.id === id));
			this.assistanceModal = {
				isOpened: true,
				isEditing: true,
			};
		},

		mapToFormModel(
			{
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
				id,
				commodityIds,
				dateDistribution,
				name,
				projectId,
				target,
				type,
			},
		) {
			return {
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
				dateDistribution: new Date(dateDistribution),
				target,
				id,
				commodityIds,
				name,
				projectId,
				type,
			};
		},

		closeAssistanceModal() {
			this.assistanceModal.isOpened = false;
		},

		async editAssistance(body) {
			await AssistancesService.updateAssistance(body.id, body).then((response) => {
				if (response.status === 200) {
					Toast("Assistance Successfully Updated", "is-success");
					this.fetchData();
				}
			}).catch((e) => {
				Notification(`Assistance ${e}`, "is-danger");
			});
		},

		exportAssistance(format) {
			// TODO Export assistance
			console.log(format);
		},
	},
};
</script>
