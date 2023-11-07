<template>
	<Table
		has-search
		has-reset-sort
		has-export
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		default-sort-key="fullname"
		default-sort-direction="asc"
		@clicked="showDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort('fullname', 'asc')"
		@onSearch="onSearch"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				v-slot="props"
				:sortable="column.sortable"
				:key="column.id"
			>
				<ColumnField :column="column" :data="props" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			width="145"
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
					v-if="userCan.addEditDonors"
					icon="edit"
					:tooltip="$t('Edit')"
					@click="showEdit(props.row.id)"
				/>
				<SafeDelete
					v-if="userCan.addEditDonors"
					icon="trash"
					:entity="$t('Donor')"
					:id="props.row.id"
					:tooltip="$t('Delete')"
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
				@onExport="exportDonors"
			/>
		</template>
	</Table>
</template>

<script>
import DonorService from "@/services/DonorService";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import ExportControl from "@/components/Export";
import SafeDelete from "@/components/SafeDelete";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT } from "@/consts";

export default {
	name: "DonorsList",

	components: {
		ExportControl,
		ColumnField,
		SafeDelete,
		Table,
		ActionButton,
	},

	mixins: [grid, permissions],

	data() {
		return {
			exportControl: {
				loading: false,
				location: "projects",
				types: [EXPORT.DONORS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ type: "text", key: "fullname", label: "Donor Name", width: "500", sortable: true },
					{ type: "text", key: "shortname", label: "Short Name", width: "200", sortable: true },
					{ type: "image", key: "logo", label: "Organization Logo", width: "200" },
					{ type: "text", key: "notes", width: "200" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "asc",
				sortColumn: "fullname",
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
			await DonorService.getListOfDonors(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Donors")} ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		async exportDonors(exportType, format) {
			if (exportType === EXPORT.DONORS) {
				try {
					this.exportControl.loading = true;

					const filename = `Donors ${normalizeExportDate()}`;
					const { data, status, message } = await DonorService.exportDonors(format);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Donors")} ${e.message || e}`, "is-danger");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
