<template>
	<div>
		<h2 class="title">{{ upcoming ? $t('Assistances') : '' }}</h2>
		<b-notification
			v-if="showNoProjectError"
			type="is-warning is-light"
			has-icon
			icon="exclamation-triangle"
			:closable="false"
		>
			<div class="mt-3">
				{{ $t("This project does not contain any assistances")}}.
				{{ $t("Create your first one")}}.
			</div>
		</b-notification>
		<b-notification
			v-if="showNoBeneficiariesError"
			type="is-warning is-light"
			has-icon
			icon="user-plus"
			:closable="false"
		>
			<div class="mt-3">
				{{ $t("Please add some beneficiaries first!")}}
				{{ $t("Then you will be able to manage some assistances")}}.
			</div>
		</b-notification>
		<Table
			ref="assistanceTable"
			v-show="beneficiariesCount || upcoming"
			has-reset-sort
			default-sort-key="dateDistribution"
			:has-search="!upcoming"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			:has-clickable-rows="false"
			:search-phrase="table.searchPhrase"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
			@resetSort="resetSort('dateDistribution', 'desc')"
			@onSearch="onSearch"
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
				width="230"
				field="actions"
				:label="$t('Actions')"
				:visible="!upcoming"
			>
				<div class="buttons is-right">
					<ActionButton
						v-if="!props.row.validated
							&& userCan.editDistribution"
						icon="edit"
						:tooltip="$t('Update')"
						@click="goToUpdate(props.row.id)"
					/>
					<ActionButton
						v-if="(props.row.validated
							|| props.row.completed)
							&& isAssistanceDetailAllowed"
						:icon="props.row.validated && props.row.completed
							? 'eye' : 'edit'"
						:tooltip="props.row.validated && props.row.completed
							? $t('View') : $t('Update')"
						@click="goToDetail(props.row.id)"
					/>
					<ActionButton
						v-if="userCan.editDistribution"
						icon="search"
						type="is-primary"
						:tooltip="$t('Details')"
						@click="showEdit(props.row.id)"
					/>
					<b-dropdown
						class="is-pulled-right has-text-left"
						:position="isOneOfLastThreeRows(props.index) ? 'is-top-left' : 'is-bottom-left'"
					>
						<template #trigger>
							<b-button
								size="is-small"
								icon-left="ellipsis-h"
							/>
						</template>
						<b-dropdown-item
							v-if="userCan.editDistribution"
							@click="duplicate(props.row.id)"
						>
							<b-icon icon="copy" />

							{{ $t("Duplicate") }}
						</b-dropdown-item>
						<b-dropdown-item
							@click="assistanceMove(props.row.id)"
							:disabled="isAssistanceMoveEnable(props.row)"
						>
							<b-icon icon="share" />

							{{ $t("Move") }}
						</b-dropdown-item>
						<SafeDelete
							:disabled="!props.row.deletable || !userCan.deleteDistribution"
							componentType="DropDownItem"
							:name="$t('Delete')"
							icon="trash"
							:message="$t('All distribution data will be deleted. Do you wish to continue?')"
							:entity="$t('Assistance')"
							:id="props.row.id"
							@submitted="$emit('onRemove', $event)"
						/>
					</b-dropdown>
				</div>
			</b-table-column>
			<template v-if="!upcoming" #export>
				<ExportControl
					:disabled="!table.data.length"
					:available-export-formats="exportControl.formats"
					:available-export-types="exportControl.types"
					:is-export-loading="exportControl.loading"
					:location="exportControl.location"
					@onExport="exportAssistances"
				/>
			</template>
			<template #progress>
				<b-progress :value="table.progress" format="percent" />
			</template>
			<template #filterButton>
				<b-button
					:class="filterButtonNew"
					slot="trigger"
					icon-left="sticky-note"
					@click="statusFilter('new')"
				>
					{{ $t('New') }}
				</b-button>
				<b-button
					:class="filterButtonValidated"
					slot="trigger"
					icon-left="spinner"
					@click="statusFilter('validated')"
				>
					{{ $t('Validated') }}
				</b-button>
				<b-button
					:class="filterButtonClosed"
					slot="trigger"
					icon-left="check"
					@click="statusFilter('closed')"
				>
					{{ $t('Closed') }}
				</b-button>
			</template>
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import ActionButton from "@/components/ActionButton";
import ExportControl from "@/components/Export";
import { EXPORT } from "@/consts";
import ColumnField from "@/components/DataGrid/ColumnField";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import { generateColumns, normalizeText, normalizeExportDate } from "@/utils/datagrid";
import grid from "@/mixins/grid";
import baseHelper from "@/mixins/baseHelper";
import permissions from "@/mixins/permissions";
import consts from "@/utils/assistanceConst";

const statusTags = [
	{ code: consts.STATUS.NEW, type: "is-light" },
	{ code: consts.STATUS.VALIDATED, type: "is-success" },
	{ code: consts.STATUS.CLOSED, type: "is-info" },
];

