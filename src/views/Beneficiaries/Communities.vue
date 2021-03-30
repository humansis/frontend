<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">{{ $t('Communities') }}</h1>
			</div>

			<div class="level-right">
				<b-button
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

		<CommunityList
			ref="communityList"
			@onRemove="removeCommunity"
			@onShowEdit="editCommunity"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import CommunityForm from "@/components/Beneficiaries/CommunityForm";
import CommunityList from "@/components/Beneficiaries/CommunityList";
import Modal from "@/components/Modal";
import CommunityService from "@/services/CommunityService";
import BeneficiariesService from "@/services/BeneficiariesService";
import AddressService from "@/services/AddressService";
import { Toast } from "@/utils/UI";
import { getArrayOfIdsByParam } from "@/utils/codeList";

export default {
	name: "CommunityPage",

	components: {
		CommunityList,
		Modal,
		CommunityForm,
	},

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
			this.mapToFormModel(community);
			this.communityModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
		},

		addNewCommunity() {
			this.communityModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};

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

		closeCommunityModal() {
			this.communityModal.isOpened = false;
		},

		showDetail(community) {
			this.mapToFormModel(community);
			this.communityModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
				isWaiting: false,
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
				phoneId,
				addressId,
				nationalId,
				projectIds,
			},
		) {
			const phone = await BeneficiariesService.getPhone(phoneId);
			const address = await AddressService.getAddress(addressId);
			const nationalIdCard = await BeneficiariesService.getNationalId(nationalId);

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
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
				projects,
			} = communityForm;
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
			const communityBody = {
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
				address: {
					street: addressStreet,
					number: addressNumber,
					postCode: addressPostCode,
					locationId,
				},
				nationalIdCard: {
					number: nationalCardNumber,
					type: nationalCardType.code,
				},
				phone: {
					prefix: phonePrefix.code,
					number: phoneNumber,
					proxy: phoneProxy,
					type: phoneType.code,
				},
				projectIds: getArrayOfIdsByParam(projects, "id"),
			};

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
					this.$refs.communityList.fetchData();
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
					this.$refs.communityList.fetchData();
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
					this.$refs.communityList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`${this.$t("Community")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
