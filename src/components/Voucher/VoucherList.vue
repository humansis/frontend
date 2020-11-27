<template>
	<div>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field label="Search...">
					<b-input
						type="search"
						icon="search"
					/>
				</b-field>
			</div>
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
				<b-table-column v-bind="column" :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>

			<b-table-column
				v-slot="props"
				label="Actions"
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-info"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Voucher"
						:id="props.row.id"
						@submitted="onRemove"
					/>
					<ActionButton icon="print" type="is-dark" />
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import BookletsService from "@/services/BookletsService";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import ProjectsService from "@/services/ProjectsService";
import SafeDelete from "@/components/SafeDelete";
import { Toast } from "@/utils/UI";

export default {
	name: "VoucherList",

	components: {
		SafeDelete,
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
						key: "project",
						label: "Project",
					},
					{
						key: "code",
						label: "Code",
					},
					{
						key: "quantityOfVouchers",
						label: "Quantity Of Vouchers",
					},
					{
						key: "individualValue",
						label: "Individual Value",
					},
					{
						key: "status",
						label: "Status",
					},
					{
						key: "beneficiary",
						label: "Beneficiary",
					},
					{
						key: "distribution",
						label: "Distribution",
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
			const loadingComponent = this.$buefy.loading.open();

			await BookletsService.getListOfBooklets(
				this.table.currentPage,
				this.table.perPage,
				"desc",
			).then((response) => {
				this.getProjectNameForBooklets(response.data).then((data) => {
					this.table.data = data;
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(
						this.table.visibleColumns,
					);
				});
			});

			loadingComponent.close();
		},

		async getProjectNameForBooklets(data) {
			const booklets = [];
			data.forEach((booklet) => {
				const preparedBooklet = booklet;
				ProjectsService.getDetailOfProject(booklet.projectId)
					.then((response) => {
						preparedBooklet.project = response.data.name;
						booklets.push(preparedBooklet);
					}).catch((e) => { Toast(e, "is-danger"); });
			});
			return booklets;
		},

		showDetailWithId(id) {
			const voucher = this.table.data.find((item) => item.id === id);
			this.showDetail(voucher);
		},

		showDetail(voucher) {
			this.$emit("onShowDetail", voucher);
		},

		onRemove(id) {
			this.$emit("onRemove", id);
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
