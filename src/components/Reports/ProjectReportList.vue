<template>
	<div>
		<div>
			<label class="typo__label">Projects</label>
			<MultiSelect
				v-model="selectedProjectsForFilter"
				tag-placeholder="Add this as new tag"
				placeholder="Search"
				label="name"
				track-by="id"
				multiple
				:options="projectsForFilter"
			/>
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
				<b-table-column
					v-bind="column"
					:key="column.id"
				>
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
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import ProjectsService from "@/services/ProjectsService";
import ProjectReportService from "@/services/ProjectReportService";
import { generateColumns } from "@/utils/datagrid";
import { Toast } from "@/utils/UI";

export default {
	name: "ProjectReportList",

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
			},
			projectsForFilter: [],
			selectedProjectsForFilter: [],
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
				"desc",
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

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
