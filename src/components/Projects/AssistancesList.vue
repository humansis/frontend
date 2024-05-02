<template>
	<h2 v-if="upcoming" class="mb-4">{{ $t('Assistances') }}</h2>

	<v-alert
		v-if="isNoProjectErrorVisible"
		variant="outlined"
		type="warning"
		border="top"
		class="mb-6"
	>
		<p>{{ $t("This project does not contain any assistances") }}</p>
		<p>{{ $t("Create your first one") }}</p>
	</v-alert>

	<v-alert
		v-if="isNoBeneficiariesErrorVisible"
		variant="outlined"
		type="warning"
		border="top"
		class="mb-6"
	>
		<p>{{ $t("Please add some beneficiaries first!") }}</p>
		<p>{{ $t("Then you will be able to manage some assistances") }}</p>
	</v-alert>

	<DataGrid
		v-show="isAssistanceTableVisible"
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		:is-search-visible="!upcoming"
		:custom-key-sort="customSort"
		:no-data-text="$t('No data available')"
		is-row-click-disabled
		reset-sort-button
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
		@update:sortBy="onSort"
		@search="onSearch"
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCES)"
	>
		<template v-slot:tableControls>
			<ExportControl
				v-if="!upcoming"
				:disabled="!table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@export="onExportAssistances"
			/>

			<v-btn
				:class="filterButtonNew"
				icon-left="sticky-note"
				variant="tonal"
				prepend-icon="sticky-note"
				@click="onStatusFilter('new')"
			>
				{{ $t('New') }}
			</v-btn>

			<v-btn
				:class="filterButtonValidated"
				icon-left="spinner"
				variant="tonal"
				prepend-icon="spinner"
				@click="onStatusFilter('validated')"
			>
				{{ $t('Validated') }}
			</v-btn>

			<v-btn
				:class="filterButtonClosed"
				icon-left="check"
				variant="tonal"
				prepend-icon="check"
				@click="onStatusFilter('closed')"
			>
				{{ $t('Closed') }}
			</v-btn>
		</template>

		<template v-if="!upcoming" v-slot:actions="{ row }">
			<ButtonAction
				v-if="!row.validated && userCan.editDistribution"
				icon="edit"
				tooltip-text="Update"
				@actionConfirmed="onGoToUpdate(row.id)"
			/>

			<ButtonAction
				v-if="(row.validated || row.completed) && isAssistanceDetailAllowed"
				:icon="row.validated && row.completed ? 'eye' : 'edit'"
				:tooltip-text="row.validated && row.completed ? 'View' : 'Update'"
				@actionConfirmed="onGoToDetail(row.id)"
			/>

			<ButtonAction
				v-if="userCan.editDistribution"
				icon="search"
				tooltip-text="Details"
				@actionConfirmed="onShowEdit(row)"
			/>

			<v-menu
				transition="scale-transition"
			>
				<template v-slot:activator="{ props }">
					<v-btn
						v-bind="props"
						icon=""
						class="action-button"
					>
						<v-icon icon="ellipsis-h" />
					</v-btn>
				</template>

				<v-list>
					<v-list-item class="dropdown-actions">
						<ButtonAction
							v-if="userCan.editDistribution"
							:is-only-icon="false"
							icon="copy"
							label="Duplicate"
							button-size="small"
							@actionConfirmed="onDuplicate(row.id)"
						/>

						<ButtonAction
							v-if="userCan.editDistribution"
							:is-only-icon="false"
							:disabled="isAssistanceMoveEnable(row)"
							icon="share"
							label="Move"
							button-size="small"
							@actionConfirmed="onAssistanceMove(row.id)"
						/>

						<ButtonAction
							:disabled="!row.deletable || !userCan.deleteDistribution"
							:is-only-icon="false"
							label="Delete"
							icon="trash"
							button-size="small"
							icon-color="red"
							is-confirm-action
							confirm-title="Deleting Assistance"
							confirm-message="All distribution data will be deleted. Do you wish to continue?"
							prepend-icon="circle-exclamation"
							prepend-icon-color="red"
							@actionConfirmed="$emit('remove', row.id)"
						/>
					</v-list-item>
				</v-list>
			</v-menu>
		</template>
	</DataGrid>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeExportDate, normalizeText } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { ASSISTANCE, EXPORT, TABLE } from "@/consts";

