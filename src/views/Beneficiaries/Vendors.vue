<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">{{ $t('Vendors') }}</h1>
			</div>

			<div class="level-right">
				<b-button
					v-if="userCan.addEditVendors"
					type="is-primary"
					icon-left="plus"
					@click="addNewVendor"
				>
					{{ $t('Add') }}
				</b-button>
			</div>
		</div>

		<Modal
			custom-header
			:active="vendorSummary.isOpened"
			:is-waiting="vendorSummary.isWaiting"
			@close="closeVendorSummary"
		>
			<VendorSummary
				:vendor="selectedVendor"
				@loaded="vendorSummary.isWaiting = false"
				@close="closeVendorSummary"
				@changedPage="changedSummaryPage"
			/>
		</Modal>

		<Modal
			can-cancel
			:active="vendorModal.isOpened"
			:header="modalHeader"
			@close="closeVendorModal"
		>
			<VendorForm
				close-button
				class="modal-card"
				:formModel="vendorModel"
				:submit-button-label="vendorModal.isEditing ? $t('Update') : $t('Create')"
				:form-disabled="vendorModal.isDetail"
				:form-loading="vendorModal.isWaiting"
				:is-editing="vendorModal.isEditing"
				@formSubmitted="submitVendorForm"
				@formClosed="closeVendorModal"
			/>
		</Modal>

		<VendorsList
			ref="vendorsList"
			@onRemove="onVendorRemove"
			@onShowEdit="editVendor"
			@onShowDetail="showDetail"
			@onShowSummary="showVendorSummary"
		/>
	</div>
</template>

<script>
import VendorsList from "@/components/Beneficiaries/VendorsList";
import VendorForm from "@/components/Beneficiaries/VendorForm";
import Modal from "@/components/Modal";
import { Toast } from "@/utils/UI";
import UsersService from "@/services/UsersService";
import VendorService from "@/services/VendorService";
import permissions from "@/mixins/permissions";
import VendorSummary from "@/components/Beneficiaries/Smartcard/VendorSummary";

export default {
	name: "Vendors",

	components: {
		VendorSummary,
		VendorsList,
		Modal,
		VendorForm,
	},

	mixins: [permissions],

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
				adm1: {},
				adm2: {},
				adm3: {},
				adm4: {},
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
				result = this.$t("Detail of Vendor");
			} else if (this.vendorModal.isEditing) {
				result = this.$t("Edit Vendor");
			} else {
				result = this.$t("Create New Vendor");
			}
			return result;
		},
	},

	methods: {
		changedSummaryPage(title) {
			this.vendorSummary.header = title;
		},

		editVendor(vendor) {
			this.mapToFormModel(vendor);
			this.vendorModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
		},

		closeVendorSummary() {
			this.vendorSummary.isOpened = false;
			this.selectedVendor = null;
		},

		showVendorSummary(vendor) {
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
				adm1: {},
				adm2: {},
				adm3: {},
				adm4: {},
				vendorNo: "",
				contractNo: "",
				canDoRemoteDistributions: false,
				userId: null,
			};
		},

		addNewVendor() {
			this.vendorModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};

			this.eraseFormModel();
		},

		closeVendorModal() {
			this.vendorModal.isOpened = false;
			this.eraseFormModel();
		},

		showDetail(vendor) {
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
			const { data } = await UsersService.getDetailOfUser(userId);

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
				username: data.username,
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
				user: data,
				vendorNo,
				contractNo,
				canDoRemoteDistributions,
			};
		},

		async submitVendorForm(vendorForm) {
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
			await UsersService.createUser(userBody)
				.then(async (userResponse) => {
					if (userResponse.status === 200) {
						const body = vendorBody;
						body.userId = userResponse.data.id;
						await VendorService.createVendor(body)
							.then((vendorResponse) => {
								if (vendorResponse.status === 200) {
									Toast(this.$t("Vendor Successfully Created"), "is-success");
									this.$refs.vendorsList.fetchData();
									this.closeVendorModal();
								}
							}).catch((e) => {
								Toast(`${this.$t("Vendor")} ${e}`, "is-danger");
							});
					}
				})
				.catch((e) => {
					Toast(`${this.$t("User")} ${e}`, "is-danger");
				});
		},

		async updateVendor(id, userBody, vendorBody) {
			await UsersService.updateUser(userBody.id, userBody)
				.then(async (userResponse) => {
					if (userResponse.status === 200) {
						await VendorService.updateVendor(id, vendorBody).then((vendorResponse) => {
							if (vendorResponse.status === 200) {
								Toast(this.$t("Vendor Successfully Updated"), "is-success");
								this.$refs.vendorsList.fetchData();
								this.closeVendorModal();
							}
						}).catch((e) => {
							Toast(`${this.$t("Vendor")} ${e}`, "is-danger");
						});
					}
				}).catch((e) => {
					Toast(`${this.$t("User")} ${e}`, "is-danger");
				});
		},

		async onVendorRemove(id) {
			await VendorService.deleteVendor(id).then((response) => {
				if (response.status === 204) {
					Toast(this.$t("Vendor Successfully Deleted"), "is-success");
					this.$refs.vendorsList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`${this.$t("Vendor")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
