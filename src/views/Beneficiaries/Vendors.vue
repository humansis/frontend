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
				@formSubmitted="submitVendorForm"
				@formClosed="closeVendorModal"
			/>
		</Modal>

		<VendorList
			ref="vendorList"
			@onRemove="onVendorRemove"
			@onShowEdit="editVendor"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import VendorList from "@/components/Beneficiaries/VendorList";
import VendorForm from "@/components/Beneficiaries/VendorForm";
import Modal from "@/components/Modal";
import { Toast } from "@/utils/UI";
import UsersService from "@/services/UsersService";
import VendorService from "@/services/VendorService";
import permissions from "@/mixins/permissions";

export default {
	name: "VendorPage",

	components: {
		VendorList,
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
			vendorModel: {
				creating: false,
				id: null,
				username: "",
				email: "",
				password: "",
				name: "",
				shop: "",
				addressStreet: "",
				addressNumber: "",
				addressPostcode: "",
				adm1Id: "",
				adm2Id: "",
				adm3Id: "",
				adm4Id: "",
				vendorNo: "",
				contractNo: "",
				userId: null,
			},
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
		editVendor(vendor) {
			this.mapToFormModel(vendor);
			this.vendorModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
		},

		addNewVendor() {
			this.vendorModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};

			this.vendorModel = {
				...this.vendorModel,
				creating: true,
				id: null,
				username: "",
				email: "",
				password: "",
				shop: "",
				name: "",
				addressStreet: "",
				addressNumber: "",
				addressPostcode: "",
				adm1Id: "",
				adm2Id: "",
				adm3Id: "",
				adm4Id: "",
				vendorNo: "",
				contractNo: "",
				userId: null,
			};
		},

		closeVendorModal() {
			this.vendorModal.isOpened = false;
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
			},
		) {
			const { data } = await UsersService.getDetailOfUser(userId);
			this.vendorModel = {
				...this.vendorModel,
				creating: !this.vendorModal.isEditing && !this.vendorModal.isDetail,
				id,
				shop,
				username: data.username,
				email: data.email,
				name,
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
			};
		},

		async submitVendorForm(vendorForm) {
			this.vendorModal.isWaiting = true;
			const {
				id,
				username,
				shop,
				email,
				password,
				name,
				addressStreet,
				addressNumber,
				addressPostcode,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
				user,
				vendorNo,
				contractNo,
			} = vendorForm;
			let locationId = null;
			if (adm4Id) {
				locationId = adm4Id.locationId;
			} else if (adm3Id) {
				locationId = adm3Id.locationId;
			} else if (adm2Id) {
				locationId = adm2Id.locationId;
			} else if (adm1Id) {
				locationId = adm1Id.locationId;
			}
			const vendorBody = {
				name,
				addressStreet,
				addressNumber,
				addressPostcode,
				locationId,
				vendorNo,
				contractNo,
				shop,
				userId: user?.id || null,
			};
			const userBody = {
				...user,
				username,
				password,
				email,
				phoneNumber: "",
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
									this.$refs.vendorList.fetchData();
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
								this.$refs.vendorList.fetchData();
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
					this.$refs.vendorList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`${this.$t("Vendor")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
