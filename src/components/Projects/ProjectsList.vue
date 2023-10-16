<template>
	<Table
		v-show="show"
		has-reset-sort
		has-search
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		default-sort-direction="desc"
		default-sort-key="endDate"
		:is-loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		@clicked="goToDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
		@onSearch="onSearch"
	>
		<template v-for="column in table.columns">
			<b-table-column
				:sortable="column.sortable"
				v-bind="column"
				:key="column.id"
				v-slot="props"
			>
				<ColumnField :data="props" :column="column" />
			</b-table-column>
		</template>
		<b-table-column
			v-slot="props"
			width="180"
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
					v-if="userCan.editProject"
					icon="edit"
					:tooltip="$t('Edit')"
					@click="showEdit(props.row.id)"
				/>
				<SafeDelete
					v-if="userCan.deleteProject"
					icon="trash"
					:entity="$t('Project')"
					:tooltip="$t('Delete')"
					:disabled="!props.row.deletable"
					:id="props.row.id"
					@submitted="onDelete"
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
				@onExport="exportProjects"
			/>
		</template>
	</Table>
</template>

<script>
import { mapState } from "vuex";
import DonorService from "@/services/DonorService";
import ProjectService from "@/services/ProjectService";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import ExportControl from "@/components/Export";
import SafeDelete from "@/components/SafeDelete";
import baseHelper from "@/mixins/baseHelper";
import grid from "@/mixins/grid";
import permissions from "@/mixins/permissions";
import { generateColumns, normalizeExportDate } from "@/utils/datagrid";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT } from "@/consts";

export default {
	name: "ProjectList",

	components: {
		ExportControl,
		SafeDelete,
		Table,
		ActionButton,
		ColumnField,
	},

	mixins: [permissions, grid, baseHelper],

	data() {
		return {
			exportControl: {
				loading: false,
				location: "projects",
				types: [EXPORT.PROJECTS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", width: "90", sortable: true },
					{ key: "name", width: "200", sortable: true },
					{ key: "sectors", width: "150", type: "svgIcon" },
					{ key: "startDate", type: "date", width: "120", sortable: true },
					{ key: "endDate", type: "date", width: "120", sortable: true },
					{ key: "donors", width: "150" },
					{ key: "numberOfHouseholds", label: "Registered Households", width: "130", sortable: true },
					{ key: "beneficiariesReached", label: "Registered Individuals", width: "130", sortable: true },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "desc",
				sortColumn: "endDate",
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

			this.table.columns = generateColumns(this.table.visibleColumns);
			await ProjectService.getListOfProjects(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(async ({ data, totalCount }) => {
				this.table.data = [];
				this.table.total = totalCount;
				if (data.length > 0) {
					this.prepareDataForTable(data);
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
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
					if (e.message) Notification(`${this.$t("Donors")} ${e}`, "is-danger");
				});
		},

		goToDetail(project) {
			if (this.userCan.viewProject) this.$router.push({ name: "Project", params: { projectId: project.id } });
		},

		edit(id) {
			const project = this.table.data.find((item) => item.id === id);
			this.$emit("onEdit", project);
		},

		onDelete(id) {
			this.$emit("onDelete", id);
		},

		showDetailWithId(id) {
			const project = this.table.data.find((item) => item.id === id);
			this.$emit("showDetail", project);
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
					Notification(`${this.$t("Export Projects")} ${e.message || e}`, "is-danger");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},
	},
};
</script>
