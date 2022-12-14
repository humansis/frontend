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
				:submit-button-label="voucherModal.isEditing ? $t('Update') : $t('Create')"
				:formModel="voucherModel"
				:form-disabled="voucherModal.isDetail"
				:is-editing="voucherModal.isEditing"
				@formSubmitted="submitVoucherForm"
				@formClosed="closeVoucherModal"
			/>
		</Modal>

		<!-- switch between two styles of displaying Batches/Vouchers list -->
		<BatchesList
			v-if="false"
			ref="batchesList"
			@onRemove="onRemoveVoucher"
			@onShowDetail="showDetail"
		/>
		<VouchersList
			ref="vouchersList"
			@onRemove="onRemoveVoucher"
			@onShowDetail="showDetail"
			@onShowEdit="showEdit"
		/>
	</div>
</template>

<script>
import { mapState } from "vuex";
import VouchersList from "@/components/Vouchers/VouchersList";
import VoucherForm from "@/components/Vouchers/VoucherForm";
import BatchesList from "@/components/Vouchers/BatchesList";
import Modal from "@/components/Modal";
import BookletsService from "@/services/BookletsService";
import { Toast, Notification } from "@/utils/UI";
import permissions from "@/mixins/permissions";

export default {
	name: "VouchersPage",

	components: {
		VouchersList,
		Modal,
		VoucherForm,
		BatchesList,
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
				id,
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

			if (this.voucherModal.isEditing && id) {
				this.updateVoucher(voucherBody, id);
			} else {
				this.createVoucher(voucherBody);
			}
		},

		async createVoucher(voucherBody) {
			this.voucherModal.isWaiting = true;

			await BookletsService.createBooklet(voucherBody)
				.then((response) => {
					if (response.status === 204) {
						Toast(this.$t("Booklet Successfully Created"), "is-success");
						if (this.$refs.vouchersList) {
							this.$refs.vouchersList.fetchData();
						} else if (this.$refs.batchesList) {
							this.$refs.batchesList.fetchData();
						} else {
							this.$router.go();
						}
						this.closeVoucherModal();
					}
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Booklet")} ${e}`, "is-danger");
				});
			this.voucherModal.isWaiting = false;
		},

		async updateVoucher({ currency, values, quantityOfVouchers, password }, id) {
			this.voucherModal.isWaiting = true;

			await BookletsService.updateBooklet(
				{ currency, values, quantityOfVouchers, password },
				id,
			).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Booklet Successfully Updated"), "is-success");
					if (this.$refs.vouchersList) {
						this.$refs.vouchersList.fetchData();
					} else if (this.$refs.batchesList) {
						this.$refs.batchesList.fetchData();
					} else {
						this.$router.go();
					}
					this.closeVoucherModal();
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Booklet")} ${e}`, "is-danger");
			});
			this.voucherModal.isWaiting = false;
		},

		async onRemoveVoucher(id) {
			await BookletsService.removeBooklet(id).then((response) => {
				if (response.status === 204) {
					Toast(this.$t("Booklet successfully removed"), "is-success");
					this.$refs.vouchersList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`${this.$t("Booklet")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
