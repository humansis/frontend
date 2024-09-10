<template>
	<DataGrid
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		reset-sort-button
		is-search-visible
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
		@update:sortBy="onSort"
		@search="onSearch"
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.DONORS)"
		@rowClicked="(row) => onShowDetail(row.item)"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
				v-if="userCan.addEditDonors"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row)"
			/>

			<ButtonAction
				v-if="userCan.addEditDonors"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting Donor"
				confirm-message="Are you sure you want to delete Donor?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="onRemove(row.id)"
			/>
		</template>

		<template v-slot:tableControls>
			<ExportControl
				:disabled="!table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				data-cy="donors-export"
				@export="onExportDonors"
			/>
		</template>
	</DataGrid>
</template>

<script>
import DonorService from "@/services/DonorService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, TABLE } from "@/consts";

export default {
	name: "DonorsList",

	components: {
		ExportControl,
		ButtonAction,
		DataGrid,
	},

	mixins: [grid, permissions],

	data() {
		return {
			TABLE,
			isLoadingList: false,
			exportControl: {
				loading: false,
				location: "donors",
				types: [EXPORT.DONORS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: generateColumns([
					{ key: "fullname", type: "text", title: "Donor Name" },
					{ key: "shortname", type: "text", title: "Short Name" },
					{ key: "logo", type: "image", title: "Organization Logo", sortable: false },
					{ key: "notes", type: "text", sortable: false },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.DONORS.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.DONORS.key,
				searchPhrase: "",
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

				const sort = this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "";
				const {
					data: { data, totalCount },
					status,
					message,
				} = await DonorService.getListOfDonors({
					page: this.table.currentPage,
					size: this.perPage,
					search: this.table.searchPhrase,
					sort,
				});

				checkResponseStatus(status, message);

				this.table.data = data;
				this.table.total = totalCount;
			} catch (e) {
				Notification(`${this.$t("Donors")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		async onExportDonors(exportType, format) {
			if (exportType === EXPORT.DONORS) {
				try {
					this.exportControl.loading = true;

					const filename = `Donors ${normalizeExportDate()}`;
					const { data, status, message } = await DonorService.exportDonors(format);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Donors")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
