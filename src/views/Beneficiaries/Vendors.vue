<template>
	<v-container fluid>
		<div class="d-flex mb-4">
			<h2 class="me-auto" data-cy="page-title-text">{{ $t('Vendors') }}</h2>

			<v-btn
				v-if="userCan.addEditVendors"
				:data-cy="identifierBuilder('new-button')"
				color="primary"
				prepend-icon="plus"
				class="text-none ml-0"
				@click="onAddNewVendor"
			>
				{{ $t('Add') }}
			</v-btn>
		</div>

		<Modal
			v-model="vendorSummary.isOpened"
			custom-header
		>
			<VendorSummary
				:vendor="selectedVendor"
				@loaded="vendorSummary.isWaiting = false"
				@close="onCloseVendorSummary"
				@changedPage="onChangedSummaryPage"
			/>
		</Modal>

		<Modal
			v-model="vendorModal.isOpened"
			:header="modalHeader"
		>
			<VendorForm
				:form-model="vendorModel"
				:submit-button-label="vendorModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="vendorModal.isDetail"
				:form-loading="vendorModal.isWaiting"
				:is-editing="vendorModal.isEditing"
				close-button
				@formSubmitted="onSubmitVendorForm"
				@formClosed="onCloseVendorModal"
			/>
		</Modal>

		<VendorsList
			ref="vendorsList"
			@delete="onVendorRemove"
			@showEdit="onEditVendor"
			@showDetail="onShowDetail"
			@showSummary="onShowVendorSummary"
		/>
	</v-container>
</template>

