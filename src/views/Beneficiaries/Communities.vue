<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">{{ $t('Communities') }}</h1>
			</div>

			<div class="level-right">
				<b-button
					v-if="userCan.addBeneficiary"
					type="is-primary"
					icon-left="plus"
					@click="addNewCommunity"
				>
					{{ $t('Add') }}
				</b-button>
			</div>
		</div>

		<Modal
			can-cancel
			:active="communityModal.isOpened"
			:header="modalHeader"
			:is-waiting="communityModal.isWaiting"
			@close="closeCommunityModal"
		>
			<CommunityForm
				close-button
				class="modal-card"
				:formModel="communityModel"
				:submit-button-label="communityModal.isEditing ? $t('Update') : $t('Create')"
				:form-disabled="communityModal.isDetail"
				@formSubmitted="submitCommunityForm"
				@formClosed="closeCommunityModal"
			/>
		</Modal>

		<CommunitiesList
			ref="communitiesList"
			@onRemove="removeCommunity"
			@onShowEdit="editCommunity"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import CommunityForm from "@/components/Beneficiaries/CommunityForm";
import CommunitiesList from "@/components/Beneficiaries/CommunitiesList";
import Modal from "@/components/Modal";
import CommunityService from "@/services/CommunityService";
import BeneficiariesService from "@/services/BeneficiariesService";
import AddressService from "@/services/AddressService";
import { Toast } from "@/utils/UI";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import permissions from "@/mixins/permissions";

export default {
	name: "CommunityPage",

	components: {
		CommunitiesList,
		Modal,
		CommunityForm,
	},

	mixins: [permissions],

	data() {
		return {
			communityModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
				isWaiting: false,
			},
			communityModel: {
				id: null,
				longitude: "",
				latitude: "",
				projectIds: [],
				projects: [],
				name: "",
				contactGivenName: "",
				contactFamilyName: "",
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
				locationId: "",
			},
		};
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.communityModal.isDetail) {
				result = this.$t("Detail of Community");
			} else if (this.communityModal.isEditing) {
				result = this.$t("Edit Community");
			} else {
				result = this.$t("Create New Community");
			}
			return result;
		},
	},

	methods: {
		editCommunity(community) {
			this.communityModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
			this.mapToFormModel(community);
		},

		eraseFormModel() {
			this.communityModel = {
				...this.communityModel,
				id: null,
				longitude: "",
				projects: [],
				projectIds: [],
				latitude: "",
				name: "",
				contactGivenName: "",
				contactFamilyName: "",
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
				locationId: "",
			};
		},

		addNewCommunity() {
			this.communityModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};

			this.eraseFormModel();
		},

		closeCommunityModal() {
			this.communityModal.isOpened = false;
			this.eraseFormModel();
		},

		showDetail(community) {
			this.communityModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
				isWaiting: false,
			};
			this.mapToFormModel(community);
		},

		async mapToFormModel(
			{
				id,
				name,
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
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
			this.communityModel = {
				...this.communityModel,
				id,
				longitude,
				latitude,
				name,
				contactGivenName,
				contactFamilyName,
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
				locationId: address?.locationId || "",
			};
		},

		submitCommunityForm(communityForm) {
			const {
				id,
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
				addressStreet,
				addressNumber,
				addressPostCode,
				nationalCardNumber,
				nationalCardType,
				phonePrefix,
				phoneNumber,
				phoneType,
				phoneProxy,
				locationId,
				projects,
			} = communityForm;
			const communityBody = {
				longitude: longitude || null,
				latitude: latitude || null,
				contactGivenName: contactGivenName || null,
				contactFamilyName: contactFamilyName || null,
				address: {
					street: addressStreet || null,
					number: addressNumber || null,
					postCode: addressPostCode || null,
					locationId,
				},
				projectIds: getArrayOfIdsByParam(projects, "id"),
			};
			if (nationalCardNumber || nationalCardType) {
				communityBody.nationalIdCard = {
					number: nationalCardNumber || null,
					type: nationalCardType.code || null,
				};
			}
			if (phonePrefix || phoneNumber || phoneType) {
				communityBody.phone = {
					prefix: phonePrefix.code || null,
					number: phoneNumber || null,
					proxy: !!phoneProxy,
					type: phoneType.code || null,
				};
			}

			if (this.communityModal.isEditing && id) {
				this.updateCommunity(id, communityBody);
			} else {
				this.createCommunity(communityBody);
			}
		},

		async createCommunity(communityBody) {
			this.communityModal.isWaiting = true;

			await CommunityService.createCommunity(communityBody).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Community Successfully Created"), "is-success");
					this.$refs.communitiesList.fetchData();
					this.closeCommunityModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("Community")} ${e}`, "is-danger");
				this.communityModal.isWaiting = false;
			});
		},

		async updateCommunity(id, communityBody) {
			this.communityModal.isWaiting = true;

			await CommunityService.updateCommunity(id, communityBody).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Community Successfully Updated"), "is-success");
					this.$refs.communitiesList.fetchData();
					this.closeCommunityModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("Community")} ${e}`, "is-danger");
				this.communityModal.isWaiting = false;
			});
		},

		async removeCommunity(id) {
			await CommunityService.deleteCommunity(id).then((response) => {
				if (response.status === 204) {
					Toast(this.$t("Community Successfully Deleted"), "is-success");
					this.$refs.communitiesList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`${this.$t("Community")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
