<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">{{ $t('Institutions') }}</h1>
			</div>

			<div class="level-right">
				<b-button
					v-if="userCan.addBeneficiary"
					type="is-primary"
					icon-left="plus"
					@click="addNewInstitution"
				>
					{{ $t('Add') }}
				</b-button>
			</div>
		</div>

		<Modal
			can-cancel
			:active="institutionModal.isOpened"
			:header="modalHeader"
			:is-waiting="institutionModal.isWaiting"
			@close="closeInstitutionModal"
		>
			<InstitutionForm
				close-button
				class="modal-card"
				:formModel="institutionModel"
				:submit-button-label="institutionModal.isEditing ? $t('Update') : $t('Create')"
				:form-disabled="institutionModal.isDetail"
				@formSubmitted="submitInstitutionForm"
				@formClosed="closeInstitutionModal"
			/>
		</Modal>

		<InstitutionList
			ref="institutionList"
			@onRemove="removeInstitution"
			@onShowEdit="editInstitution"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import InstitutionForm from "@/components/Beneficiaries/InstitutionForm";
import InstitutionList from "@/components/Beneficiaries/InstitutionList";
import AddressService from "@/services/AddressService";
import BeneficiariesService from "@/services/BeneficiariesService";
import Modal from "@/components/Modal";
import InstitutionService from "@/services/InstitutionService";
import { Toast } from "@/utils/UI";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import permissions from "@/mixins/permissions";

export default {
	name: "InstitutionPage",

	components: {
		InstitutionList,
		Modal,
		InstitutionForm,
	},

	mixins: [permissions],

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
				projects: [],
				projectIds: [],
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
				result = this.$t("Detail of Institution");
			} else if (this.institutionModal.isEditing) {
				result = this.$t("Edit Institution");
			} else {
				result = this.$t("Create New Institution");
			}
			return result;
		},
	},

	methods: {
		async editInstitution(institution) {
			await this.mapToFormModel(institution);
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
				projects: [],
				projectIds: [],
				adm1Id: "",
				adm2Id: "",
				adm3Id: "",
				adm4Id: "",
			};
		},

		closeInstitutionModal() {
			this.institutionModel = null;
			this.institutionModal.isOpened = false;
		},

		async showDetail(institution) {
			await this.mapToFormModel(institution);
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
				projectIds,
			},
		) {
			let phone = null;
			let address = null;
			let nationalIdCard = null;

			await Promise.all([
				BeneficiariesService.getPhone(phoneId)
					.then((response) => {
						phone = response;
					}),
				AddressService.getAddress(addressId)
					.then((response) => {
						address = response;
					}),
				BeneficiariesService.getNationalId(nationalId)
					.then((response) => {
						nationalIdCard = response;
					}),
			]);

			this.institutionModel = {
				...this.institutionModel,
				id,
				longitude,
				latitude,
				name,
				contactGivenName,
				contactFamilyName,
				type,
				projectIds,
				addressStreet: address?.street || "",
				addressNumber: address?.number || "",
				addressPostCode: address?.postcode || "",
				nationalCardNumber: nationalIdCard?.number || "",
				nationalCardType: nationalIdCard?.type || "",
				phonePrefix: phone?.prefix || "",
				phoneNumber: phone?.number || "",
				phoneType: phone?.type || "",
				phoneProxy: phone?.proxy || "",
				adm1Id: address?.adm1Id || "",
				adm2Id: address?.adm2Id || "",
				adm3Id: address?.adm3Id || "",
				adm4Id: address?.adm4Id || "",
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
				projects,
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
				name: name || null,
				longitude: longitude || null,
				latitude: latitude || null,
				contactGivenName: contactGivenName || null,
				contactFamilyName: contactFamilyName || null,
				type: type?.code,
				address: {
					street: addressStreet || null,
					number: addressNumber || null,
					postCode: addressPostCode || null,
					locationId,
				},
				nationalIdCard: null,
				phone: null,
				projectIds: getArrayOfIdsByParam(projects, "id"),
			};
			if (nationalCardNumber || nationalCardType) {
				institutionBody.nationalIdCard = {
					number: nationalCardNumber,
					type: nationalCardType?.code,
				};
			}
			if (phonePrefix || phoneNumber || phoneType) {
				institutionBody.nationalIdCard = {
					prefix: phonePrefix?.code,
					number: phoneNumber,
					type: phoneType?.code,
					proxy: phoneProxy,
				};
			}
			if (this.institutionModal.isEditing && id) {
				this.updateInstitution(id, institutionBody);
			} else {
				this.createInstitution(institutionBody);
			}
		},

		async createInstitution(institutionBody) {
			this.institutionModal.isWaiting = true;

			await InstitutionService.createInstitution(institutionBody).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Institution Successfully Created"), "is-success");
					this.$refs.institutionList.fetchData();
					this.closeInstitutionModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("Institution")} ${e}`, "is-danger");
				this.institutionModal.isWaiting = false;
			});
		},

		async updateInstitution(id, institutionBody) {
			this.institutionModal.isWaiting = true;

			await InstitutionService.updateInstitution(id, institutionBody).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Institution Successfully Updated", "is-success"));
					this.$refs.institutionList.fetchData();
					this.closeInstitutionModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("Institution")} ${e}`, "is-danger");
				this.institutionModal.isWaiting = false;
			});
		},

		async removeInstitution(id) {
			await InstitutionService.deleteInstitution(id).then((response) => {
				if (response.status === 204) {
					Toast(this.$t("Institution Successfully Deleted"), "is-success");
					this.$refs.institutionList.removeFromList(id);
					this.$refs.institutionList.table.total -= 1;
				}
			}).catch((e) => {
				Toast(`${this.$t("Institution")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
