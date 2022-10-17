<template>
	<div>
		<h2 class="title">{{ upcoming ? $t('Assistances') : '' }}</h2>
		<b-notification
			v-if="!table.data.length && beneficiariesCount && !isLoadingList && !upcoming"
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
			v-if="!beneficiariesCount && table.data && !isLoadingList && !upcoming"
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
			v-show="beneficiariesCount || upcoming"
			has-reset-sort
			default-sort-key="dateDistribution"
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
				width="230"
				field="actions"
				:label="$t('Actions')"
				:visible="!upcoming"
			>
				<div class="buttons is-right">
					<ActionButton
						v-if="!props.row.validated
							&& userCan.editDistribution"
						icon="search"
						type="is-primary"
						:tooltip="$t('Edit')"
						@click="showEdit(props.row.id)"
					/>
					<ActionButton
						v-if="!props.row.validated
							&& userCan.editDistribution"
						icon="edit"
						:tooltip="$t('Update')"
						@click="goToUpdate(props.row.id)"
					/>
					<ActionButton
						v-if="props.row.validated
							&& !props.row.completed
							&& (userCan.editDistribution
								|| userCan.viewDistribution )"
						icon="lock"
						type="is-warning"
						:tooltip="$t('Update')"
						@click="goToDetail(props.row.id)"
					/>
					<ActionButton
						v-if="props.row.completed
							&& (userCan.editDistribution
								|| userCan.viewDistribution)"
						icon="check"
						type="is-success"
						:tooltip="$t('View')"
						@click="goToDetail(props.row.id)"
					/>
					<SafeDelete
						:disabled="!props.row.deletable || !userCan.deleteDistribution"
						icon="trash"
						:message="$t('All distribution data will be deleted. Do you wish to continue?')"
						:entity="$t('Assistance')"
						:tooltip="$t('Delete')"
						:id="props.row.id"
						@submitted="$emit('onRemove', $event)"
					/>
					<ActionButton
						v-if="userCan.editDistribution"
						icon="copy"
						type="is-dark"
						:tooltip="$t('Duplicate')"
						@click="duplicate(props.row.id)"
					/>
				</div>
			</b-table-column>
			<template v-if="!upcoming" #export>
				<ExportButton
					type="is-primary"
					space-between
					:loading="exportLoading"
					:formats="{ xlsx: true, csv: true, ods: true}"
					@onExport="exportAssistances"
				/>
			</template>
			<template #progress>
				<b-progress :value="table.progress" format="percent" />
			</template>
		</Table>
	</div>
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
import permissions from "@/mixins/permissions";
import routerHelper from "@/mixins/routerHelper";

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
		beneficiariesCount: {
			type: Number,
			required: false,
			default: 0,
		},
	},

	mixins: [permissions, grid, baseHelper, routerHelper],

	data() {
		return {
			exportLoading: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", label: "Assistance ID", sortable: true },
					{ key: "name", sortable: true },
					{ key: "round", sortable: true },
					{ key: "type", type: "assistancesType", sortable: true },
					{ key: "location", label: "Location", sortable: true },
					{ key: "beneficiaries", label: "Beneficiaries", sortable: true, sortKey: "bnfCount" },
					{ key: "dateDistribution", label: "Date of Assistance", type: "datetime", sortable: true },
					{ key: "dateExpiration", label: "Expiration Date", sortable: true },
					{ key: "target", sortable: true },
					{ key: "commodity", label: "Commodity", type: "svgIcon" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "desc",
				sortColumn: "dateDistribution",
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
				if (e.message) Notification(`${this.$t("Assistance")} ${e}`, "is-danger");
				this.routerPush({ name: "NotFound" });
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
				if (e.message) Notification(`${this.$t("Upcoming Assistances")} ${e}`, "is-danger");
			});
		},

		prepareDataForTable(data) {
			this.table.progress += 15;
			const locationIds = [];
			const assistanceIds = [];
			const commodityIds = [];
			data.forEach((item, key) => {
				const roundIsNaN = Number.isNaN(parseInt(item.round, 10));
				locationIds.push(item.locationId);
				assistanceIds.push(item.id);
				commodityIds.push(...item.commodityIds);
				this.table.data[key] = item;
				this.table.data[key].dateDistribution = `${item.dateDistribution}`;
				this.table.data[key].type = this.$t(normalizeText(item.type));
				this.table.data[key].target = this.$t(normalizeText(item.target));
				this.table.data[key].round = roundIsNaN ? "N/A" : item.round;
			});
			this.table.progress += 10;

			this.prepareLocationForTable(locationIds);
			this.prepareCommodityForTable(commodityIds);
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
				const preparedCommodity = commodities?.find(({ id }) => id === item.commodityIds[0]);

				let dateExpiration = "";

				if (item.dateExpiration) {
					dateExpiration = this.$moment(item.dateExpiration).format("YYYY-MM-DD hh:mm");
				} else {
					dateExpiration = "No Date";
				}

				const isCommoditySmartCard = preparedCommodity?.modalityType === "Smartcard";
				this.table.data[key].dateExpiration = isCommoditySmartCard
					? dateExpiration : "N/A";

				this.table.data[key].commodity = preparedCommodity ? [preparedCommodity]
					.map(({ modalityType }) => ({ code: modalityType, value: modalityType })) : [];
			});
			this.table.progress += 10;
		},

		async prepareLocationForTable(locationIds) {
			const locations = await this.getLocations(locationIds);
			this.table.progress += 15;
			this.table.data.forEach((item, key) => {
				this.table.data[key].location = this
					.prepareLocationEntityForTable(item.locationId, locations, "name");
			});
			this.table.progress += 10;
		},

		async getLocations(ids) {
			if (!ids.length) return [];
			return LocationsService.getLocations(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Locations")} ${e}`, "is-danger");
				});
		},

		async getCommodities(ids) {
			if (!ids.length) return [];
			return AssistancesService.getCommodities(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
				});
		},

		async getStatistics(ids) {
			if (!ids.length) return [];
			return AssistancesService.getStatistics(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Statistics")} ${e}`, "is-danger");
				});
		},

		goToDetail(id) {
			this.routerPush({
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
				this.routerPush({
					name: "AssistanceEdit",
					params: {
						assistanceId: assistance.id,
					},
				});
			}
		},

		duplicate(id) {
			this.routerPush({ name: "AddAssistance", query: { duplicateAssistance: id } });
		},

		async exportAssistances(format) {
			this.exportLoading = true;
			await AssistancesService.exportAssistances(format, this.$route.params.projectId)
				.then(({ data, status, message }) => {
					if (status === 200) {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `assistances.${format}`;
						link.click();
					} else {
						Notification(message, "is-warning");
					}
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Export Assistances")} ${e}`, "is-danger");
				});
			this.exportLoading = false;
		},
	},
};
</script>
