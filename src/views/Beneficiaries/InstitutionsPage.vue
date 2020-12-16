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
import InstitutionsService from "@/services/InstitutionsService";
import { Toast } from "@/utils/UI";
import InstitutionsForm from "@/components/Beneficiaries/InstitutionsForm";
import Modal from "@/components/Modal";
import InstitutionsList from "@/components/Beneficiaries/InstitutionsList";

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

		mapToFormModel(
			{
				id,
				name,
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
				type,
				phone: {
					prefix: phonePrefix,
					number: phoneNumber,
				},
				address: {
					street: addressStreet,
					number: addressNumber,
					postcode: addressPostCode,
					adm1Id,
					adm2Id,
					adm3Id,
					adm4Id,
				},
				nationalIdCard: {
					number: nationalCardNumber,
					type: nationalCardType,
				},
			},
		) {
			this.institutionModel = {
				...this.institutionModel,
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
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
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
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			} = institutionForm;

			const institutionBody = {
				name,
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
				type,
				address: {
					street: addressStreet,
					number: addressNumber,
					postCode: addressPostCode,
					adm1Id,
					adm2Id,
					adm3Id,
					adm4Id,
				},
				nationalCard: {
					idNumber: nationalCardNumber,
					idType: nationalCardType,
				},
				phone: {
					prefix: phonePrefix,
					number: phoneNumber,
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
				Toast(`(Institution) ${e}`, "is-danger");
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
				Toast(`(Institution) ${e}`, "is-danger");
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
				Toast(`(Institution) ${e}`, "is-danger");
			});
		},
	},
};
</script>
