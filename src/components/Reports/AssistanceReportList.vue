<template>
	<div>
		<ReportNavbar
			@periodChanged="onPeriodFilterChange"
			@choosePeriodChanged="onChoosePeriodFilterChange"
		/>
		<div class="ml-1 columns box" style="width: 80%">
			<div class="column is-half">
				<label class="typo__label">Projects</label>
				<MultiSelect
					v-model="selectedProjectsForFilter"
					tag-placeholder="Add this as new tag"
					placeholder="Search"
					label="name"
					track-by="id"
					:loading="isProjectsLoading"
					:options="projects"
					@input="fetchAssistance"
				/>
			</div>
			<div class="column is-half">
				<label class="typo__label">Assistance</label>
				<MultiSelect
					v-model="selectedAssistanceForFilter"
					tag-placeholder="Add this as new tag"
					placeholder="Search"
					label="name"
					track-by="id"
					:loading="isAssistanceLoading"
					:options="options.assistance"
					@input="fetchAssistancesReports"
				/>
			</div>
		</div>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:is-loading="isLoadingList"
			@clicked="goToDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" sortable :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
			<b-table-column
				label="Actions"
			>
				<div class="block">
					<ActionButton icon="search" type="is-info" tooltip="Show Detail" />
					<ActionButton icon="trash" type="is-danger" tooltip="Delete" />
					<ActionButton icon="copy" type="is-dark" tooltip="Print" />
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import ReportNavbar from "@/components/Reports/ReportNavbar";
import ProjectsService from "@/services/ProjectsService";
import AssistancesService from "@/services/AssistancesService";
import AssistanceReportService from "@/services/AssistanceReportService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";

export default {
	name: "AssistanceReportList",

	components: {
		ReportNavbar,
		Table,
		ActionButton,
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
					{
						key: "name",
						label: "Name",
					},
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
			},
			selectedPeriod: null,
			choosePeriod: null,
			options: {
				assistance: [],
			},
			selectedProjectsForFilter: [],
			selectedAssistanceForFilter: [],
			isProjectsLoading: false,
			isAssistanceLoading: false,
		};
	},

	watch: {
		$route: "fetchAssistancesReports",
	},

	mounted() {
		this.fetchAssistancesReports();
	},

	methods: {
		async fetchAssistancesReports() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await AssistanceReportService.getListOfAssistanceReports(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.selectedPeriod,
				this.choosePeriod,
				this.selectedAssistanceForFilter,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
			}).catch((e) => {
				Notification(`Assistance Reports ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		async fetchProjects() {
			this.isProjectsLoading = true;

			await ProjectsService.getListOfProjects()
				.then((response) => {
					this.options.projects = response.data;
				}).catch((e) => {
					Notification(`Projects ${e}`, "is-danger");
				});

			this.isProjectsLoading = false;
		},

		async fetchAssistance() {
			this.isAssistanceLoading = true;

			this.selectedAssistanceForFilter = [];
			await AssistancesService.getListOfProjectAssistances(this.selectedProjectsForFilter.id)
				.then((response) => {
					this.options.assistance = response.data;
				}).catch((e) => {
					Notification(`Project Assistances ${e}`, "is-danger");
				});

			this.isAssistanceLoading = false;
		},

		goToDetail() {
			// TODO go to detail
		},

		onPeriodFilterChange(period) {
			this.selectedPeriod = period;
			this.fetchAssistancesReports();
		},

		onChoosePeriodFilterChange(choosePeriod) {
			this.choosePeriod = choosePeriod;
			this.fetchAssistancesReports();
		},
	},
};
</script>
