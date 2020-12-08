<template>
	<div>
		<ReportNavbar
			@periodChanged="onPeriodFilterChange"
			@choosePeriodChanged="onChoosePeriodFilterChange"
		/>
		<div class="columns">
			<div class="box column is-four-fifths ml-4" style="width: 78%">
				<label class="typo__label">Projects</label>
				<MultiSelect
					v-model="selectedProjectsForFilter"
					tag-placeholder="Add this as new tag"
					placeholder="Search"
					label="name"
					track-by="id"
					multiple
					:options="projectsForFilter"
					@input="fetchProjectReports"
				/>
			</div>
		</div>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="goToDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
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
					<ActionButton icon="search" type="is-info" />
					<ActionButton icon="trash" type="is-danger" />
					<ActionButton icon="copy" type="is-dark" />
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import ProjectsService from "@/services/ProjectsService";
import ProjectReportService from "@/services/ProjectReportService";
import ReportNavbar from "@/components/Reports/ReportNavbar";
import grid from "@/mixins/grid";

export default {
	name: "ProjectReportList",

	components: {
		Table,
		ActionButton,
		ReportNavbar,
	},

	mixins: [grid],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "name",
						label: "Name",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
				sortDirection: "",
				sortColumn: "",
			},
			projectsForFilter: [],
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
		this.fetchProjects();
	},

	methods: {
		async fetchProjectReports() {
			this.$store.commit("loading", true);

			await ProjectReportService.getListOfProjectReports(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.selectedPeriod,
				this.choosePeriod,
				this.selectedProjectsForFilter,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Toast(`(Project Reports) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		async fetchProjects() {
			this.$store.commit("loading", true);

			await ProjectsService.getListOfProjects(
				1,
				15,
				"desc",
			).then((response) => {
				response.data.forEach(({ name, id }) => {
					this.projectsForFilter.push(
						{
							name,
							id,
						},
					);
				});
			}).catch((e) => {
				Toast(`(Projects) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
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
