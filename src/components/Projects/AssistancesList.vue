<template>
	<h2 v-if="upcoming" class="my-4">{{ $t('Assistances') }}</h2>

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
		ref="assistancesList"
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
		reset-filters-button
		reset-sort-button
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
		@update:sortBy="onSort"
		@search="onSearch"
		@resetFilters="onResetFilters"
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.ASSISTANCES)"
	>
		<template v-if="!upcoming" v-slot:actions="{ row }">
			<ButtonAction
				v-if="!row.validated"
				icon="edit"
				tooltip-text="Update"
				@actionConfirmed="onGoToUpdate(row.id, row.state.code)"
			/>

			<ButtonAction
				v-if="(row.validated || row.completed)"
				:required-permissions="row.validated && PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT_UPDATE"
				:icon="row.validated && row.completed ? 'eye' : 'edit'"
				:tooltip-text="row.validated && row.completed ? 'View' : 'Update'"
				@actionConfirmed="onGoToDetail(row.id)"
			/>

			<ButtonAction
				:required-permissions="PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT_VIEW"
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
							:required-permissions="PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT_MANIPULATION"
							:is-only-icon="false"
							icon="copy"
							label="Duplicate"
							button-size="small"
							@actionConfirmed="onDuplicate(row.id)"
						/>

						<ButtonAction
							:required-permissions="PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT_MANIPULATION"
							:is-only-icon="false"
							:disabled="isAssistanceMoveEnable(row)"
							icon="share"
							label="Move"
							button-size="small"
							@actionConfirmed="onAssistanceMove(row.id)"
						/>

						<ButtonAction
							:required-permissions="PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT_MANIPULATION"
							:disabled="!row.deletable"
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
				v-if="!upcoming"
				:append-icon="isAdvancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				color="blue-grey-lighten-4"
				variant="elevated"
				class="ml-4 text-none"
				@click="onAdvancedSearchToggle"
			>
				{{ $t('Advanced Search') }}
			</v-btn>

			<v-btn
				:class="filterButtonCreating"
				icon-left="sticky-note"
				variant="tonal"
				prepend-icon="sticky-note"
				@click="onStatusFilter('creating')"
			>
				{{ $t('Creating') }}
			</v-btn>

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

		<template v-slot:advancedControls>
			<v-expansion-panels v-model="visiblePanels">
				<v-expansion-panel value="advancedSearch" eager>
					<v-expansion-panel-text>
						<AssistancesFilter
							ref="assistancesFilter"
							@filtersChanged="onFiltersChange"
							@search="onSearch(table.searchPhrase)"
						/>
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</template>
	</DataGrid>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import AssistancesFilter from "@/components/Projects/AssistancesFilter";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import routerHelper from "@/mixins/routerHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import { generateColumns, normalizeExportDate, normalizeText } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { ASSISTANCE, EXPORT, ROUTER, TABLE } from "@/consts";

