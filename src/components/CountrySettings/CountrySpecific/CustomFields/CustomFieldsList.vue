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
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.CUSTOM_FIELDS)"
		@rowClicked="(row) => onShowDetail(row.item)"
	>
		<template v-slot:actions="{ row, index }">
			<ButtonAction
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
				v-if="isEditButtonVisible(index)"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row)"
			/>

			<!--	TODO Uncomment in next version (when BE is ready) -->
			<!--	<ButtonAction-->
			<!--		icon="trash"-->
			<!--		tooltip-text="Delete"-->
			<!--		icon-color="red"-->
			<!--		confirm-title="Deleting Custom Field"-->
			<!--		confirm-message="Are you sure sure you want to delete Custom Field?"-->
			<!--		prepend-icon="circle-exclamation"-->
			<!--		prepend-icon-color="red"-->
			<!--		is-confirm-action-->
			<!--		@actionConfirmed="onRemove(row.id)"-->
			<!--	/>-->
		</template>

		<template v-slot:tableControls>
			<ExportControl
				:disabled="!table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@export="onExportCustomFields"
			/>
		</template>
	</DataGrid>
</template>

<script>
import CustomFieldsService from "@/services/CustomFieldsService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import grid from "@/mixins/grid";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { COUNTRY_SETTINGS, EXPORT, TABLE } from "@/consts";

export default {
	name: "CustomFieldsList",

	components: {
		ExportControl,
		ButtonAction,
		DataGrid,
	},

	mixins: [grid],

	data() {
		return {
			TABLE,
			isLoadingList: false,
			exportControl: {
				loading: false,
				location: "customFields",
				types: [EXPORT.CUSTOM_FIELDS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: generateColumns([
					{ key: "fieldWithPrefix", title: "Field" },
					{ key: "bnfType", title: "BNF type", sortKey: "targetType" },
					{ key: "type" },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.CUSTOM_FIELDS.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.CUSTOM_FIELDS.key,
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

				const {
					data: { data, totalCount },
					status,
					message,
				} = await CustomFieldsService.getListOfCustomFields(
					this.table.currentPage,
					this.perPage,
					this.table.sortColumn !== ""
						? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
						: "",
				);

				checkResponseStatus(status, message);

				if (totalCount > 0) {
					this.prepareDataForTable(data);
					this.table.total = totalCount;
				}
			} catch (e) {
				Notification(`${this.$t("Custom Fields:")} ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		async onExportCustomFields(exportType, format) {
			if (exportType === EXPORT.CUSTOM_FIELDS) {
				try {
					this.exportControl.loading = true;

					const filename = `Custom Fields ${normalizeExportDate()}`;
					const { data, status, message } = await CustomFieldsService.exportCustomFields(format);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Custom Fields:")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},

		prepareDataForTable(data) {
			this.table.data = data.map((item) => {
				const targetType = COUNTRY_SETTINGS.CUSTOM_FIELDS.TARGET_TYPES.find(
					(type) => type.code === item.targetType,
				);
				const bnfType = targetType?.shortCut;
				const fieldWithPrefix = bnfType
					? `${bnfType}-${item.field}`
					: item.field;

				return {
					...item,
					fieldWithPrefix,
					bnfType,
				};
			});
		},

		isEditButtonVisible(index) {
			const rowData = this.table.data[index];

			return !rowData.isUsed
				&& rowData.type === COUNTRY_SETTINGS.CUSTOM_FIELDS.LIST_TYPE_CODE;
		},
	},
};
</script>
