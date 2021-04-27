<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">{{ $t('Vouchers') }}</h1>
			</div>

			<div class="level-right">
				<b-button
					v-if="userCan.addVouchers"
					type="is-primary"
					icon-left="plus"
					@click="addNewVoucher"
				>
					{{ $t('Add') }}
				</b-button>
			</div>
		</div>

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
				:submit-button-label="$t('Create')"
				:formModel="voucherModel"
				:form-disabled="voucherModal.isDetail"
				:is-editing="voucherModal.isEditing"
				@formSubmitted="submitVoucherForm"
				@formClosed="closeVoucherModal"
			/>
		</Modal>

		<!-- switch between two styles of displaying Batches/Vouchers list -->
		<BatchList
			v-if="false"
			ref="batchList"
			@onRemove="onRemoveVoucher"
			@onShowDetail="showDetail"
		/>
		<VoucherList
			ref="voucherList"
			@onRemove="onRemoveVoucher"
			@onShowDetail="showDetail"
			@onShowEdit="showEdit"
		/>
	</div>
</template>

<script>
import { mapState } from "vuex";
import VoucherList from "@/components/Voucher/VoucherList";
import VoucherForm from "@/components/Voucher/VoucherForm";
import BatchList from "@/components/Voucher/BatchList";
import Modal from "@/components/Modal";
import BookletsService from "@/services/BookletsService";
import { Toast, Notification } from "@/utils/UI";
import permissions from "@/mixins/permissions";

export default {
	name: "VouchersPage",

	components: {
		VoucherList,
		Modal,
		VoucherForm,
		BatchList,
	},

	mixins: [permissions],

	data() {
		return {
			voucherModal: {
				isOpened: false,
				isDetail: false,
				isWaiting: false,
				isEditing: false,
			},
			voucherModel: {
				id: null,
				quantityOfBooklets: 0,
				quantityOfVouchers: 0,
				values: "",
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
				result = this.$t("Detail of This Voucher Booklets");
			} else if (this.voucherModal.isEditing) {
				result = this.$t("Edit This Voucher Booklets");
			} else {
				result = this.$t("Create New Voucher Booklets");
			}
			return result;
		},

		...mapState(["country"]),
	},

	methods: {
		showDetail(voucher) {
			this.mapToFormModel(voucher);
			this.voucherModal = {
				isOpened: true,
				isDetail: true,
				isWaiting: false,
				isEditing: false,
			};
		},

		showEdit(voucher) {
			this.mapToFormModel(voucher);
			this.voucherModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
		},

		mapToFormModel(
			{
				id,
				project,
				quantityOfBooklets,
				quantityOfVouchers,
				projectId,
				password,
				status,
				code,
				currency,
				individualValues,
			},
		) {
			this.voucherModel = {
				...this.voucherModel,
				id,
				project,
				quantityOfBooklets,
				quantityOfVouchers,
				projectId,
				password,
				status,
				code,
				currency,
				values: individualValues,
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
				values: [],
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
				values,
				projectId,
				password,
				currency,
			} = voucherForm;
			const preparedValues = [];
			values.forEach((item) => {
				preparedValues.push(parseInt(item, 10));
			});
			const voucherBody = {
				quantityOfBooklets,
				quantityOfVouchers,
				values: preparedValues,
				projectId: projectId.id,
				password,
				iso3: this.country.iso3,
				currency: currency.value,
			};

			this.createVoucher(voucherBody);
		},

		async createVoucher(voucherBody) {
			this.voucherModal.isWaiting = true;

			await BookletsService.createBooklet(voucherBody).then((response) => {
				if (response.status === 204) {
					Toast(this.$t("Booklet Successfully Created"), "is-success");
					if (this.$refs.voucherList) {
						this.$refs.voucherList.fetchData();
					} else if (this.$refs.batchList) {
						this.$refs.batchList.fetchData();
					} else {
						this.$router.go();
					}
					this.closeVoucherModal();
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Booklet")} ${e}`, "is-danger");
				this.voucherModal.isWaiting = false;
			});
		},

		async onRemoveVoucher(id) {
			await BookletsService.removeBooklet(id).then((response) => {
				if (response.status === 204) {
					Toast(this.$t("Booklet successfully removed"), "is-success");
					this.$refs.voucherList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`${this.$t("Booklet")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
