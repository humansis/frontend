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
		@resetSort="resetSort(TABLE.DEFAULT_SORT_OPTIONS.PROJECTS)"
		@rowClicked="goToDetail"
	>
		<template v-slot:actions="{ row }">
			<ButtonAction
				icon="search"
				label="Show Detail"
				@actionConfirmed="showDetail(row.id)"
			/>

			<ButtonAction
				icon="edit"
				label="Edit"
				@actionConfirmed="showEdit(row.id)"
			/>

			<ButtonAction
				:disabled="!row.deletable"
				icon="trash"
				label="Delete"
				icon-color="red"
				confirm-title="Deleting Project"
				confirm-message="Are you sure sure you want to delete Project?"
				prepend-icon="circle-exclamation"
				prepend-icon-color="red"
				is-confirm-action
				@actionConfirmed="remove(row.id)"
			/>
		</template>

		<template v-slot:export>
			<ExportControl
				:disabled="!table.data.length"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				@onExport="exportProjects"
			/>
		</template>
	</Table>
</template>

<script>
import { mapState } from "vuex";
import DonorService from "@/services/DonorService";
import ProjectService from "@/services/ProjectService";
import ButtonAction from "@/components/ButtonAction";
import Table from "@/components/DataGrid/Table";
import ExportControl from "@/components/Inputs/ExportControl";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT, TABLE } from "@/consts";

export default {
	name: "ProjectList",

	components: {
		ExportControl,
		Table,
		ButtonAction,
	},

	mixins: [permissions, grid, baseHelper],

	data() {
		return {
			TABLE,
			exportControl: {
				loading: false,
				location: "projects",
				types: [EXPORT.PROJECTS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: generateColumns([
					{ key: "id" },
					{ key: "name" },
					{ key: "sectors", type: "svgIcon", minWidth: "200", sortable: false },
					{ key: "startDate", type: "date" },
					{ key: "endDate", type: "date" },
					{ key: "donors" },
					{ key: "numberOfHouseholds", title: "Registered Households" },
					{ key: "beneficiariesReached", title: "Registered Individuals" },
					{ key: "actions", value: "actions", sortable: false },
				]),
				total: 0,
				currentPage: 1,
				sortDirection: TABLE.DEFAULT_SORT_OPTIONS.PROJECTS.order,
				sortColumn: TABLE.DEFAULT_SORT_OPTIONS.PROJECTS.key,
				searchPhrase: "",
			},
		};
	},

	computed: {
		...mapState(["availableProjects"]),
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

			await ProjectService.getListOfProjects(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== ""
					? `${this.table.sortColumn?.sortKey || this.table.sortColumn}.${this.table.sortDirection}`
					: "",
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.table.data = [];
				this.table.total = totalCount;
				if (data.length > 0) {
					this.prepareDataForTable(data);
				}
			}).catch((e) => {
				Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
			});

			this.isLoadingList = false;
		},

		prepareDataForTable(data) {
			const donorIds = [];
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].sectors = item.sectors
					.map((sector) => ({ code: sector, value: sector }));

				donorIds.push(...item.donorIds);
			});
			this.prepareDonorsForTable([...new Set(donorIds)]);
		},

		async prepareDonorsForTable(ids) {
			const donors = await this.getDonors(ids);
			this.table.data.forEach((item, key) => {
				this.table.data[key].donors = this.prepareDonors(item, donors);
			});
			this.reload();
		},

		prepareDonors(item, donors) {
			if (!donors?.length || !item.donorIds?.length) return this.$t("None");
			let result = "";

			item.donorIds.forEach((id) => {
				const foundDonor = donors.find((donor) => donor.id === id);

				if (foundDonor) {
					if (result === "") {
						result = foundDonor.shortname;
					} else {
						result += `, ${foundDonor.shortname}`;
					}
				}
			});

			return result;
		},

		async getDonors(ids) {
			return DonorService.getListOfDonors(null, null, null, null, ids)
				.then(({ data }) => data)
				.catch((e) => {
					Notification(`${this.$t("Donors")} ${e.message || e}`, "error");
				});
		},

		goToDetail({ item: { id } }) {
			if (this.userCan.viewProject) {
				this.$router.push({ name: "Project", params: { projectId: id } });
			}
		},

		async exportProjects(exportType, format) {
			if (exportType === EXPORT.PROJECTS) {
				try {
					this.exportControl.loading = true;

					const filters = { ...(this.table.searchPhrase && { fulltext: this.table.searchPhrase }) };
					const filename = `Projects ${normalizeExportDate()}`;
					const { data, status, message } = await ProjectService.exportProjects(
						format,
						filters,
					);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Projects")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