<script>
import UsersService from "@/services/UsersService";
import VendorService from "@/services/VendorService";
import VendorSummary from "@/components/Beneficiaries/Smartcard/VendorSummary";
import VendorForm from "@/components/Beneficiaries/VendorForm";
import VendorsList from "@/components/Beneficiaries/VendorsList";
import Modal from "@/components/Inputs/Modal";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
import usersHelper from "@/mixins/usersHelper";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "Vendors",

	components: {
		VendorSummary,
		VendorsList,
		Modal,
		VendorForm,
	},

	mixins: [
		permissions,
		identifierBuilder,
		usersHelper,
	],

	data() {
		return {
			vendorModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
				isWaiting: false,
			},
			vendorSummary: {
				isOpened: false,
				isWaiting: false,
				header: this.$t("Vendor Transaction Summary"),
				show: true,
			},
			vendorModel: {
				id: null,
				username: "",
				email: "",
				password: "",
				name: "",
				categoryType: [],
				shop: "",
				addressStreet: "",
				addressNumber: "",
				addressPostcode: "",
				adm1: null,
				adm2: null,
				adm3: null,
				adm4: null,
				vendorNo: "",
				contractNo: "",
				canDoRemoteDistributions: false,
				userId: null,
			},
			selectedVendor: null,
		};
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.vendorModal.isDetail) {
				result = "Detail of Vendor";
			} else if (this.vendorModal.isEditing) {
				result = "Edit Vendor";
			} else {
				result = "Create New Vendor";
			}
			return result;
		},
	},

	methods: {
		onChangedSummaryPage(title) {
			this.vendorSummary.header = title;
		},

		onEditVendor(vendor) {
			this.mapToFormModel(vendor);
			this.vendorModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
		},

		onCloseVendorSummary() {
			this.vendorSummary.isOpened = false;
		},

		onShowVendorSummary(vendor) {
			this.vendorSummary.isWaiting = true;
			this.selectedVendor = vendor;
			this.vendorSummary = {
				isWaiting: false,
				isOpened: true,
			};
		},

		eraseFormModel() {
			this.vendorModel = {
				...this.vendorModel,
				id: null,
				username: "",
				email: "",
				password: "",
				shop: "",
				name: "",
				categoryType: [],
				addressStreet: "",
				addressNumber: "",
				addressPostcode: "",
				adm1: null,
				adm2: null,
				adm3: null,
				adm4: null,
				vendorNo: "",
				contractNo: "",
				canDoRemoteDistributions: false,
				userId: null,
			};
		},

		onAddNewVendor() {
			this.vendorModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};

			this.eraseFormModel();
		},

		onCloseVendorModal() {
			this.vendorModal.isOpened = false;
			this.eraseFormModel();
		},

		onShowDetail(vendor) {
			this.mapToFormModel(vendor);
			this.vendorModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
		},

		async mapToFormModel(
			{
				id,
				shop,
				name,
				addressStreet,
				addressNumber,
				addressPostcode,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
				userId,
				vendorNo,
				contractNo,
				canSellFood,
				canSellNonFood,
				canSellCashback,
				canDoRemoteDistributions,
			},
		) {
			const user = await this.getDetailOfUser(userId);

			const categoryType = [];

			if (canSellFood) {
				categoryType.push("Food");
			}

			if (canSellNonFood) {
				categoryType.push("Non-Food");
			}

			if (canSellCashback) {
				categoryType.push("Cashback");
			}

			this.vendorModel = {
				...this.vendorModel,
				id,
				shop,
				username: user.username,
				name,
				categoryType,
				addressStreet,
				addressNumber,
				addressPostcode,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
				userId,
				user,
				vendorNo,
				contractNo,
				canDoRemoteDistributions,
			};
		},

		async onSubmitVendorForm(vendorForm) {
			this.vendorModal.isWaiting = true;
			const {
				id,
				username,
				shop,
				password,
				name,
				categoryType,
				addressStreet,
				addressNumber,
				addressPostcode,
				locationId,
				user,
				vendorNo,
				contractNo,
				canDoRemoteDistributions,
			} = vendorForm;
			const vendorBody = {
				name,
				addressStreet,
				addressNumber,
				addressPostcode,
				locationId,
				vendorNo,
				contractNo,
				canDoRemoteDistributions,
				shop,
				canSellFood: categoryType.includes("Food"),
				canSellNonFood: categoryType.includes("Non-Food"),
				canSellCashback: categoryType.includes("Cashback"),
				userId: user?.id || null,
			};

			const userBody = {
				...user,
				username,
				email: username,
				password,
				phoneNumber: null,
				// TODO edit after BE will implement permissions
				roles: ["ROLE_VENDOR"],
				changePassword: false,
			};
			if (this.vendorModal.isEditing && id) {
				await this.updateVendor(id, userBody, vendorBody);
			} else {
				await this.createVendor(userBody, vendorBody);
			}
			this.vendorModal.isWaiting = false;
		},

		async createVendor(userBody, vendorBody) {
			try {
				const {
					data,
					status,
					message,
				} = await UsersService.createUser(userBody);

				checkResponseStatus(status, message);

				try {
					const body = vendorBody;
					body.userId = data.id;

					const {
						status: vendorStatus,
						message: vendorMessage,
					} = await VendorService.createVendor(body);

					checkResponseStatus(vendorStatus, vendorMessage);

					Notification(this.$t("Vendor Successfully Created"), "success");
					await this.$refs.vendorsList.fetchData();
					this.onCloseVendorModal();
				} catch (e) {
					Notification(`${this.$t("Vendor")}: ${e.message || e}`, "error");
				}
			} catch (e) {
				Notification(`${this.$t("User")}: ${e.message || e}`, "error");
			}
		},

		async updateVendor(id, userBody, vendorBody) {
			try {
				const {
					status,
					message,
				} = await UsersService.updateUser({
					id: userBody.id,
					body: userBody,
				});

				checkResponseStatus(status, message);

				try {
					const {
						status: vendorStatus,
						message: vendorMessage,
					} = await VendorService.updateVendor({
						body: vendorBody,
						id,
					});

					checkResponseStatus(vendorStatus, vendorMessage);

					Notification(this.$t("Vendor Successfully Updated"), "success");
					await this.$refs.vendorsList.fetchData();
					this.onCloseVendorModal();
				} catch (e) {
					Notification(`${this.$t("Vendor")}: ${e.message || e}`, "error");
				}
			} catch (e) {
				Notification(`${this.$t("User")}: ${e.message || e}`, "error");
			}
		},

		async onVendorRemove(id) {
			try {
				const {
					status,
					message,
				} = await VendorService.deleteVendor(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Vendor Successfully Deleted"), "success");
				this.$refs.vendorsList.removeFromList(id);
			} catch (e) {
				Notification(`${this.$t("Vendor")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
