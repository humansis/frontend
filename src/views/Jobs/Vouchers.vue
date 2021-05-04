<!-- TODO Not used for now -->
<template>
	<div>
		<Modal
			can-cancel
			header="Detail of Voucher"
			:active="voucherModal.isOpened"
			@close="closeVoucherModal"
		>
			<VoucherForm
				close-button
				class="modal-card"
				form-disabled
				:formModel="voucherModel"
				@formClosed="closeVoucherModal"
			/>
		</Modal>
		<VouchersList
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import VoucherForm from "@/components/Jobs/VoucherForm";
import VouchersList from "@/components/Jobs/VouchersList";
import Modal from "@/components/Modal";

export default {
	name: "VouchersPage",

	components: {
		VouchersList,
		VoucherForm,
		Modal,
	},

	data() {
		return {
			voucherModal: {
				isOpened: false,
			},
			voucherModel: {
				id: null,
				who: "",
				where: "",
				what: "",
				status: "",
			},
		};
	},

	methods: {
		closeVoucherModal() {
			this.voucherModal.isOpened = false;
		},

		showDetail(voucher) {
			this.mapToFormModel(voucher);
			this.voucherModal = {
				isOpened: true,
			};
		},

		mapToFormModel(
			{
				id,
				who,
				where,
				what,
				status,
			},
		) {
			this.voucherModel = {
				...this.voucherModel,
				id,
				who,
				where,
				what,
				status,
			};
		},
	},
};
</script>
