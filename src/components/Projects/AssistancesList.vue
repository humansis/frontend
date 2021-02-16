<template>
	<div>
		<Table
			has-reset-sort
			:has-search="!upcoming"
			:key="resetSortKey"
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
						entity="Assistance"
						tooltip="Delete"
						:id="props.row.id"
						@submitted="$emit('onRemove', $event)"
					/>
					<ActionButton
						icon="copy"
						type="is-dark"
						tooltip="Print"
						@click.native="$emit('onPrint', props.row.id)"
					/>
				</div>
			</b-table-column>
			<template v-if="!upcoming" slot="export">
				<div class="column is-two-fifths">
					<ExportButton
						type="is-success"
						size="is-default"
						space-between
						:formats="{ xlsx: true, csv: true, ods: true}"
						@exportData="exportAssistance"
					/>
				</div>
			</template>
			<template slot="progress">
				<b-progress :value="table.progress" format="percent" />
			</template>
		</Table>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import ActionButton from "@/components/ActionButton";
import ExportButton from "@/components/ExportButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import { getCommodities, getLocations, getStatistics } from "@/mappers/assistanceMapper";
import grid from "@/mixins/grid";
import { prepareEntityForTable } from "@/mappers/baseMapper";

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

	mixins: [grid],

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
					{ key: "commodity", label: "Commodity" },
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

	mounted() {
		this.fetchData();
	},

	methods: {
		...mapActions(["addAssistanceToState"]),

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
				this.table.progress = 0;
				this.table.total = totalCount;
				if (totalCount !== 0) {
					await this.prepareDataForTable(data);
				} else {
					this.table.data = [];
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
				this.table.total = totalCount;
				if (totalCount > 0) {
					this.prepareDataForTable(data);
				} else {
					this.table.data = [];
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
			const statistics = await getStatistics(assistanceIds);
			this.table.progress += 15;
			this.table.data.forEach((item, key) => {
				this.table.data[key].beneficiaries = prepareEntityForTable(item.id, statistics, "numberOfBeneficiaries", 0);
			});
			this.table.progress += 10;
			this.resetSortKey += 1;
		},

		async prepareCommodityForTable(assistanceIds) {
			const commodities = await getCommodities(assistanceIds);
			this.table.progress += 15;
			this.table.data.forEach((item, key) => {
				this.table.data[key].commodity = prepareEntityForTable(item.id, commodities, "modalityType");
			});
			this.table.progress += 10;
			this.resetSortKey += 1;
		},

		async prepareLocationForTable(locationIds) {
			const locations = await getLocations(locationIds);
			this.table.progress += 15;
			this.table.data.forEach((item, key) => {
				this.table.data[key].location = (prepareEntityForTable(item.locationId, locations, "adm")).name;
			});
			this.table.progress += 10;
			this.resetSortKey += 1;
		},

		goToValidateAndLockWithId(id) {
			const assistance = this.table.data.find((item) => item.id === id);
			this.onRowClick(assistance);
		},

		onRowClick(assistance) {
			if (this.upcoming) {
				this.showDetail(assistance);
			} else {
				this.addAssistanceToState(assistance);
				this.$router.push({ name: "Assistance",
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
