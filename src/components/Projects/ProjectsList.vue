<template>
	<Table
		has-reset-sort
		has-search
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		@clicked="goToDetail"
		@pageChanged="onPageChange"
		@sorted="onSort"
		@changePerPage="onChangePerPage"
		@resetSort="resetSort"
		@search="onSearch"
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
			label="Actions"
			centered
			width="180"
		>
			<div class="buttons is-right">
				<ActionButton
					icon="search"
					type="is-primary"
					tooltip="Show Detail"
					@click.native="showDetailWithId(props.row.id)"
				/>
				<ActionButton
					icon="edit"
					tooltip="Edit"
					@click.native="edit(props.row.id)"
				/>
				<SafeDelete
					icon="trash"
					entity="Project"
					tooltip="Delete"
					:disabled="!props.row.deletable"
					:id="props.row.id"
					@submitted="onDelete"
				/>
				<ActionButton
					icon="copy"
					type="is-dark"
					tooltip="Print"
				/>
			</div>
		</b-table-column>
	</Table>
</template>

<script>
import { mapActions } from "vuex";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import ColumnField from "@/components/DataGrid/ColumnField";
import ProjectsService from "@/services/ProjectsService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";

export default {
	name: "ProjectsList",

	props: {
		projectModel: Object,
	},

	mixins: [grid],

	components: {
		SafeDelete,
		Table,
		ActionButton,
		ColumnField,
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "id", width: "90", sortable: true },
					{ key: "name", width: "434", sortable: true },
					{ key: "donorIds", label: "Donors", type: "count", width: "100" },
					{ key: "startDate", type: "date", width: "120", sortable: true },
					{ key: "endDate", type: "date", width: "120", sortable: true },
					{ key: "target", width: "90" },
					{ key: "numberOfHouseholds", width: "130", sortable: true },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		...mapActions(["addProjectToState"]),

		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await ProjectsService.getListOfProjects(
				this.table.currentPage,
				this.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				this.table.searchPhrase,
			).then(({ data, totalCount }) => {
				this.table.data = data;
				this.table.total = totalCount;
			}).catch((e) => {
				Notification(`Projects ${e}`, "is-danger");
			});

			this.isLoadingList = false;
		},

		goToDetail(project) {
			this.addProjectToState(project);
			this.$router.push({ name: "ProjectDetail", params: { projectId: project.id } });
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
			this.$emit("onShowDetail", project);
		},

	},
};
</script>
