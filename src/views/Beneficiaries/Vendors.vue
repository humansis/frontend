<template>
	<div>
		<h2 class="title">Vendors</h2>
		<Modal
			can-cancel
			:active="vendorModal.isOpened"
			:header="modalHeader"
			@close="closeVendorModal"
		>
			<VendorForm
				close-button
				:formModel="vendorModel"
				:submit-button-label="vendorModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="vendorModal.isDetail"
				@formSubmitted="submitVendorForm"
				@formClosed="closeVendorModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewVendor"
		>
			Add
		</b-button>
		<VendorsList
			ref="vendorsList"
			@onRemove="onVendorRemove"
			@onShowEdit="editVendor"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import VendorForm from "@/components/Beneficiaries/VendorForm";
import VendorsService from "@/services/VendorsService";
import Modal from "@/components/Modal";
import VendorsList from "@/components/Beneficiaries/VendorsList";

export default {
	name: "Vendors",

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
			},
			vendorModel: {
				creating: false,
				id: null,
				username: "",
				password: "",
				name: "",
				description: "",
				addressStreet: "",
				addressNumber: "",
				addressPostCode: "",
				adm1Id: "",
				adm2Id: "",
				adm3Id: "",
				adm4Id: "",
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
			};
		},

		addNewVendor() {
			this.vendorModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
			};

			this.vendorModel = {
				...this.vendorModel,
				creating: true,
				id: null,
				name: "",
				contactGivenName: "",
				contactFamilyName: "",
				type: "",
				addressStreet: "",
				addressNumber: "",
				addressPostCode: "",
				nationalCardNumber: "",
				nationalCardType: "",
				phonePrefix: "",
				phoneNumber: "",
				adm1Id: "",
				adm2Id: "",
				adm3Id: "",
				adm4Id: "",
			};
		},

		submitVendorForm(vendorForm) {
			const {
				id,
				username,
				password,
				name,
				description,
				addressStreet,
				addressNumber,
				addressPostCode,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			} = vendorForm;

			const vendorBody = {
				username,
				password,
				name,
				description,
				addressStreet,
				addressNumber,
				addressPostCode,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			};
			if (this.vendorModal.isEditing && id) {
				this.updateVendor(id, vendorBody);
			} else {
				this.createVendor(vendorBody);
			}

			this.closeVendorModal();
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

		mapToFormModel(
			{
				id,
				username,
				password,
				name,
				description,
				addressStreet,
				addressNumber,
				addressPostCode,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			},
		) {
			this.vendorModel = {
				...this.vendorModel,
				creating: !this.vendorModal.isEditing && !this.vendorModal.isDetail,
				id,
				username,
				password,
				name,
				description,
				addressStreet,
				addressNumber,
				addressPostCode,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			};
		},

		async createVendor(vendorBody) {
			await VendorsService.createVendor(vendorBody).then((response) => {
				if (response.status === 200) {
					Toast("Vendor Successfully Created", "is-success");
					this.$refs.vendorsList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Vendor) ${e}`, "is-danger");
			});
		},

		async updateVendor(id, vendorBody) {
			await VendorsService.updateVendor(id, vendorBody).then((response) => {
				if (response.status === 200) {
					Toast("Vendor Successfully Updated", "is-success");
					this.$refs.vendorsList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Vendor) ${e}`, "is-danger");
			});
		},

		async onVendorRemove(id) {
			await VendorsService.deleteVendor(id).then((response) => {
				if (response.status === 204) {
					Toast("Vendor Successfully Deleted", "is-success");
					this.$refs.vendorsList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Vendor) ${e}`, "is-danger");
			});
		},
	},
};
</script>
