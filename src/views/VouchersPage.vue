<template>
	<div>
		<h2 class="title">Vouchers</h2>
		<Modal
			can-cancel
			:active="voucherModal.isOpened"
			:header="modalHeader"
			:is-waiting="voucherModal.isWaiting"
			@close="closeVoucherModal"
		>
			<VoucherForm
				close-button
				class="modal-card"
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
		<!-- switch between two styles of displaying Batches/Vouchers list -->
		<BatchList
			@onRemove="onRemoveVoucher"
			@onShowDetail="showDetail"
		/>
		<VoucherList
			v-if="false"
			ref="voucherList"
			@onRemove="onRemoveVoucher"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import BookletsService from "@/services/BookletsService";
import VoucherForm from "@/components/Voucher/VoucherForm";
import { Toast, Notification } from "@/utils/UI";
import Modal from "@/components/Modal";
import VoucherList from "@/components/Voucher/VoucherList";
import BatchList from "@/components/Voucher/BatchList";

export default {
	name: "VouchersPage",

	components: {
		VoucherList,
		Modal,
		VoucherForm,
		BatchList,
	},

	data() {
		return {
			voucherModal: {
				isOpened: false,
				isDetail: false,
				isWaiting: false,
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

	computed: {
		modalHeader() {
			let result = "";
			if (this.voucherModal.isDetail) {
				result = "Detail Of This Voucher Booklets";
			} else {
				result = "Create New Voucher Booklets";
			}
			return result;
		},
	},

	methods: {
		showDetail(voucher) {
			this.mapToFormModel(voucher);
			this.voucherModal = {
				isOpened: true,
				isDetail: true,
				isWaiting: false,
			};
		},

		mapToFormModel(
			{
				id,
				project,
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
				project,
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
				isWaiting: false,
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
		},

		async createVoucher(voucherBody) {
			this.voucherModal.isWaiting = true;

			await BookletsService.createBooklet(voucherBody).then((response) => {
				if (response.status === 200) {
					Toast("Voucher Successfully Created", "is-success");
					this.$refs.voucherList.fetchData();
					this.closeVoucherModal();
				}
			}).catch((e) => {
				Notification(`Booklet ${e}`, "is-danger");
				this.voucherModal.isWaiting = false;
			});
		},

		async onRemoveVoucher(id) {
			await BookletsService.removeBooklet(id).then((response) => {
				if (response.status === 204) {
					Toast("Voucher successfully removed", "is-success");
					this.$refs.voucherList.removeFromList(id);
				}
			}).catch((e) => {
				Notification(`Booklet ${e}`, "is-danger");
			});
		},
	},
};
</script>
