<template>
	<Table
		v-model:items-per-page="perPage"
		v-model:sort-by="sortValue"
		:headers="table.columns"
		:items="table.data"
		:total-count="table.total"
		:loading="isLoadingList"
		reset-sort-button
		is-search-visible
		@per-page-changed="perPageChange"
		@page-changed="pageChange"
		@update:sortBy="onSort"
		@search="search"
		@resetSort="resetSort(TABLE.DEFAULT_SORT_OPTIONS.INSTITUTIONS)"
		@rowClicked="(row) => showDetail(row.item.id)"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				v-if="userCan.viewBeneficiary"
				icon="search"
				tooltip-text="Show Detail"
				@actionConfirmed="showDetail(row.id)"
			/>

			<ButtonAction
				v-if="userCan.editBeneficiary"
				icon="edit"
				tooltip-text="Edit"
				@actionConfirmed="showEdit(row.id)"
			/>

			<ButtonAction
				v-if="userCan.deleteBeneficiary"
				icon="trash"
				tooltip-text="Delete"
				icon-color="red"
				confirm-title="Deleting Institution"
				confirm-message="Are you sure sure you want to delete Institution?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				close-button-name="Cancel"
				confirm-button-name="Delete"
				is-confirm-action
				@actionConfirmed="remove(row.id)"
			/>
		</template>

		<template v-slot:tableControls>
			<ExportControl
				:disabled="!table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@onExport="exportInstitutions"
			/>

			<v-btn
				:append-icon="isAdvancedSearchVisible ? 'arrow-up' : 'arrow-down'"
				size="small"
				color="blue-grey-lighten-4"
				variant="elevated"
				class="ml-4 text-none"
				@click="advancedSearchToggle"
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
							@onSearch="search(table.searchPhrase)"
						/>
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</template>
	</Table>
</template>

<script>
import InstitutionService from "@/services/InstitutionService";
import InstitutionsFilter from "@/components/Beneficiaries/InstitutionsFilter";
import ButtonAction from "@/components/ButtonAction";
import Table from "@/components/DataGrid/Table";
import ExportControl from "@/components/Inputs/ExportControl";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeText } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, TABLE } from "@/consts";

export default {
	name: "InstitutionsList",

	components: {
		InstitutionsFilter,
		Table,
		ExportControl,
		ButtonAction,
	},

	mixins: [grid, permissions],

	data() {
		return {
			TABLE,
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
					{ key: "id" },
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
			this.isLoadingList = true;

			await InstitutionService.getListOfInstitutions(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "",
				this.table.searchPhrase,
				this.filters,
			).then(({ data, totalCount }) => {
				this.table.data = [];
				this.table.total = totalCount;

				this.prepareDataForTable(data);
			}).catch((e) => {
				Notification(`${this.$t("Institutions")} ${e.message || e}}`, "error");
			});

			this.isLoadingList = false;
		},

		advancedSearchToggle() {
			this.isAdvancedSearchVisible = !this.isAdvancedSearchVisible;
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].type = normalizeText(item.type);
			});
		},

		onFiltersChange(filters) {
			this.filters = filters;
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
					Notification(`${this.$t("Institutions Export")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
