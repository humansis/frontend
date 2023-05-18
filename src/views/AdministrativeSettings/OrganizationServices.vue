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
				:submit-button-label="$t('Update')"
				:formModel="organizationServiceModel"
				:form-disabled="organizationServiceModal.isDetail"
				@formSubmitted="submitOrganizationServiceForm"
				@formClosed="closeOrganizationServiceModal"
			/>
		</Modal>
		<OrganizationServicesList
			ref="organizationServicesList"
			@showEdit="editOrganizationService"
			@showDetail="showDetail"
		/>
	</div>
</template>

<script>
import OrganizationServicesList from "@/components/AdministrativeSettings/OrganizationServicesList";
import OrganizationServiceForm from "@/components/AdministrativeSettings/OrganizationServiceForm";
import OrganizationServiceService from "@/services/OrganizationServiceService";
import Modal from "@/components/Modal";
import { Toast } from "@/utils/UI";

export default {
	name: "OrganizationServicePage",

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
				result = this.$t("Detail of Organization Service");
			} else if (this.organizationServiceModal.isEditing) {
				result = this.$t("Update Organization Service");
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
				parameters,
			} = organizationServiceForm;

			const organizationServiceBody = {
				enabled,
				parameters,
			};

			this.updateOrganizationService(id, organizationServiceBody);
		},

		async updateOrganizationService(id, organizationServiceBody) {
			this.organizationServiceModal.isWaiting = true;

			await OrganizationServiceService.updateOrganizationService(id, organizationServiceBody)
				.then((response) => {
					if (response.status === 200) {
						Toast(this.$t("Organization Service Successfully Updated"), "is-success");
						this.$refs.organizationServicesList.fetchData();
						this.closeOrganizationServiceModal();
					}
				}).catch((e) => {
					Toast(`${this.$t("Organization Service")} ${e}`, "is-danger");
					this.organizationServiceModal.isWaiting = false;
				});
		},
	},
};
</script>