const customSort = { progress: () => {} };
const statusTags = [
	{ code: ASSISTANCE.STATUS.NEW, class: "status new" },
	{ code: ASSISTANCE.STATUS.VALIDATED, class: "status validated" },
	{ code: ASSISTANCE.STATUS.CLOSED, class: "status closed" },
];

export default {
	name: "AssistancesList",

	emits: ["remove"],

	components: {
		ButtonAction,
		DataGrid,
		ExportControl,
	},

	mixins: [
		permissions,
		grid,
		baseHelper,
	],

	props: {
		upcoming: {
			type: Boolean,
			default: false,
		},

		beneficiariesCount: {
			type: Number,
			required: false,
			default: 0,
		},

		project: {
			type: Object,
			default: () => {},
		},

		projectLoaded: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			TABLE,
			customSort,
			exportControl: {
				loading: false,
				location: "projectAssistances",
				types: [EXPORT.ASSISTANCE_OVERVIEW],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			exportLoading: false,
			selectedFilters: ["new", "validated"],
			statusActive: {
				new: true,
				validated: true,
				closed: false,
			},
			filters: { states: ["new", "validated"] },
			isLoadingList: false,
			table: {
				data: [],
				columns: generateColumns([
					{ key: "assistanceID", title: "Assistance ID", type: "link", sortKey: "id" },
					{ key: "assistanceName", title: "Name", type: "link", sortKey: "name" },
					{ key: "status", type: "tag", customTags: statusTags, sortKey: "state" },
					{ key: "round" },
					{ key: "type", type: "assistancesType" },
					{ key: "location" },
					{ key: "target" },
					{ key: "reached", sortable: false },
					{ key: "progress" },
					{ key: "dateDistribution", title: "Date of Assistance", type: "date" },
					{ key: "dateExpiration", title: "Expiration Date" },
					{ key: "commodity", type: "svgIcon", sortable: false },
					{ key: "eloNumber", title: "ELO Number", sortable: false },
					{ key: "activity", sortable: false },
					{ key: "budgetLine", sortable: false },
					...!this.upcoming ? [{ key: "actions", value: "actions", sortable: false, minWidth: "150" }] : [],
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCES.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCES.key,
				searchPhrase: "",
				progress: null,
			},
			commodities: [],
			locations: [],
		};
	},

	computed: {
		filterButtonNew() {
			return [
				"text-none ml-3 status new",
				{ "is-selected": this.statusActive.new },
			];
		},

		filterButtonValidated() {
			return [
				"text-none ml-3 status validated",
				{ "is-selected": this.statusActive.validated },
			];
		},

		filterButtonClosed() {
			return [
				"text-none ml-3 status closed",
				{ "is-selected": this.statusActive.closed },
			];
		},

		isAssistanceDetailAllowed() {
			return this.userCan.editDistribution || this.userCan.viewDistribution;
		},

		isNoProjectErrorVisible() {
			return !this.project?.assistanceCount
				&& this.beneficiariesCount
				&& !this.isLoadingList
				&& !this.upcoming;
		},

		isNoBeneficiariesErrorVisible() {
			return !this.beneficiariesCount
				&& this.projectLoaded
				&& this.table.data
				&& !this.isLoadingList
				&& !this.upcoming;
		},

		isAssistanceTableVisible() {
			return this.beneficiariesCount || this.upcoming || this.project?.assistanceCount;
		},
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;
			this.table.progress = null;

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
				this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "",
				this.table.searchPhrase,
				this.filters,
			).then(async ({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;
				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			}).catch((e) => {
				Notification(`${this.$t("Assistance")} ${e.message || e}`, "error");
			});
		},

		async fetchUpcomingAssistances() {
			await AssistancesService.getListOfAssistances(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "",
				true,
				null,
				this.filters,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;
				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			}).catch((e) => {
				Notification(`${this.$t("Upcoming Assistances")} ${e.message || e}`, "error");
			});
		},

		prepareDataForTable(data) {
			this.table.progress += 15;
			data.forEach((item, key) => {
				const roundIsNaN = Number.isNaN(parseInt(item.round, 10));
				this.table.data[key] = item;
				this.table.data[key].dateDistribution = `${item.dateDistribution}`;
				this.table.data[key].type = this.$t(normalizeText(item.type));
				this.table.data[key].target = this.$t(normalizeText(item.target));
				this.table.data[key].round = roundIsNaN ? this.$t("N/A") : item.round;
				this.table.data[key].status = item.state.code;
				this.table.data[key].reached = this.reachedTextFormat(item);
				this.table.data[key].progress = this.assistanceProgress(item);
			});
			this.table.progress += 10;

			this.prepareLocationForTable();
			this.prepareCommodityForTable();
			this.prepareStatisticsForTable();
			this.prepareRowClickForTable();
		},

		prepareStatisticsForTable() {
			this.table.data.forEach((item, key) => {
				this.table.data[key].beneficiaries = item.total;
			});
			this.table.progress += 25;
		},

		prepareCommodityForTable() {
			this.table.data.forEach((item) => {
				this.commodities.push(item.commodities);
			});
			this.table.progress += 15;
			this.table.data.forEach((item, key) => {
				const preparedCommodity = item.commodities;
				const dateExpiration = item.dateExpiration || "No Date";

				const isCommoditySmartCard = preparedCommodity[0]?.modalityType === "Smartcard";
				this.table.data[key].dateExpiration = isCommoditySmartCard
					? dateExpiration : this.$t("N/A");

				this.table.data[key].commodity = preparedCommodity[0] ? [preparedCommodity[0]]
					.map(({ modalityType }) => (
						{
							code: modalityType,
							value: modalityType,
							remoteDistributionAllowed: item.remoteDistributionAllowed,
						}))
					: [];
			});
			this.table.progress += 10;
		},

		prepareLocationForTable() {
			this.table.data.forEach((item, key) => {
				this.table.data[key].location = item.location.name;
			});
			this.table.progress += 25;
		},

		prepareRowClickForTable() {
			this.table.data.forEach((item, key) => {
				const { id, projectId, name } = this.table.data[key];
				const routeParams = {
					assistanceId: id,
					...(this.upcoming && { projectId }),
				};

				this.table.data[key].assistanceID = {
					routeName: this.getRouteNameToAssistance(this.table.data[key]),
					name: id,
					routeParams,
				};
				this.table.data[key].assistanceName = {
					routeName: this.getRouteNameToAssistance(this.table.data[key]),
					name,
					routeParams,
				};
			});
		},

		reachedTextFormat(data) {
			return data.reached === 0 ? `${data.reached} / ${data.total}`
				: `${data.reached} / ${data.total}`;
		},

		getRouteNameToAssistance({ state: { code } }) {
			return code === ASSISTANCE.STATUS.CLOSED
			|| code === ASSISTANCE.STATUS.VALIDATED
				? "AssistanceDetail"
				: "AssistanceEdit";
		},

		assistanceProgress(data) {
			return (data.state.code === ASSISTANCE.STATUS.NEW && this.$t("N/A"))
				|| `${Math.trunc(data.progress * 100)} %`;
		},

		onGoToDetail(id) {
			this.$router.push({
				name: "AssistanceDetail",
				params: {
					assistanceId: id,
				},
			});
		},

		onGoToUpdate(id) {
			const assistance = this.table.data.find((item) => item.id === id);

			if (this.upcoming) {
				this.showDetail(assistance);
			} else {
				this.$router.push({
					name: "AssistanceEdit",
					params: {
						assistanceId: assistance.id,
					},
				});
			}
		},

		onStatusFilter(filter) {
			this.statusActive[filter] = !this.statusActive[filter];

			if (this.selectedFilters.includes(filter)) {
				this.selectedFilters = this.selectedFilters.filter((item) => item !== filter);
			} else {
				this.selectedFilters.push(filter);
			}

			this.onFiltersChange({ states: this.selectedFilters });
		},

		async onFiltersChange(selectedFilters) {
			this.filters = selectedFilters;
			this.table.currentPage = 1;
			await this.fetchData();
		},

		onDuplicate(id) {
			this.$router.push({ name: "AddAssistance", query: { duplicateAssistance: id } });
		},

		isAssistanceMoveEnable(assistance) {
			return (assistance.validated && !assistance.completed) || !this.userCan.moveAssistance;
		},

		async onExportAssistances(exportType, format) {
			if (exportType === EXPORT.ASSISTANCE_OVERVIEW) {
				try {
					this.exportControl.loading = true;

					const filters = {
						...this.filters,
						...(this.table.searchPhrase && { fulltext: this.table.searchPhrase }),
					};
					const filename = `Assistance overview ${normalizeExportDate()}`;
					const { data, status, message } = await AssistancesService.exportAssistances(
						format,
						this.$route.params.projectId,
						filters,
					);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Assistances")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>

<style lang="scss">
.dropdown-actions .v-list-item__content {
	display: flex;
	flex-direction: column;

	> button {
		justify-content: left;
	}
}
</style>
