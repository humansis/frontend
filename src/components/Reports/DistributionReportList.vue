<template>
	<div>
		<div class="ml-1 columns box" style="width: 80%">
			<div class="column is-half">
				<label class="typo__label">Projects</label>
				<MultiSelect
					v-model="selectedProjectsForFilter"
					tag-placeholder="Add this as new tag"
					placeholder="Search"
					label="name"
					track-by="id"
					:options="projectsForFilter"
					@input="fetchDistributions"
				/>
			</div>
			<div class="column is-half">
				<label class="typo__label">Distributions</label>
				<MultiSelect
					v-model="selectedDistributionForFilter"
					tag-placeholder="Add this as new tag"
					placeholder="Search"
					label="name"
					track-by="id"
					:options="distributionsForFilter"
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

			<b-table-column
				label="Actions"
			>
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
import AssistancesService from "@/services/AssistancesService";
import DistributionReportService from "@/services/DistributionReportService";

export default {
	name: "DistributionReportList",

	components: {
		Table,
		ActionButton,
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
				perPage: 15,
				sortDirection: "",
				sortColumn: "",
			},
			projectsForFilter: [],
			distributionsForFilter: [],
			selectedProjectsForFilter: [],
			selectedDistributionForFilter: [],
		};
	},

	watch: {
		$route: "fetchDistributionReports",
	},

	mounted() {
		this.fetchDistributionReports();
		this.fetchProjects();
	},

	methods: {
		async fetchDistributionReports() {
			this.$store.commit("loading", true);

			await DistributionReportService.getListOfDistributionReports(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Toast(`(Distribution Reports) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		async fetchProjects() {
			this.$store.commit("loading", true);

			await ProjectsService.getListOfProjects(
				1,
				15,
				"desc",
			)
				.then((response) => {
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

		async fetchDistributions() {
			this.$store.commit("loading", true);

			this.distributionsForFilter = [];
			await AssistancesService.getListOfProjectAssistances(
				this.selectedProjectsForFilter.id,
				1,
				15,
				"desc",
			).then((response) => {
				response.data.forEach(({ name, id }) => {
					this.distributionsForFilter.push(
						{
							name,
							id,
						},
					);
				});
			}).catch((e) => {
				Toast(`(Project Assistances) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		goToDetail() {
			// TODO go to detail
		},

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
