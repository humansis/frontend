<template>
	<div>
		<h2 class="title">Vendors</h2>
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
import VendorsList from "@/components/Beneficiaries/VendorsList";
import VendorForm from "@/components/Beneficiaries/VendorForm";
import Modal from "@/components/Modal";
import VendorsService from "@/services/VendorsService";
import { Toast } from "@/utils/UI";

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
				username,
				password,
				name,
				description,
				addressStreet,
				addressNumber,
				addressPostCode,
				locationId,
			};
			// TODO add functionality for salt password
			if (this.vendorModal.isEditing && id) {
				this.updateVendor(id, vendorBody);
			} else {
				this.createVendor(vendorBody);
			}
		},

		async createVendor(vendorBody) {
			await VendorsService.createVendor(vendorBody).then((response) => {
				if (response.status === 200) {
					Toast("Vendor Successfully Created", "is-success");
					this.$refs.vendorsList.fetchData();
					this.closeVendorModal();
				}
			}).catch((e) => {
				Toast(`Vendor ${e}`, "is-danger");
				this.vendorModal.isWaiting = false;
			});
		},

		async updateVendor(id, vendorBody) {
			this.vendorModal.isWaiting = true;

			await VendorsService.updateVendor(id, vendorBody).then((response) => {
				if (response.status === 200) {
					Toast("Vendor Successfully Updated", "is-success");
					this.$refs.vendorsList.fetchData();
					this.closeVendorModal();
				}
			}).catch((e) => {
				Toast(`Vendor ${e}`, "is-danger");
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
