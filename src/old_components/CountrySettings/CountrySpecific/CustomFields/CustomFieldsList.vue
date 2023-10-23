<template>
	<Table
		has-reset-sort
		has-search
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		@clicked="showDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort('id', 'asc', true)"
		@onSearch="onSearch"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				v-slot="props"
				:sortable="column.sortable"
				:key="column.id"
			>
				<ColumnField :data="props" :column="column" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			visible
			width="150"
			field="actions"
			:label="$t('Actions')"
		>
			<div class="buttons is-right">
				<ActionButton
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					icon="edit"
					:tooltip="$t('Edit')"
					@click="showEdit(props.row.id)"
				/>
				<SafeDelete
					icon="trash"
					:entity="$t('Custom Field')"
					:tooltip="$t('Delete')"
					:id="props.row.id"
					@submitted="remove"
				/>
			</div>
		</b-table-column>
		<template #export>
			<ExportControl
				:disabled="!table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@onExport="exportCustomFields"
			/>
		</template>
	</Table>
</template>

<script>
import CustomFieldsService from "@/services/CustomFieldsService";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import ExportControl from "@/components/Export";
import SafeDelete from "@/components/SafeDelete";
import grid from "@/mixins/grid";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT } from "@/consts";

export default {
	name: "CustomFieldsList",

	components: {
		ColumnField,
		ExportControl,
		SafeDelete,
		Table,
		ActionButton,
	},

	mixins: [grid],

	data() {
		return {
			exportControl: {
				loading: false,
				location: "customFields",
				types: [EXPORT.CUSTOM_FIELDS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "field", sortable: true },
					{ key: "type", sortable: true },
					{ key: "target", visible: false },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "asc",
				sortColumn: "id",
				searchPhrase: "",
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

			this.table.columns = generateColumns(this.table.visibleColumns);
			await CustomFieldsService.getListOfCustomFields(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Custom Fields")} ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		async exportCustomFields(exportType, format) {
			if (exportType === EXPORT.CUSTOM_FIELDS) {
				try {
					this.exportControl.loading = true;

					const filename = `Custom Fields ${normalizeExportDate()}`;
					const { data, status, message } = await CustomFieldsService.exportCustomFields(format);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Custom Fields")} ${e.message || e}`, "is-danger");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
