<template>
	<div>
		<h2 class="title">Institutions</h2>
		<Modal
			can-cancel
			:active="institutionModal.isOpened"
			:header="modalHeader"
			:is-waiting="institutionModal.isWaiting"
			@close="closeInstitutionModal"
		>
			<InstitutionsForm
				close-button
				class="modal-card"
				:formModel="institutionModel"
				:submit-button-label="institutionModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="institutionModal.isDetail"
				@formSubmitted="submitInstitutionForm"
				@formClosed="closeInstitutionModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewInstitution"
		>
			Add
		</b-button>
		<InstitutionsList
			ref="institutionList"
			@onRemove="removeInstitution"
			@onShowEdit="editInstitution"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import InstitutionsForm from "@/components/Beneficiaries/InstitutionsForm";
import InstitutionsList from "@/components/Beneficiaries/InstitutionsList";
import AddressService from "@/services/AddressService";
import BeneficiariesService from "@/services/BeneficiariesService";
import Modal from "@/components/Modal";
import InstitutionsService from "@/services/InstitutionsService";
import { Toast, Notification } from "@/utils/UI";

export default {
	name: "InstitutionsPage",

	components: {
		InstitutionsList,
		Modal,
		InstitutionsForm,
	},

	data() {
		return {
			institutionModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
				isWaiting: false,
			},
			institutionModel: {
				id: null,
				longitude: "",
				latitude: "",
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
				phoneType: "",
				phoneProxy: false,
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
			if (this.institutionModal.isDetail) {
				result = "Detail of Institution";
			} else if (this.institutionModal.isEditing) {
				result = "Edit Institution";
			} else {
				result = "Create new Institution";
			}
			return result;
		},
	},

	methods: {
		editInstitution(institution) {
			this.mapToFormModel(institution);
			this.institutionModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
		},

		addNewInstitution() {
			this.institutionModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};

			this.institutionModel = {
				...this.institutionModel,
				id: null,
				longitude: "",
				latitude: "",
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
				phoneType: "",
				phoneProxy: false,
				adm1Id: "",
				adm2Id: "",
				adm3Id: "",
				adm4Id: "",
			};
		},

		closeInstitutionModal() {
			this.institutionModal.isOpened = false;
		},

		showDetail(institution) {
			this.mapToFormModel(institution);
			this.institutionModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
		},

		async mapToFormModel(
			{
				id,
				name,
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
				type,
				phoneId,
				addressId,
				nationalId,
			},
		) {
			const phone = await BeneficiariesService.getPhone(phoneId);
			const address = await AddressService.getAddress(addressId);
			const nationalIdCard = await BeneficiariesService.getNationalId(nationalId);

			this.institutionModel = {
				...this.institutionModel,
				id,
				longitude,
				latitude,
				name,
				contactGivenName,
				contactFamilyName,
				type,
				addressStreet: address.street,
				addressNumber: address.number,
				addressPostCode: address.postcode,
				nationalCardNumber: nationalIdCard.number,
				nationalCardType: nationalIdCard.type,
				phonePrefix: phone.prefix,
				phoneNumber: phone.number,
				phoneType: phone.type,
				phoneProxy: phone.proxy,
				adm1Id: address.adm1Id,
				adm2Id: address.adm2Id,
				adm3Id: address.adm3Id,
				adm4Id: address.adm4Id,
			};
		},

		submitInstitutionForm(institutionForm) {
			const {
				id,
				longitude,
				latitude,
				name,
				contactGivenName,
				contactFamilyName,
				type,
				addressStreet,
				addressNumber,
				addressPostCode,
				nationalCardNumber,
				nationalCardType,
				phonePrefix,
				phoneNumber,
				phoneType,
				phoneProxy,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			} = institutionForm;
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
			const institutionBody = {
				name,
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
				type: type?.code,
				address: {
					street: addressStreet,
					number: addressNumber,
					postCode: addressPostCode,
					locationId,
				},
				nationalCard: {
					idNumber: nationalCardNumber,
					idType: nationalCardType?.code,
				},
				phone: {
					prefix: phonePrefix?.code,
					number: phoneNumber,
					type: phoneType?.code,
					proxy: phoneProxy,
				},
			};
			if (this.institutionModal.isEditing && id) {
				this.updateInstitution(id, institutionBody);
			} else {
				this.createInstitution(institutionBody);
			}
		},

		async createInstitution(institutionBody) {
			this.institutionModal.isWaiting = true;

			await InstitutionsService.createInstitution(institutionBody).then((response) => {
				if (response.status === 200) {
					Toast("Institution Successfully Created", "is-success");
					this.$refs.institutionList.fetchData();
					this.closeInstitutionModal();
				}
			}).catch((e) => {
				Notification(`Institution ${e}`, "is-danger");
				this.institutionModal.isWaiting = false;
			});
		},

		async updateInstitution(id, institutionBody) {
			this.institutionModal.isWaiting = true;

			await InstitutionsService.updateInstitution(id, institutionBody).then((response) => {
				if (response.status === 200) {
					Toast("Institution Successfully Updated", "is-success");
					this.$refs.institutionList.fetchData();
					this.closeInstitutionModal();
				}
			}).catch((e) => {
				Notification(`Institution ${e}`, "is-danger");
				this.institutionModal.isWaiting = false;
			});
		},

		async removeInstitution(id) {
			await InstitutionsService.deleteInstitution(id).then((response) => {
				if (response.status === 204) {
					Toast("Institution Successfully Deleted", "is-success");
					this.$refs.institutionList.removeFromList(id);
				}
			}).catch((e) => {
				Notification(`(Institution) ${e}`, "is-danger");
			});
		},
	},
};
</script>
