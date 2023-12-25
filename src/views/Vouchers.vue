<template>
	<v-container fluid>
		<div class="d-flex mb-4">
			<h2 class="me-auto">{{ $t('Vouchers') }}</h2>

			<v-btn
				v-if="userCan.addVouchers"
				color="primary"
				size="small"
				prepend-icon="plus"
				class="text-none ml-0"
				@click="addNewVoucher"
			>
				{{ $t('Add') }}
			</v-btn>
		</div>

		<Modal
			v-model="voucherModal.isOpened"
			:header="modalHeader"
		>
			<VoucherForm
				:submit-button-label="voucherModal.isEditing ? 'Update' : 'Create'"
				:formModel="voucherModel"
				:form-disabled="voucherModal.isDetail"
				:is-editing="voucherModal.isEditing"
				close-button
				@formSubmitted="submitVoucherForm"
				@formClosed="closeVoucherModal"
			/>
		</Modal>

		<VouchersList
			ref="vouchersList"
			@onDelete="removeVoucher"
			@showDetail="showDetail"
			@showEdit="showEdit"
		/>
	</v-container>
</template>

<script>
import { mapState } from "vuex";
import BookletsService from "@/services/BookletsService";
import Modal from "@/components/Inputs/Modal";
import VoucherForm from "@/components/Vouchers/VoucherForm";
import VouchersList from "@/components/Vouchers/VouchersList";
import permissions from "@/mixins/permissions";
import { Notification } from "@/utils/UI";

export default {
	name: "VouchersPage",

	components: {
		VouchersList,
		Modal,
		VoucherForm,
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
				result = "Detail of This Voucher Booklets";
			} else if (this.voucherModal.isEditing) {
				result = "Edit This Voucher Booklets";
			} else {
				result = "Create New Voucher Booklets";
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
						Notification(this.$t("Booklet Successfully Created"), "success");

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
					Notification(`${this.$t("Booklet")} ${e.message || e}`, "error");
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
					Notification(this.$t("Booklet Successfully Updated"), "success");

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
				Notification(`${this.$t("Booklet")} ${e.message || e}`, "error");
			});
			this.voucherModal.isWaiting = false;
		},

		async removeVoucher(id) {
			await BookletsService.removeBooklet(id).then((response) => {
				if (response.status === 204) {
					Notification(this.$t("Booklet successfully removed"), "success");
					this.$refs.vouchersList.removeFromList(id);
				}
			}).catch((e) => {
				Notification(`${this.$t("Booklet")} ${e.message || e}`, "error");
			});
		},
	},
};
</script>
