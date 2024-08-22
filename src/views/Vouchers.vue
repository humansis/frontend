<template>
	<v-container fluid>
		<div class="d-flex mb-4">
			<h2 class="me-auto" data-cy="page-title-text">{{ $t('Vouchers') }}</h2>

			<v-btn
				:disabled="!isUserPermissionGranted(PERMISSIONS.VOUCHERS)"
				color="primary"
				prepend-icon="plus"
				class="text-none ml-0"
				@click="onAddNewVoucher"
			>
				{{ $t('Add') }}
			</v-btn>
		</div>

		<Modal
			v-model="voucherModal.isOpened"
			:header="modalHeader"
		>
			<VoucherForm
				:form-model="voucherModel"
				:submit-button-label="voucherModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="voucherModal.isDetail"
				:is-editing="voucherModal.isEditing"
				close-button
				@formSubmitted="onSubmitVoucherForm"
				@formClosed="onCloseVoucherModal"
			/>
		</Modal>

		<VouchersList
			ref="vouchersList"
			@delete="onRemoveVoucher"
			@showDetail="onShowDetail"
			@showEdit="onShowEdit"
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
import { checkResponseStatus } from "@/utils/fetcher";
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
		onShowDetail(voucher) {
			this.mapToFormModel(voucher);
			this.voucherModal = {
				isOpened: true,
				isDetail: true,
				isWaiting: false,
				isEditing: false,
			};
		},

		onShowEdit(voucher) {
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

		onCloseVoucherModal() {
			this.voucherModal.isOpened = false;
		},

		onAddNewVoucher() {
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

		onSubmitVoucherForm(voucherForm) {
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
			try {
				this.voucherModal.isWaiting = true;

				const {
					status,
					message,
				} = await BookletsService.createBooklet(voucherBody);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Booklet Successfully Created"), "success");

				if (this.$refs.vouchersList) {
					await this.$refs.vouchersList.fetchData();
				} else if (this.$refs.batchesList) {
					this.$refs.batchesList.fetchData();
				} else {
					this.$router.go();
				}

				this.onCloseVoucherModal();
			} catch (e) {
				Notification(`${this.$t("Booklet")}: ${e.message || e}`, "error");
			} finally {
				this.voucherModal.isWaiting = false;
			}
		},

		async updateVoucher({ currency, values, quantityOfVouchers, password }, id) {
			try {
				this.voucherModal.isWaiting = true;

				const {
					status,
					message,
				} = await BookletsService.updateBooklet({
					body: { currency, values, quantityOfVouchers, password },
					id,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("Booklet Successfully Updated"), "success");

				if (this.$refs.vouchersList) {
					await this.$refs.vouchersList.fetchData();
				} else if (this.$refs.batchesList) {
					this.$refs.batchesList.fetchData();
				} else {
					this.$router.go();
				}

				this.onCloseVoucherModal();
			} catch (e) {
				Notification(`${this.$t("Booklet")}: ${e.message || e}`, "error");
			} finally {
				this.voucherModal.isWaiting = false;
			}
		},

		async onRemoveVoucher(id) {
			try {
				const {
					status,
					message,
				} = await BookletsService.removeBooklet(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Booklet successfully removed"), "success");
				this.$refs.vouchersList.removeFromList(id);
			} catch (e) {
				Notification(`${this.$t("Booklet")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
