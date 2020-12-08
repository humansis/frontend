<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="fetchData" />
			<ExportButton
				class="column"
				type="is-success"
				size="is-default"
				space-between
				:formats="{ xlsx: true, csv: true, ods: true}"
			/>
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
				<b-table-column
					sortable
					v-bind="column"
					v-slot="props"
					:key="column.id"
				>
					<ColumnField :column="column" :data="props" />
				</b-table-column>
			</template>

			<b-table-column
				v-slot="props"
				label="Actions"
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
						entity="Donor"
						:id="props.row.id"
						@submitted="remove"
					/>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import { generateColumns } from "@/utils/datagrid";
import DonorsService from "@/services/DonorsService";
import SafeDelete from "@/components/SafeDelete";
import ColumnField from "@/components/DataGrid/ColumnField";
import { Toast } from "@/utils/UI";
import ExportButton from "@/components/ExportButton";
import Search from "@/components/Search";
import grid from "@/mixins/grid";

export default {
	name: "DonorsList",

	components: {
		ExportButton,
		Search,
		ColumnField,
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
						type: "text",
						key: "fullname",
						label: "Donor Name",
					},
					{
						type: "text",
						key: "shortName",
					},
					{
						type: "image",
						key: "logo",
						label: "Organization Logo",
					},
					{
						type: "text",
						key: "notes",
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

			await DonorsService.getListOfDonors(
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
				Toast(`(Donors) ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		showDetailWithId(id) {
			const donor = this.table.data.find((item) => item.id === id);
			this.showDetail(donor);
		},

		showDetail(donor) {
			this.$emit("onShowDetail", donor);
		},

		remove(id) {
			this.$emit("onRemove", id);
		},

		showEdit(id) {
			const donor = this.table.data.find((item) => item.id === id);
			this.$emit("onShowEdit", donor);
		},
	},
};
</script>
