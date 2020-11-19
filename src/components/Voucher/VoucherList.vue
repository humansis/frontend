<template>
	<div>
		<h2 class="title">Vouchers</h2>
		<Modal
			can-cancel
			:active="voucherModal.isOpened"
			:header="modalHeader"
			@close="closeVoucherModal"
		>
			<VoucherForm
				close-button
				submit-button-label="Create"
				:formModel="voucherModel"
				:form-disabled="voucherModal.isDetail"
				@formSubmitted="submitVoucherForm"
				@formClosed="closeVoucherModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewVoucher"
		>
			Add
		</b-button>
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
						@submitted="onRemoveVoucher"
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
import Table from "@/components/Table/Table";
import ActionButton from "@/components/ActionButton";
import ProjectsService from "@/services/ProjectsService";
import VoucherForm from "@/components/Voucher/VoucherForm";
import SafeDelete from "@/components/SafeDelete";
import { Toast } from "@/utils/UI";
import Modal from "@/components/Modal";

export default {
	name: "VoucherList",

	components: {
		Modal,
		SafeDelete,
		VoucherForm,
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
			voucherModal: {
				isOpened: false,
				isDetail: false,
			},
			voucherModel: {
				id: null,
				quantityOfBooklets: 0,
				quantityOfVouchers: 0,
				individualValue: "",
				projectId: 0,
				project: "",
				password: "",
				status: 0,
				code: "",
				defineAPassword: false,
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
			this.mapToFormModel(voucher);
			this.voucherModal = {
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel(
			{
				id,
				quantityOfBooklets,
				quantityOfVouchers,
				individualValue,
				projectId,
				password,
				status,
				code,
			},
		) {
			this.voucherModel = {
				...this.voucherModel,
				id,
				quantityOfBooklets,
				quantityOfVouchers,
				individualValue,
				projectId,
				password,
				status,
				code,
			};
		},

		closeVoucherModal() {
			this.voucherModal.isOpened = false;
		},

		addNewVoucher() {
			this.voucherModal = {
				isOpened: true,
				isDetail: false,
			};

			this.voucherModel = {
				...this.voucherModel,
				id: null,
				quantityOfBooklets: 1,
				quantityOfVouchers: 1,
				individualValue: "",
				projectId: null,
				project: "",
				password: "",
				status: null,
				code: "",
				defineAPassword: false,
			};
		},

		submitVoucherForm(voucherForm) {
			const {
				quantityOfBooklets,
				quantityOfVouchers,
				individualValue,
				projectId,
				password,
			} = voucherForm;

			const voucherBody = {
				quantityOfBooklets,
				quantityOfVouchers,
				individualValue,
				projectId,
				password,
				status: 0,
			};

			this.createVoucher(voucherBody);

			this.closeVoucherModal();
		},

		async createVoucher(voucherBody) {
			await BookletsService.createBooklet(voucherBody).then((response) => {
				if (response.status === 200) {
					Toast("Voucher Successfully Created", "is-success");
					this.fetchData();
				}
			});
		},

		async onRemoveVoucher(id) {
			await BookletsService.removeBooklet(id)
				.then((response) => {
					if (response.status === 204) {
						Toast("Voucher successfully removed", "is-success");
						this.fetchData();
					}
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
