<template>
	<DataGrid
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		:data-cy="dataCy"
		class="custom-fields-table"
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
				:data-cy="prepareComponentIdentifier(`row-${index + 1}-show-detail-button`)"
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row)"
			/>

			<ButtonAction
				v-if="userCan.editCustomField"
				:data-cy="prepareComponentIdentifier(`row-${index + 1}-edit-button`)"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row)"
			/>

			<!--	TODO Uncomment in next version (when BE is ready) -->
			<!--	<ButtonAction-->
			<!--		:data-cy="prepareComponentIdentifier(`row-${index + 1}-delete-button`)"-->
			<!--		icon="trash"-->
			<!--		tooltip-text="Delete"-->
			<!--		icon-color="red"-->
			<!--		confirm-title="Deleting Custom Field"-->
			<!--		confirm-message="Are you sure you want to delete Custom Field?"-->
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
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
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

	mixins: [grid, permissions, identifierBuilder],

	data() {
		return {
			TABLE,
			dataCy: "custom-fields-table",
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
					{ key: "key", sortable: false },
					{ key: "label" },
					{ key: "note" },
					{ key: "target", sortKey: "targetType" },
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

				const sort = this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "";
				const {
					data: { data, totalCount },
					status,
					message,
				} = await CustomFieldsService.getListOfCustomFields({
					page: this.table.currentPage,
					size: this.perPage,
					search: this.table.searchPhrase,
					sort,
				});

				checkResponseStatus(status, message);

				if (totalCount > 0) {
					this.prepareDataForTable(data);
					this.table.total = totalCount;
				}
			} catch (e) {
				Notification(`${this.$t("Custom Fields")}: ${e.message || e}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		async onExportCustomFields(exportType, format) {
			if (exportType === EXPORT.CUSTOM_FIELDS) {
				try {
					this.exportControl.loading = true;

					const filename = `Custom Fields ${normalizeExportDate()}`;
					const {
						data,
						status,
						message,
					} = await CustomFieldsService.exportCustomFields(format);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Custom Fields")}: ${e.message || e}`, "error");
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

				return {
					...item,
					target: targetType?.shortCut,
				};
			});
		},
	},
};
</script>

<style lang="scss">
.custom-fields-table {
	td:nth-child(3) {
		max-width: 10rem;

		div {
			overflow: hidden;
			max-width: 90%;
			text-overflow: ellipsis;
			width: fit-content;
			white-space: nowrap;
		}
	}
}
</style>
