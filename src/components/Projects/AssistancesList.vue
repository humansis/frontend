<template>
	<Table
		has-reset-sort
		:title="upcoming ? 'Upcoming Assistances' : ''"
		:has-search="!upcoming"
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		@clicked="onRowClick"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
		@search="onSearch"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				:sortable="column.sortable"
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
			:visible="!upcoming"
		>
			<div class="buttons is-right">
				<ActionButton
					v-if="!props.row.validated"
					icon="search"
					type="is-primary"
					tooltip="Edit"
					@click.native="showEdit(props.row.id)"
				/>
				<ActionButton
					v-if="!props.row.validated"
					icon="edit"
					tooltip="Update"
					@click.native="goToUpdate(props.row.id)"
				/>
				<ActionButton
					v-if="props.row.validated && !props.row.completed"
					icon="lock"
					type="is-warning"
					tooltip="Update"
					@click.native="goToDetail(props.row.id)"
				/>
				<ActionButton
					v-if="props.row.completed"
					icon="check"
					type="is-success"
					tooltip="View"
					@click.native="goToDetail(props.row.id)"
				/>
				<SafeDelete
					v-if="!props.row.validated"
					icon="trash"
					entity="Assistance"
					tooltip="Delete"
					:id="props.row.id"
					@submitted="$emit('onRemove', $event)"
				/>
				<ActionButton
					icon="copy"
					type="is-dark"
					tooltip="Duplicate"
				/>
			</div>
		</b-table-column>
		<template v-if="!upcoming" #export>
			<ExportButton
				type="is-primary"
				space-between
				:formats="{ xlsx: true, csv: true, ods: true}"
				@exportData="exportAssistance"
			/>
		</template>
		<template #progress>
			<b-progress :value="table.progress" format="percent" />
		</template>
	</Table>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import ActionButton from "@/components/ActionButton";
import ExportButton from "@/components/ExportButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import AssistancesService from "@/services/AssistancesService";
import LocationsService from "@/services/LocationsService";
import { Notification } from "@/utils/UI";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import grid from "@/mixins/grid";
import baseHelper from "@/mixins/baseHelper";

export default {
	name: "AssistancesList",

	components: {
		Table,
		ActionButton,
		SafeDelete,
		ColumnField,
		ExportButton,
	},

	props: {
		upcoming: Boolean,
	},

	mixins: [grid, baseHelper],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", label: "Assistance ID", sortable: true },
					{ key: "name", sortable: true },
					{ key: "location", label: "Location", sortable: true },
					{ key: "beneficiaries", label: "Beneficiaries", sortable: true, sortKey: "bnfCount" },
					{ key: "dateDistribution", label: "Date Of Distribution", type: "date", sortable: true, sortKey: "date" },
					{ key: "target", sortable: true },
					{ key: "commodity", label: "Commodity", type: "commodity" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
				progress: null,
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

			this.table.columns = generateColumns(this.table.visibleColumns);
			if (this.upcoming) {
				await this.fetchUpcomingAssistances();
			} else {
				await this.fetchProjectAssistances();
			}
			this.isLoadingList = false;
		},

		async fetchProjectAssistances() {
			await AssistancesService.getListOfProjectAssistances(
				this.$route.params.projectId,
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;
				if (totalCount > 0) {
					await this.prepareDataForTable(data);
				}
			}).catch((e) => {
				Notification(`Assistance ${e}`, "is-danger");
			});
		},

		async fetchUpcomingAssistances() {
			await AssistancesService.getListOfAssistances(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				true,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.total = totalCount;
				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			}).catch((e) => {
				Notification(`Upcoming Assistances ${e}`, "is-danger");
			});
		},

		prepareDataForTable(data) {
			this.table.progress += 15;
			const locationIds = [];
			const assistanceIds = [];
			data.forEach((item, key) => {
				locationIds.push(item.locationId);
				assistanceIds.push(item.id);
				this.table.data[key] = item;
				this.table.data[key].target = normalizeText(item.target);
			});
			this.table.progress += 10;

			this.prepareLocationForTable(locationIds);

			this.prepareCommodityForTable(assistanceIds);

			this.prepareStatisticsForTable(assistanceIds);
		},

		async prepareStatisticsForTable(assistanceIds) {
			const statistics = await this.getStatistics(assistanceIds);
			this.table.progress += 15;
			this.table.data.forEach((item, key) => {
				this.table.data[key].beneficiaries = this.prepareEntityForTable(item.id, statistics, "numberOfBeneficiaries", 0);
			});
			this.table.progress += 10;
		},

		async prepareCommodityForTable(assistanceIds) {
			const commodities = await this.getCommodities(assistanceIds);
			this.table.progress += 15;
			this.table.data.forEach((item, key) => {
				this.table.data[key].commodity = this.prepareEntityForTable(item.id, commodities, "modalityType");
			});
			this.table.progress += 10;
		},

		async prepareLocationForTable(locationIds) {
			const locations = await this.getLocations(locationIds);
			this.table.progress += 15;
			this.table.data.forEach((item, key) => {
				this.table.data[key].location = this
					.prepareLocationEntityForTable(item.locationId, locations);
			});
			this.table.progress += 10;
		},

		async getLocations(ids) {
			if (!ids.length) return [];
			return LocationsService.getLocations(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`Locations ${e}`, "is-danger");
				});
		},

		async getCommodities(ids) {
			if (!ids.length) return [];
			return AssistancesService.getCommodities(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`Commodities ${e}`, "is-danger");
				});
		},

		async getStatistics(ids) {
			if (!ids.length) return [];
			return AssistancesService.getStatistics(ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`Statistics ${e}`, "is-danger");
				});
		},

		goToDetail(id) {
			this.$router.push({
				name: "AssistanceDetail",
				params: {
					assistanceId: id,
				},
			});
		},

		onRowClick({ id }) {
			this.showDetailWithId(id);
		},

		goToUpdate(id) {
			const assistance = this.table.data.find((item) => item.id === id);

			if (this.upcoming) {
				this.showDetail(assistance);
			} else {
				this.$router.push({
					name: "Assistance",
					params: {
						assistanceId: assistance.id,
					},
				});
			}
		},

		exportAssistance(format) {
			// TODO Export assistance
			console.log(format);
		},
	},
};
</script>