const customSort = { progress: () => {} };
const statusTags = [
	{ code: ASSISTANCE.STATUS.CREATING, class: "status creating" },
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
		AssistancesFilter,
	},

	mixins: [
		permissions,
		grid,
		baseHelper,
		urlFiltersHelper,
		routerHelper,
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
			visiblePanels: [],
			exportLoading: false,
			selectedFilters: [...ASSISTANCE.DEFAULT_SELECTED_STATUS],
			statusActive: { ...ASSISTANCE.DEFAULT_SELECTED_STATUS_BUTTONS },
			filters: { states: [...ASSISTANCE.DEFAULT_SELECTED_STATUS] },
			isLoadingList: false,
			table: {
				data: [],
				columns: generateColumns([
					{
						key: "assistanceID",
						title: "Assistance ID",
						type: "link",
						isOpenedInNewTab: true,
						sortKey: "id",
					},
					{
						key: "assistanceName",
						title: "Name",
						type: "link",
						isOpenedInNewTab: true,
						sortKey: "name",
					},
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
		filterButtonCreating() {
			return [
				"text-none ml-3 status creating",
				{ "is-selected": this.statusActive.creating },
			];
		},

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

		isAdvancedSearchVisible() {
			return this.visiblePanels.includes("advancedSearch");
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

	mounted() {
		if (this.isUserPermissionGranted(this.PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT)
			&& this.upcoming) {
			this.fetchData();
		}
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
			try {
				const sort = this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "";
				const {
					data: { data, totalCount },
					status,
					message,
				} = await AssistancesService.getListOfProjectAssistances({
					id: this.$route.params.projectId,
					page: this.table.currentPage,
					size: this.perPage,
					search: this.table.searchPhrase,
					filters: this.filters,
					sort,
				});

				checkResponseStatus(status, message);

				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;

				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			} catch (e) {
				Notification(`${this.$t("Assistance")}: ${e.message || e}`, "error");
			}
		},

		async fetchUpcomingAssistances() {
			try {
				const sort = this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "";
				const {
					data: { data, totalCount },
					status,
					message,
				} = await AssistancesService.getListOfAssistances({
					page: this.table.currentPage,
					size: this.perPage,
					upcoming: true,
					filters: this.filters,
					sort,
				});

				checkResponseStatus(status, message);

				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;

				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			} catch (e) {
				Notification(`${this.$t("Upcoming Assistances")}: ${e.message || e}`, "error");
			}
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
			switch (code) {
				case ASSISTANCE.STATUS.CLOSED:
				case ASSISTANCE.STATUS.VALIDATED:
					return ROUTER.ROUTE_NAME.ASSISTANCES.DETAIL;
				case ASSISTANCE.STATUS.CREATING:
					return ROUTER.ROUTE_NAME.ASSISTANCES.CREATION_PROGRESS;
				default:
					return ROUTER.ROUTE_NAME.ASSISTANCES.EDIT;
			}
		},

		assistanceProgress(data) {
			return (data.state.code === ASSISTANCE.STATUS.NEW && this.$t("N/A"))
				|| `${parseFloat((data.progress * 100).toFixed(2))} %`;
		},

		onAdvancedSearchToggle() {
			this.visiblePanels = this.isAdvancedSearchVisible ? [] : ["advancedSearch"];
		},

		onGoToDetail(id) {
			const route = this.$router.resolve(this.getAssistanceDetailPage(id));

			window.open(route.href, "_blank");
		},

		onGoToUpdate(id, stateCode) {
			let route = {};

			if (stateCode === ASSISTANCE.STATUS.CREATING) {
				route = this.$router.resolve(this.getAssistanceProgressPage(id));
			} else {
				route = this.$router.resolve(this.getAssistanceEditPage(id));
			}

			window.open(route.href, "_blank");
		},

		onStatusFilter(filter) {
			this.statusActive[filter] = !this.statusActive[filter];

			if (this.selectedFilters.includes(filter)) {
				this.selectedFilters = this.selectedFilters.filter((item) => item !== filter);
			} else {
				this.selectedFilters.push(filter);
			}

			this.onStatusFiltersChange({ states: this.selectedFilters });
		},

		async onStatusFiltersChange(selectedFilters) {
			this.filters = { ...this.filters, ...selectedFilters };
			this.table.currentPage = 1;
			await this.fetchData();
		},

		onResetFilters() {
			this.resetSearch(
				{
					tableRef: "assistancesList",
					filtersRef: "assistancesFilter",
				},
				false,
			);
			this.statusActive = { ...ASSISTANCE.DEFAULT_SELECTED_STATUS_BUTTONS };
			this.selectedFilters = [...ASSISTANCE.DEFAULT_SELECTED_STATUS];
			this.onStatusFiltersChange({ states: this.selectedFilters });
		},

		onDuplicate(id) {
			this.$router.push({
				name: ROUTER.ROUTE_NAME.ASSISTANCES.ADD,
				query: { duplicateAssistance: id },
			});
		},

		isAssistanceMoveEnable(assistance) {
			return (assistance.validated && !assistance.completed);
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
					const {
						data,
						status,
						message,
					} = await AssistancesService.exportAssistances({
						projectId: this.$route.params.projectId,
						format,
						filters,
					});

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Assistances")}: ${e.message || e}`, "error");
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
