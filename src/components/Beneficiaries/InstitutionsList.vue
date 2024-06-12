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
		is-frontend-sort-disabled
		@perPageChanged="onPerPageChange"
		@pageChanged="onPageChange"
		@update:sortBy="onSort"
		@search="onSearch"
		@resetSort="onResetSort(TABLE.DEFAULT_SORT_OPTIONS.INSTITUTIONS)"
		@rowClicked="(row) => onShowDetail(row.item.id)"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				v-if="userCan.viewBeneficiary"
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="onShowDetail(row.id)"
			/>

			<ButtonAction
				v-if="userCan.editBeneficiary"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="onShowEdit(row.id)"
			/>

			<ButtonAction
				v-if="userCan.deleteBeneficiary"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting Institution"
				confirm-message="Are you sure you want to delete Institution?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				close-button-name="Cancel"
				confirm-button-name="Delete"
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
				@export="onExportInstitutions"
			/>

			<v-btn
				:append-icon="isAdvancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				color="blue-grey-lighten-4"
				variant="elevated"
				class="ml-4 text-none"
				@click="onAdvancedSearchToggle"
			>
				{{ $t('Advanced Search') }}
			</v-btn>
		</template>

		<template v-slot:advancedControls>
			<v-expansion-panels v-model="isAdvancedSearchVisible">
				<v-expansion-panel :value="true">
					<v-expansion-panel-text>
						<InstitutionsFilter
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
import InstitutionService from "@/services/InstitutionService";
import InstitutionsFilter from "@/components/Beneficiaries/InstitutionsFilter";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import ExportControl from "@/components/Inputs/ExportControl";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, TABLE } from "@/consts";

export default {
	name: "InstitutionsList",

	components: {
		InstitutionsFilter,
		DataGrid,
		ExportControl,
		ButtonAction,
	},

	mixins: [grid, permissions],

	data() {
		return {
			TABLE,
			isLoadingList: false,
			isAdvancedSearchVisible: false,
			exportControl: {
				loading: false,
				location: "institutions",
				types: [EXPORT.INSTITUTIONS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			filters: [],
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id", sortable: false },
					{ key: "name" },
					{ key: "type" },
					{ key: "contactGivenName" },
					{ key: "contactFamilyName" },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.INSTITUTIONS.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.INSTITUTIONS.key,
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
				} = await InstitutionService.getListOfInstitutions({
					page: this.table.currentPage,
					size: this.perPage,
					search: this.table.searchPhrase,
					filters: this.filters,
					sort,
				});

				this.table.data = [];

				checkResponseStatus(status, message);

				this.table.total = totalCount;
				this.prepareDataForTable(data);
			} catch (e) {
				Notification(`${this.$t("Institutions")}: ${e.message || e}}`, "error");
			} finally {
				this.isLoadingList = false;
			}
		},

		onAdvancedSearchToggle() {
			this.isAdvancedSearchVisible = !this.isAdvancedSearchVisible;
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = {
					...item,
					type: normalizeText(item.type),
				};
			});
		},

		onFiltersChange(filters) {
			this.filters = filters;
		},

		async onExportInstitutions(type, format) {
			if (type === EXPORT.INSTITUTIONS) {
				const sort = `${this.table.sortColumn?.sortKey
					|| this.table.sortColumn}.${this.table.sortDirection}`;
				const filters = {
					...(this.filters.projects?.length
						&& { projects: this.filters.projects }),
					...(this.table.searchPhrase && { fulltext: this.table.searchPhrase }),
				};

				try {
					this.exportControl.loading = true;

					const {
						data,
						status,
						message,
					} = await InstitutionService.exportInstitutions({
						format,
						sort,
						filters,
					});

					downloadFile(data, this.$t("Institutions"), status, format, message);
				} catch (e) {
					Notification(`${this.$t("Institutions Export")}: ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
