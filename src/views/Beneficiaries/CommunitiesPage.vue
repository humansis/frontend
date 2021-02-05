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
				adm1Id: "",
				adm2Id: "",
				adm3Id: "",
				adm4Id: "",
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

		mapToFormModel(
			{
				id,
				name,
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
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
			this.communityModel = {
				...this.communityModel,
				id,
				longitude,
				latitude,
				name,
				contactGivenName,
				contactFamilyName,
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
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			} = communityForm;

			const communityBody = {
				longitude,
				latitude,
				contactGivenName,
				contactFamilyName,
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
