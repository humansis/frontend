<template>
	<div>
		<div class="columns">
			<Search class="column is-two-fifths" @search="onSearch" />
		</div>
		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			:is-loading="isLoadingList"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
			@changePerPage="onChangePerPage"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>
			<b-table-column
				v-slot="props"
				label="Actions"
				width="145"
				centered
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-info"
						tooltip="Show Detail"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Voucher"
						tooltip="Delete"
						:id="props.row.id"
						@submitted="remove"
					/>
					<ActionButton icon="print" type="is-dark" tooltip="Print" />
				</div>
			</b-table-column>
		</Table>
	</div>
</template>

<script>
import Search from "@/components/Search";
import Table from "@/components/DataGrid/Table";
import SafeDelete from "@/components/SafeDelete";
import ActionButton from "@/components/ActionButton";
import ProjectsService from "@/services/ProjectsService";
import BookletsService from "@/services/BookletsService";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import grid from "@/mixins/grid";

export default {
	name: "VoucherList",

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
					{ key: "project" },
					{ key: "code" },
					{ key: "quantityOfVouchers" },
					{ key: "individualValue" },
					{ key: "currency" },
					{ key: "status" },
					{ key: "beneficiary" },
					{ key: "distribution" },
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
				searchPhrase: "",
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.voucherModal.isDetail) {
				result = "Detail of Voucher";
			} else {
				result = "Create new Voucher";
			}
			return result;
		},
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await BookletsService.getListOfBooklets(
				this.table.currentPage,
				this.table.perPage,
				"desc",
				this.table.searchPhrase,
			).then((response) => {
				this.getProjectNameForBooklets(response.data);
			});

			this.isLoadingList = false;
		},

		async getProjectNameForBooklets(data) {
			data.forEach((booklet) => {
				const preparedBooklet = booklet;
				ProjectsService.getDetailOfProject(booklet.projectId)
					.then((response) => {
						preparedBooklet.project = response.data.name;
						this.table.data.push(preparedBooklet);
						this.table.total += 1;
					}).catch((e) => {
						Notification(`Project Detail ${e}`, "is-danger");
					});
			});
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
