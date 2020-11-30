<template>
	<div>
		<h2 class="title">Communities</h2>
		<Modal
			can-cancel
			:active="communityModal.isOpened"
			:header="modalHeader"
			@close="closeCommunityModal"
		>
			<CommunityForm
				close-button
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
import CommunitiesService from "@/services/CommunitiesService";
import { Toast } from "@/utils/UI";
import CommunityForm from "@/components/Beneficiaries/CommunityForm";
import Modal from "@/components/Modal";
import CommunitiesList from "@/components/Beneficiaries/CommunitiesList";

export default {
	name: "Communities",

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
			};
		},

		addNewCommunity() {
			this.communityModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
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

			this.closeCommunityModal();
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

		async createCommunity(communityBody) {
			await CommunitiesService.createCommunity(communityBody).then((response) => {
				if (response.status === 200) {
					Toast("Community Successfully Created", "is-success");
					this.$refs.communitiesList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Community) ${e}`, "is-danger");
			});
		},

		async updateCommunity(id, communityBody) {
			await CommunitiesService.updateCommunity(id, communityBody).then((response) => {
				if (response.status === 200) {
					Toast("Community Successfully Updated", "is-success");
					this.$refs.communitiesList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Community) ${e}`, "is-danger");
			});
		},

		async removeCommunity(id) {
			await CommunitiesService.deleteCommunity(id).then((response) => {
				if (response.status === 204) {
					Toast("Community Successfully Deleted", "is-success");
					this.$refs.communitiesList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Community) ${e}`, "is-danger");
			});
		},
	},
};
</script>
