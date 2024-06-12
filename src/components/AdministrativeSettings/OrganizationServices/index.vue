<template>
	<Modal
		v-model="organizationServiceModal.isOpened"
		:header="modalHeader"
	>
		<OrganizationServiceForm
			:form-model="organizationServiceModel"
			:form-disabled="organizationServiceModal.isDetail"
			submit-button-label="Update"
			close-button
			@formSubmitted="onSubmitOrganizationServiceForm"
			@formClosed="onCloseOrganizationServiceModal"
		/>
	</Modal>

	<OrganizationServicesList
		ref="organizationServicesList"
		@showEdit="onEditOrganizationService"
		@showDetail="onShowDetail"
	/>
</template>

<script>
import OrganizationServiceService from "@/services/OrganizationServiceService";
import OrganizationServiceForm from "@/components/AdministrativeSettings/OrganizationServices/Form";
import OrganizationServicesList from "@/components/AdministrativeSettings/OrganizationServices/List";
import Modal from "@/components/Inputs/Modal";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "OrganizationServicePage",

	components: {
		OrganizationServicesList,
		OrganizationServiceForm,
		Modal,
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
			if (this.organizationServiceModal.isDetail) {
				return "Detail of Organization Service";
			}

			if (this.organizationServiceModal.isEditing) {
				return "Update Organization Service";
			}
			return "";
		},
	},

	methods: {
		onShowDetail(organizationService) {
			this.organizationServiceModel = organizationService;
			this.organizationServiceModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
				isWaiting: false,
			};
		},

		onCloseOrganizationServiceModal() {
			this.organizationServiceModal.isOpened = false;
		},

		onEditOrganizationService(organizationService) {
			this.organizationServiceModel = organizationService;
			this.organizationServiceModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
		},

		onSubmitOrganizationServiceForm(organizationServiceForm) {
			const {
				id,
				enabled,
				parameters,
			} = organizationServiceForm;

			const organizationServiceBody = {
				enabled,
				parameters,
			};

			this.updateOrganizationService(id, organizationServiceBody);
		},

		async updateOrganizationService(id, organizationServiceBody) {
			try {
				this.organizationServiceModal.isWaiting = true;

				const {
					status,
					message,
				} = await OrganizationServiceService.updateOrganizationService({
					body: organizationServiceBody,
					id,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("Organization Service Successfully Updated"), "success");
				await this.$refs.organizationServicesList.fetchData();
				this.onCloseOrganizationServiceModal();
			} catch (e) {
				Notification(`${this.$t("Organization Service")}: ${e.message || e}`, "error");
			} finally {
				this.organizationServiceModal.isWaiting = false;
			}
		},
	},
};
</script>
