<template>
	<div>
		<h2 class="title">Communities</h2>
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
				:submit-button-label="communityModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="communityModal.isDetail"
				@formSubmitted="submitCommunityForm"
				@formClosed="closeCommunityModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewCommunity"
		>
			Add
		</b-button>
		<CommunitiesList
			ref="communitiesList"
			@onRemove="removeCommunity"
			@onShowEdit="editCommunity"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import CommunitiesList from "@/components/Beneficiaries/CommunitiesList";
import CommunityForm from "@/components/Beneficiaries/CommunityForm";
import Modal from "@/components/Modal";
import CommunitiesService from "@/services/CommunitiesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import AddressService from "@/services/AddressService";
import { Toast } from "@/utils/UI";

export default {
	name: "CommunitiesPage",

	components: {
		CommunitiesList,
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
				result = "Detail of Community";
			} else if (this.communityModal.isEditing) {
				result = "Edit Community";
			} else {
				result = "Create new Community";
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
				locationId: address.locationId,
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
			};

			if (this.communityModal.isEditing && id) {
				this.updateCommunity(id, communityBody);
			} else {
				this.createCommunity(communityBody);
			}
		},

		async createCommunity(communityBody) {
			this.communityModal.isWaiting = true;

			await CommunitiesService.createCommunity(communityBody).then((response) => {
				if (response.status === 200) {
					Toast("Community Successfully Created", "is-success");
					this.$refs.communitiesList.fetchData();
					this.closeCommunityModal();
				}
			}).catch((e) => {
				Toast(`Community ${e}`, "is-danger");
				this.communityModal.isWaiting = false;
			});
		},

		async updateCommunity(id, communityBody) {
			this.communityModal.isWaiting = true;

			await CommunitiesService.updateCommunity(id, communityBody).then((response) => {
				if (response.status === 200) {
					Toast("Community Successfully Updated", "is-success");
					this.$refs.communitiesList.fetchData();
					this.closeCommunityModal();
				}
			}).catch((e) => {
				Toast(`Community ${e}`, "is-danger");
				this.communityModal.isWaiting = false;
			});
		},

		async removeCommunity(id) {
			await CommunitiesService.deleteCommunity(id).then((response) => {
				if (response.status === 204) {
					Toast("Community Successfully Deleted", "is-success");
					this.$refs.communitiesList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`Community ${e}`, "is-danger");
			});
		},
	},
};
</script>
