<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="fetchProjects" />
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
					sortable
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
				<div class="block">
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="edit(props.row.id)"
					/>
					<ActionButton
						icon="search"
						type="is-link"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Project"
						:id="props.row.id"
						@submitted="onDelete"
					/>
					<ActionButton icon="copy" type="is-dark" />
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import AssistancesService from "@/services/AssistancesService";
import ProjectsService from "@/services/ProjectsService";
import HomeService from "@/services/HomeService";
import SectorsService from "@/services/SectorsService";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import ColumnField from "@/components/DataGrid/ColumnField";
import Search from "@/components/Search";
import grid from "@/mixins/grid";

export default {
	name: "ProjectsList",

	props: {
		projectModel: Object,
	},

	mixins: [grid],

	components: {
		Search,
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
					{
						key: "name",
					},
					{
						type: "count",
						key: "donorIds",
					},
					{
						key: "startDate",
					},
					{
						key: "endDate",
					},
					{
						key: "target",
					},
					{
						key: "numberOfHouseHolds",
						width: "120",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
				sortDirection: "",
				sortColumn: "",
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
		async fetchData() {
			await this.fetchProjects();

			await SectorsService.getListOfSectors().then((response) => {
				this.projectModel.sectors = response.data;
			}).catch((e) => {
				Toast(`(Sectors) ${e}`, "is-danger");
			});

			await HomeService.getListOfDonors().then((response) => {
				this.projectModel.donors = response.data;
			}).catch((e) => {
				Toast(`(Donors) ${e}`, "is-danger");
			});

			await AssistancesService.getListOfTargetTypesForAssistances().then((response) => {
				this.projectModel.targetTypes = response.data;
			}).catch((e) => {
				Toast(`(Target Types) ${e}`, "is-danger");
			});
		},

		async fetchProjects(value) {
			this.$store.commit("loading", true);

			await ProjectsService.getListOfProjects(
				this.table.currentPage,
				this.table.perPage,
				"desc",
				value,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(this.table.visibleColumns);
			}).catch((e) => {
				Toast(`(Projects) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		mapToFormModel({
			id,
			name,
			sectorIds,
			donorIds,
			target: totalTarget,
			notes,
		}) {
			this.projectModel = {
				...this.projectModel,
				id,
				name,
				internalId: id,
				selectedSectors: getArrayOfCodeListByKey(sectorIds, this.projectModel.sectors, "code"),
				startDate: new Date("10.10.2020"),
				endDate: new Date("10.10.2020"),
				selectedDonors: getArrayOfCodeListByKey(donorIds, this.projectModel.donors, "id"),
				selectedTargetType: getArrayOfCodeListByKey([], this.projectModel.targetTypes, "code"),
				totalTarget,
				notes,
			};
		},

		goToDetail(project) {
			this.$router.push({ name: "Project", params: { projectId: project.id } });
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