export default {
	name: "AssistancesList",

	components: {
		Table,
		ActionButton,
		SafeDelete,
		ColumnField,
		ExportControl,
	},

	props: {
		upcoming: Boolean,
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

	mixins: [permissions, grid, baseHelper, permissions],

	data() {
		return {
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
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "assistanceID", label: "Assistance ID", type: "link", sortKey: "id", sortable: true },
					{ key: "assistanceName", label: "Name", type: "link", sortKey: "name", sortable: true },
					{ key: "status", type: "tag", customTags: statusTags, sortKey: "state", sortable: true },
					{ key: "round", sortable: true },
					{ key: "type", type: "assistancesType", sortable: true },
					{ key: "location", label: "Location", sortable: true },
					{ key: "target", sortable: true },
					{ key: "reached" },
					{ key: "progress", sortable: true },
					{ key: "dateDistribution", label: "Date of Assistance", type: "date", sortable: true },
					{ key: "dateExpiration", label: "Expiration Date", sortable: true },
					{ key: "commodity", label: "Commodity", type: "svgIcon" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "desc",
				sortColumn: "dateDistribution",
				searchPhrase: "",
				progress: null,
			},
			commodities: [],
			locations: [],
		};
	},

	watch: {
		$route: "fetchData",
	},

	created() {
		this.fetchData();
	},

	computed: {
		filterButtonNew() {
			return [
				"btn ml-3 is-light",
				{ "is-selected": this.statusActive.new },
			];
		},

		filterButtonValidated() {
			return [
				"btn ml-3 is-success is-light",
				{ "is-selected": this.statusActive.validated },
			];
		},

		filterButtonClosed() {
			return [
				"btn ml-3 is-info is-light",
				{ "is-selected": this.statusActive.closed },
			];
		},

		isAssistanceDetailAllowed() {
			return this.userCan.editDistribution || this.userCan.viewDistribution;
		},

		showNoProjectError() {
			return !this.project?.assistanceCount
				&& this.beneficiariesCount
				&& !this.isLoadingList
				&& !this.upcoming;
		},

		showNoBeneficiariesError() {
			return !this.beneficiariesCount
				&& this.projectLoaded
				&& this.table.data
				&& !this.isLoadingList
				&& !this.upcoming;
		},
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
				this.filters,
			).then(async ({ data, totalCount }) => {
				this.table.data = [];
				this.table.progress = 0;
				this.table.total = totalCount;
				if (totalCount > 0) {
					await this.prepareDataForTable(data);
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Assistance")} ${e}`, "is-danger");
			});
		},

		async fetchUpcomingAssistances() {
			await AssistancesService.getListOfAssistances(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
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
				if (e.message) Notification(`${this.$t("Upcoming Assistances")} ${e}`, "is-danger");
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
				this.table.data[key].round = roundIsNaN ? "N/A" : item.round;
				this.table.data[key].status = this.$t(normalizeText(item.state.code));
				this.table.data[key].reached = this.reachedTextFormat(item);
				this.table.data[key].progress = this.assistanceProgress(item);
			});
			this.table.progress += 10;

			this.prepareLocationForTable();
			this.prepareCommodityForTable();
			this.prepareStatisticsForTable();
			this.prepareRowClickForTable();

			const maxThreeRows = this.table.data.length <= 3;
			this.$refs.assistanceTable.makeTableOverflow(maxThreeRows);
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

				let dateExpiration = "";

				if (item.dateExpiration) {
					dateExpiration = this.$moment(item.dateExpiration).format("YYYY-MM-DD");
				} else {
					dateExpiration = "No Date";
				}

				const isCommoditySmartCard = preparedCommodity[0]?.modalityType === "Smartcard";
				this.table.data[key].dateExpiration = isCommoditySmartCard
					? dateExpiration : "N/A";

				this.table.data[key].commodity = preparedCommodity[0] ? [preparedCommodity[0]]
					.map(({ modalityType }) => ({ code: modalityType, value: modalityType })) : [];
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

		getRouteNameToAssistance(data) {
			return data.state.value === "Closed"
				|| data.state.value === "Validated"
				? "AssistanceDetail"
				: "AssistanceEdit";
		},

		assistanceProgress(data) {
			return (data.state.value === "New" && "N/A")
				|| `${Math.trunc(data.progress * 100)} %`;
		},

		goToDetail(id) {
			this.$router.push({
				name: "AssistanceDetail",
				params: {
					assistanceId: id,
				},
			});
		},

		goToUpdate(id) {
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

		statusFilter(filter) {
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

		duplicate(id) {
			this.$router.push({ name: "AddAssistance", query: { duplicateAssistance: id } });
		},

		isOneOfLastThreeRows(rowId) {
			const countOfDisplayedRows = this.perPage <= this.table.total
				? this.perPage
				: this.table.total;

			return (rowId === countOfDisplayedRows - 1
				|| rowId === countOfDisplayedRows - 2
				|| rowId === countOfDisplayedRows - 3
			);
		},

		isAssistanceMoveEnable(assistance) {
			return (assistance.validated && !assistance.completed) || !this.userCan.moveAssistance;
		},

		async exportAssistances(type, format) {
			if (type === EXPORT.ASSISTANCE_OVERVIEW) {
				this.exportControl.loading = true;
				await AssistancesService.exportAssistances(format, this.$route.params.projectId)
					.then(({ data, status, message }) => {
						if (status === 200) {
							const blob = new Blob([data], { type: data.type });
							const link = document.createElement("a");
							link.href = window.URL.createObjectURL(blob);
							link.download = `Assistance overview ${normalizeExportDate()}.${format}`;
							link.click();
						} else {
							Notification(message, "is-warning");
						}
					})
					.catch((e) => {
						if (e.message) Notification(`${this.$t("Export Assistances")} ${e}`, "is-danger");
					});
				this.exportControl.loading = false;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.btn {
	outline: none !important;
	box-shadow: none !important;

		&.is-selected,
		&.is-selected:hover,
		&.is-selected:focus {
			border-color: inherit;
			border-width: 2px;
		}
	}
</style>
