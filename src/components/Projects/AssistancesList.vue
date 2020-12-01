<template>
	<div>
		<h2 class="title">Project assistances</h2>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="goToAddAssistance"
		>
			New
		</b-button>
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
					v-slot="props"
				>
					<ColumnField :data="props" :column="column" />
				</b-table-column>
			</template>

			<b-table-column
				v-slot="props"
				label="Actions"
			>
				<div class="block">
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="goToDetail(props.row.id)"
					/>
					<ActionButton
						icon="search"
						type="is-link"
					/>
					<ActionButton
						icon="lock"
						type="is-danger"
					/>
					<SafeDelete
						icon="trash"
						entity="Project"
						:id="props.row.id"
					/>
					<ActionButton icon="copy" type="is-dark" />
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import Table from "@/components/DataGrid/Table";
import AssistancesService from "@/services/AssistancesService";
import ColumnField from "@/components/DataGrid/ColumnField";
import { Toast } from "@/utils/UI";

export default {
	name: "AssistancesList",

	components: {
		Table,
		ActionButton,
		SafeDelete,
		ColumnField,
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "id",
						label: "Assistance ID",
					},
					{
						label: "Name",
					},
					{
						key: "adm1Id",
						label: "Location",
					},
					{
						key: "dateDistribution",
						label: "Date Of Distribution",
					},
					{
						label: "Target",
					},
					{
						label: "Type",
					},
					{
						type: "count",
						key: "commodityIds",
						label: "Commodity",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
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
			this.$store.commit("loading", true);

			await AssistancesService.getListOfProjectAssistances(
				this.$route.params.projectId,
				this.table.currentPage,
				this.table.perPage,
				"desc",
				false,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => { Toast(e, "is-danger"); });

			this.$store.commit("loading", false);
		},

		goToAddAssistance() {
			this.$router.push({ name: "AddAssistance", params: { projectId: this.$route.params.projectId } });
		},

		goToDetail(id) {
			this.$router.push({ name: "Assistance",
				params: {
					assistanceId: id,
				} });
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
