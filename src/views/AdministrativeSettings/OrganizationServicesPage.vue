<template>
	<div>
		<Modal
			can-cancel
			:active="organizationServiceModal.isOpened"
			:header="modalHeader"
			:is-waiting="organizationServiceModal.isWaiting"
			@close="closeOrganizationServiceModal"
		>
			<OrganizationServiceForm
				close-button
				class="modal-card"
				submit-button-label="Update"
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
import OrganizationServicesList from "@/components/AdministrativeSettings/OrganizationServicesList";
import OrganizationServiceForm from "@/components/AdministrativeSettings/OrganizationServiceForm";
import OrganizationServicesService from "@/services/OrganizationServicesService";
import Modal from "@/components/Modal";
import { Toast } from "@/utils/UI";

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
				isWaiting: false,
			},
			organizationServiceModel: {
				id: null,
				enabled: false,
				iso3: null,
				name: "",
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
				isWaiting: false,
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
				isWaiting: false,
			};
		},

		submitOrganizationServiceForm(organizationServiceForm) {
			const {
				id,
				enabled,
			} = organizationServiceForm;

			const organizationServiceBody = {
				enabled,
			};

			this.updateOrganizationService(id, organizationServiceBody);
		},

		async updateOrganizationService(id, organizationServiceBody) {
			this.organizationServiceModal.isWaiting = true;

			await OrganizationServicesService.updateOrganizationService(id, organizationServiceBody)
				.then((response) => {
					if (response.status === 200) {
						Toast("Organization Service Successfully Created", "is-success");
						this.$refs.organizationServicesList.fetchData();
						this.closeOrganizationServiceModal();
					}
				}).catch((e) => {
					Toast(`Organization ${e}`, "is-danger");
					this.organizationServiceModal.isWaiting = false;
				});
		},
	},
};
</script>
