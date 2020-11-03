<template>
	<div>
		<PeriodFilter />
		<div>
			<label class="typo__label">Projects</label>
			<MultiSelect
				v-model="selectedProjectsForFilter"
				tag-placeholder="Add this as new tag"
				placeholder="Search"
				label="name"
				track-by="id"
				:options="projectsForFilter"
				:multiple="true"/>
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
						<div v-if="column.field === 'donorIds'">
							{{ props.row[column.field].length }}
						</div>
						<div v-else>
							{{ props.row[column.field] }}
						</div>
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
import Table from "@/components/Table";
import ActionButton from "@/components/ActionButton";
import { fetcher } from "@/utils/fetcher";
import { generateColumnsFromData } from "@/utils/datagrid";
import PeriodFilter from "@/components/Reports/PeriodFilter";
import MultiSelect from "vue-multiselect";
import ProjectsService from "@/services/ProjectsService";

export default {
	name: "ProjectReportList",

	components: {
		MultiSelect,
		PeriodFilter,
		Table,
		ActionButton,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			projectsForFilter: [],
			selectedProjectsForFilter: [],
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
		this.fetchProjects();
	},

	methods: {
		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open({
					container: this.$refs.projectList,
				});

				this.table.data = [];
				this.table.columns = [];

				const uri = "country_options?page=1&size=15&sort=asc";
				const { data: { data } } = await fetcher({ uri, auth: true });

				this.table.data = data;
				this.table.columns = generateColumnsFromData(data);

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		async fetchProjects() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open({
					container: this.$refs.projectList,
				});

				await ProjectsService.getAllProjects(
					this.table.currentPage,
					this.table.perPage,
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
				});

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
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
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style scoped>

</style>
