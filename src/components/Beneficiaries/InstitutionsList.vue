<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="fetchData" />
		</div>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="showDetail"
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
				v-slot="props"
				label="Actions"
				width="180"
				centered
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-link"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="showEdit(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Institute"
						:id="props.row.id"
						@submitted="remove"
					/>
					<ActionButton icon="print" type="is-dark" />
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import InstitutionsService from "@/services/InstitutionsService";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import { Toast } from "@/utils/UI";
import Search from "@/components/Search";
import grid from "@/mixins/grid";

export default {
	name: "InstitutionsList",

	components: {
		Search,
		SafeDelete,
		Table,
		ActionButton,
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
					},
					{
						key: "type",
					},
					{
						key: "contactGivenName",
						label: "Contact Name",
					},
					{
						key: "contactFamilyName",
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
		async fetchData(value) {
			this.$store.commit("loading", true);

			await InstitutionsService.getListOfInstitutions(
				this.table.currentPage,
				this.table.perPage,
				this.table.sortColumn !== "" ? `${this.table.sortColumn}.${this.table.sortDirection}` : "",
				value,
			).then((response) => {
				this.table.data = response.data;
				this.table.total = response.totalCount;
				this.table.columns = generateColumns(
					this.table.visibleColumns,
				);
			}).catch((e) => {
				Toast(`(Institutions) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		showEdit(id) {
			const institution = this.table.data.find((item) => item.id === id);
			this.$emit("onShowEdit", institution);
		},

		showDetailWithId(id) {
			const institution = this.table.data.find((item) => item.id === id);
			this.showDetail(institution);
		},

		showDetail(institution) {
			this.$emit("onShowDetail", institution);
		},

		remove(id) {
			this.$emit("onRemove", id);
		},
	},
};
</script>
