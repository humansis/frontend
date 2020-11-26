<template>
	<div>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search..."
						type="search"
						icon="search"
					/>
				</b-field>
			</div>
		</div>

		<b-collapse
			class="panel"
			animation="slide"
			v-for="(collapse, index) of collapses"
			:key="index"
			:open="isOpen == index"
			@open="isOpen = index"
		>
			<div
				slot="trigger"
				class="card-header"
				role="button"
			>
				<p class="card-header-title">
					<b-tag type="is-primary mr-1">{{ index + 1 }}. Batch</b-tag>
					<b-tag type="is-info mr-1">20 x Booklets</b-tag>
					<b-tag type="is-success mr-3">20 x Vouchers</b-tag>
					{{ collapse.title }}
				</p>
				<a class="card-header-icon">
					<b-icon icon="arrow-down" />
				</a>
			</div>
			<div class="card-content">
				<Table
					checkable
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

					<b-table-column v-slot="props" label="Actions">
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
		</b-collapse>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import BookletsService from "@/services/BookletsService";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import ProjectsService from "@/services/ProjectsService";
import SafeDelete from "@/components/SafeDelete";

export default {
	name: "BatchList",

	components: {
		SafeDelete,
		Table,
		ActionButton,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			isOpen: 0,
			collapses: [
				{
					title: "SYR_Dev SYR Project_25-11-2020_batch000001",
					text: "Text 1",
				},
				{
					title: "SYR_Dev SYR Project_25-11-2020_batch000001",
					text: "Text 2",
				},
				{
					title: "SYR_Dev SYR Project_25-11-2020_batch000001",
					text: "Text 3",
				},
			],
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
			try {
				this.fetch.error = null;
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
			} catch (error) {
				this.handleError(error);
			}
		},

		async getProjectNameForBooklets(data) {
			const booklets = [];
			data.forEach((booklet) => {
				const preparedBooklet = booklet;
				ProjectsService.getDetailOfProject(booklet.projectId)
					.then((response) => {
						preparedBooklet.project = response.data.name;
						booklets.push(preparedBooklet);
					});
			});
			return booklets;
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
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
