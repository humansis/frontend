<template>
	<DataGrid
		v-model:items-per-page="perPage"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		is-row-click-disabled
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				:icon="scoringStatusChangeButtonIcon(row)"
				:tooltip-text="scoringStatusChangeButtonTooltip(row)"
				@actionConfirmed="onStatusChange(row.id, !row.enabled)"
			/>

			<ButtonAction
				icon="download"
				tooltip-text="Download"
				@actionConfirmed="onDownloadScoring(row)"
			/>

			<ButtonAction
				:disabled="!row.deletable"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting Scoring"
				confirm-message="Are you sure you want to delete Scoring?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="onRemove(row.id)"
			/>
		</template>
	</DataGrid>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, SCORING } from "@/consts";

const statusTags = [
	{ code: SCORING.STATUS.INACTIVE, type: "grey-lighten-2" },
	{ code: SCORING.STATUS.ACTIVE, type: "green-lighten-1" },
];

export default {
	name: "ScoringList",

	components: {
		ButtonAction,
		DataGrid,
	},

	mixins: [grid, permissions],

	data() {
		return {
			isLoadingList: false,
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id", title: "Scoring ID", sortable: false },
					{ key: "name", sortable: false },
					{ key: "status", type: "tag", customTags: statusTags, sortable: false },
					{ key: "uploaded", type: "datetime", sortable: false },
					{ key: "note", sortable: false },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
			},
		};
	},

	created() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.isLoadingList = true;

				const {
					data: { data, totalCount },
					status,
					message,
				} = await AssistancesService.getScoringTypes(
					this.table.currentPage,
					this.perPage,
				);

				checkResponseStatus(status, message);

				this.table.data = [];
				this.table.total = totalCount;

				if (totalCount > 0) {
					this.prepareDataForTable(data);
				}
			} catch (e) {
				Notification(`${this.$t("Scoring Types")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				const status = item.enabled
					? SCORING.STATUS.ACTIVE
					: SCORING.STATUS.INACTIVE;

				this.table.data[key] = {
					...item,
					status,
					uploaded: item.createdAt,
				};
			});
		},

		scoringStatusChangeButtonIcon(scoring) {
			return scoring.enabled ? "toggle-off" : "toggle-on";
		},

		scoringStatusChangeButtonTooltip(scoring) {
			return scoring.enabled ? "Deactivate" : "Activate";
		},

		async onDownloadScoring(scoring) {
			try {
				const filename = `${scoring.name}-ID-${scoring.id}`;
				const { data, status, message } = await AssistancesService.downloadScoring(scoring.id);

				downloadFile(data, filename, status, EXPORT.FORMAT_CSV, message);
			} catch (e) {
				Notification(`${this.$t("Scoring download")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
