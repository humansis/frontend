<template>
	<div>
		<ReportNavbar
			@periodChanged="onPeriodFilterChange"
			@choosePeriodChanged="onChoosePeriodFilterChange"
		/>
		<Table
			has-reset-sort
			:key="resetSortKey"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			@clicked="goToDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
			@resetSort="resetSort"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" sortable :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
			<b-table-column label="Actions">
				<div class="block">
					<ActionButton icon="search" type="is-info" tooltip="Show Detail" />
					<ActionButton icon="trash" type="is-danger" tooltip="Delete" />
					<ActionButton icon="copy" type="is-dark" tooltip="Print" />
				</div>
			</b-table-column>
			<template slot="filterButton">
				<div class="box column is-four-fifths ml-4" style="width: 78%">
					<label class="typo__label">Projects</label>
					<MultiSelect
						v-model="selectedProjectsForFilter"
						tag-placeholder="Add this as new tag"
						placeholder="Search"
						label="name"
						track-by="id"
						multiple
						:options="projects"
						@input="fetchProjectReports"
					/>
				</div>
			</template>
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import ReportNavbar from "@/components/Reports/ReportNavbar";
import ProjectReportService from "@/services/ProjectReportService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";

export default {
	name: "ProjectReportList",

	components: {
		Table,
		ActionButton,
		ReportNavbar,
	},

	mixins: [grid],

	props: {
		projects: Array,
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "name", label: "Name" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
			},
			selectedProjectsForFilter: [],
			selectedPeriod: null,
			choosePeriod: null,
		};
	},

	watch: {
		$route: "fetchProjectReports",
	},

	mounted() {
		this.fetchProjectReports();
	},

	methods: {
		async fetchProjectReports() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await ProjectReportService.getListOfProjectReports(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.selectedPeriod,
				this.choosePeriod,
				this.selectedProjectsForFilter,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Notification(`Project Reports ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		goToDetail() {
			// TODO go to detail
		},

		onPeriodFilterChange(period) {
			this.selectedPeriod = period;
			this.fetchProjectReports();
		},

		onChoosePeriodFilterChange(choosePeriod) {
			this.choosePeriod = choosePeriod;
			this.fetchProjectReports();
		},
	},
};
</script>
