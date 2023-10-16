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
		@resetSort="resetSort"
		@onSearch="onSearch"
	>
		<template v-for="column in table.columns">
			<b-table-column v-bind="column" sortable :key="column.id">
				<template v-slot="props">
					{{ props.row[column.field] }}
				</template>
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			width="190"
			field="actions"
			:label="$t('Actions')"
		>
			<div class="buttons is-right">
				<ActionButton
					v-if="userCan.viewBeneficiary"
					icon="search"
					type="is-primary"
					:tooltip="$t('Show Detail')"
					@click="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					v-if="userCan.editBeneficiary"
					icon="edit"
					:tooltip="$t('Edit')"
					@click="showEdit(props.row.id)"
				/>
				<SafeDelete
					v-if="userCan.deleteBeneficiary"
					icon="trash"
					:entity="$t('Institution')"
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
				@onExport="exportInstitutions"
			/>
		</template>

		<template #filterButton>
			<b-button
				slot="trigger"
				:icon-right="advancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				@click="filtersToggle"
			>
				{{ $t('Advanced Search') }}
			</b-button>
		</template>

		<template #filter>
			<b-collapse v-model="advancedSearchVisible">
				<InstitutionsFilter
					@filtersChanged="onFiltersChange"
					@onSearch="onSearch(table.searchPhrase)"
				/>
			</b-collapse>
		</template>
	</Table>
</template>

<script>
import InstitutionService from "@/services/InstitutionService";
import ActionButton from "@/components/ActionButton";
import InstitutionsFilter from "@/components/Beneficiaries/InstitutionsFilter";
import Table from "@/components/DataGrid/Table";
import ExportControl from "@/components/Export";
import SafeDelete from "@/components/SafeDelete";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT } from "@/consts";

export default {
	name: "InstitutionsList",

	components: {
		InstitutionsFilter,
		SafeDelete,
		Table,
		ActionButton,
		ExportControl,
	},

	mixins: [grid, permissions],

	data() {
		return {
			advancedSearchVisible: false,
			exportControl: {
				loading: false,
				location: "institutions",
				types: [EXPORT.INSTITUTIONS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			filters: [],
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id" },
					{ key: "name" },
					{ key: "type" },
					{ key: "contactGivenName" },
					{ key: "contactFamilyName" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
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
			await InstitutionService.getListOfInstitutions(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
				this.filters,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.total = totalCount;

				this.prepareDataForTable(data);
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Institutions")} ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].type = normalizeText(item.type);
			});
		},

		onFiltersChange({ filters }) {
			this.filters = filters;
		},

		showDetail(entity) {
			if (this.userCan.viewBeneficiary) this.$emit("showDetail", entity);
		},

		async exportInstitutions(type, format) {
			if (type === EXPORT.INSTITUTIONS) {
				const filters = {
					...(this.filters.projects?.length
						&& { projects: this.filters.projects }),
				};

				try {
					this.exportControl.loading = true;

					const { data, status, message } = await InstitutionService.exportInstitutions(
						format,
						filters,
					);

					downloadFile(data, this.$t("Institutions"), status, format, message);
				} catch (e) {
					Notification(`${this.$t("Institutions Export")} ${e.message || e}`, "is-danger");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
