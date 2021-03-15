<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">Vendors</h1>
			</div>

			<div class="level-right">
				<b-button
					type="is-primary"
					icon-left="plus"
					@click="addNewVendor"
				>
					Add
				</b-button>
			</div>
		</div>

		<Modal
			can-cancel
			:active="vendorModal.isOpened"
			:header="modalHeader"
			:is-waiting="vendorModal.isWaiting"
			@close="closeVendorModal"
		>
			<VendorForm
				close-button
				class="modal-card"
				:formModel="vendorModel"
				:submit-button-label="vendorModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="vendorModal.isDetail"
				@formSubmitted="submitVendorForm"
				@formClosed="closeVendorModal"
			/>
		</Modal>

		<VendorsList
			ref="vendorsList"
			@onRemove="onVendorRemove"
			@onShowEdit="editVendor"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import VendorsList from "@/components/Beneficiaries/VendorsList";
import VendorForm from "@/components/Beneficiaries/VendorForm";
import Modal from "@/components/Modal";
import VendorsService from "@/services/VendorsService";
import { Toast } from "@/utils/UI";
import UsersService from "@/services/UsersService";

export default {
	name: "VendorsPage",

	components: {
		VendorsList,
		Modal,
		VendorForm,
	},

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
				userId: null,
			},
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
				result = "Create new Vendor";
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
			};
		},

		submitVendorForm(vendorForm) {
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
				shop,
				userId: user.id,
			};
			const userBody = {
				...user,
				username,
				password,
				email,
				phoneNumber: "",
				// TODO edit after permissions
				roles: ["ROLE_VENDOR"],
				changePassword: false,
			};
			if (this.vendorModal.isEditing && id) {
				this.updateVendor(id, userBody, vendorBody);
			} else {
				this.createVendor(userBody, vendorBody);
			}
		},

		async createVendor(userBody, vendorBody) {
			await UsersService.createUser(userBody)
				.then(async (userResponse) => {
					if (userResponse.status === 200) {
						const body = vendorBody;
						body.userId = userResponse.data.id;
						await VendorsService.createVendor(body)
							.then((vendorResponse) => {
								if (vendorResponse.status === 200) {
									Toast("Vendor Successfully Created", "is-success");
									this.$refs.vendorsList.fetchData();
									this.closeVendorModal();
								}
							}).catch((e) => {
								Toast(`Vendor ${e}`, "is-danger");
								this.vendorModal.isWaiting = false;
							});
					}
				})
				.catch((e) => {
					Toast(`User ${e}`, "is-danger");
					this.vendorModal.isWaiting = false;
				});
		},

		async updateVendor(id, userBody, vendorBody) {
			this.vendorModal.isWaiting = true;

			await UsersService.updateUser(userBody.id, userBody)
				.then(async (userResponse) => {
					if (userResponse.status === 200) {
						await VendorsService.updateVendor(id, vendorBody).then((vendorResponse) => {
							if (vendorResponse.status === 200) {
								Toast("Vendor Successfully Updated", "is-success");
								this.$refs.vendorsList.fetchData();
								this.closeVendorModal();
							}
						}).catch((e) => {
							Toast(`Vendor ${e}`, "is-danger");
							this.vendorModal.isWaiting = false;
						});
					}
				}).catch((e) => {
					Toast(`User ${e}`, "is-danger");
					this.vendorModal.isWaiting = false;
				});
		},

		async onVendorRemove(id) {
			this.vendorModal.isWaiting = true;

			await VendorsService.deleteVendor(id).then((response) => {
				if (response.status === 204) {
					Toast("Vendor Successfully Deleted", "is-success");
					this.$refs.vendorsList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`Vendor ${e}`, "is-danger");
			});
		},
	},
};
</script>
