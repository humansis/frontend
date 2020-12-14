<!-- TODO edit after real api-->
<template>
	<div>
		<Modal
			can-cancel
			:active="organizationServiceModal.isOpened"
			:header="modalHeader"
			@close="closeOrganizationServiceModal"
		>
			<OrganizationServiceForm
				close-button
				class="modal-card"
				submit-button-label="Create"
				:formModel="organizationServiceModel"
				:form-disabled="organizationServiceModal.isDetail"
				@formSubmitted="submitOrganizationServiceForm"
				@formClosed="closeOrganizationServiceModal"
			/>
		</Modal>
		<OrganizationServicesList
			ref="organizationServicesList"
			@onShowEdit="editOrganizationService"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import Modal from "@/components/Modal";
import OrganizationServicesService from "@/services/OrganizationServicesService";
import OrganizationServiceForm from "@/components/AdministrativeSettings/OrganizationServiceForm";
import OrganizationServicesList from "@/components/AdministrativeSettings/OrganizationServicesList";

export default {
	name: "OrganizationServicesPage",

	components: {
		OrganizationServicesList,
		Modal,
		OrganizationServiceForm,
	},

	data() {
		return {
			organizationServiceModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			organizationServiceModel: {
				id: null,
				name: null,
				enabled: false,
				password: null,
				username: null,
				token: null,
				email: null,
				production: false,
				country: null,
			},
		};
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.organizationServiceModal.isDetail) {
				result = "Detail of Organization Service";
			} else if (this.organizationServiceModal.isEditing) {
				result = "Update new OrganizationService";
			}
			return result;
		},
	},

	methods: {
		showDetail(organizationService) {
			this.organizationServiceModel = organizationService;
			this.organizationServiceModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
		},

		closeOrganizationServiceModal() {
			this.organizationServiceModal.isOpened = false;
		},

		editOrganizationService(organizationService) {
			this.organizationServiceModel = organizationService;
			this.organizationServiceModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};
		},

		submitOrganizationServiceForm(organizationServiceForm) {
			const {
				id,
				enabled,
				password,
				username,
				token,
				email,
				production,
			} = organizationServiceForm;

			const organizationServiceBody = {
				enabled,
				password,
				username,
				token,
				email,
				production,
			};

			this.updateOrganizationService(organizationServiceBody, id);

			this.closeOrganizationServiceModal();
		},

		async updateOrganizationService(organizationServiceBody) {
			await OrganizationServicesService.updateOrganizationService(organizationServiceBody)
				.then((response) => {
					if (response.status === 200) {
						Toast("Organization Service Successfully Created", "is-success");
						this.$refs.organizationServicesList.fetchData();
					}
				}).catch((e) => {
					Toast(`(Organization) ${e}`, "is-danger");
				});
		},
	},
};
</script>
