<template>
	<Modal
		v-model="myOrganizationModal.isOpened"
		:header="modalHeader"
	>
		<MyOrganizationForm
			:form-model="myOrganizationModel"
			:submit-button-label="myOrganizationModal.isEditing ? 'Update' : 'Create'"
			:form-disabled="myOrganizationModal.isDetail"
			close-button
			@formSubmitted="onSubmitMyOrganizationForm"
			@formClosed="onCloseMyOrganizationModal"
		/>
	</Modal>

	<MyOrganizationsList
		ref="myOrganizationsList"
		@showEdit="onEditMyOrganization"
		@showDetail="onShowDetail"
		@print="onPrintMyOrganization"
	/>
</template>

<script>
import MyOrganizationsService from "@/services/MyOrganizationsService";
import MyOrganizationForm from "@/components/AdministrativeSettings/MyOrganizations/Form";
import MyOrganizationsList from "@/components/AdministrativeSettings/MyOrganizations/List";
import Modal from "@/components/Inputs/Modal";
import { Notification } from "@/utils/UI";

export default {
	name: "MyOrganizationsPage",

	components: {
		MyOrganizationsList,
		MyOrganizationForm,
		Modal,
	},

	data() {
		return {
			myOrganizationModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
				isWaiting: false,
			},
			myOrganizationModel: {
				id: null,
				name: "",
				logo: "",
				font: "",
				primaryColor: "",
				secondaryColor: "",
				footerContent: "",
				uploadedImage: "",
			},
		};
	},

	computed: {
		modalHeader() {
			if (this.myOrganizationModal.isDetail) {
				return "Detail of My Organization";
			}

			if (this.myOrganizationModal.isEditing) {
				return "Edit My Organization";
			}

			return "";
		},
	},

	methods: {
		onShowDetail(myOrganization) {
			this.mapToFormModel(myOrganization);
			this.myOrganizationModal = {
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
				logo,
				font,
				primaryColor,
				secondaryColor,
				footerContent,
				uploadedImage,
			},
		) {
			this.myOrganizationModel = {
				...this.myOrganizationModel,
				id,
				name,
				logo,
				font,
				primaryColor,
				secondaryColor,
				footerContent,
				uploadedImage,
			};
		},

		onCloseMyOrganizationModal() {
			this.myOrganizationModal.isOpened = false;
		},

		onEditMyOrganization(myOrganization) {
			this.mapToFormModel(myOrganization);
			this.myOrganizationModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
		},

		onSubmitMyOrganizationForm(myOrganizationForm) {
			const {
				id,
				name,
				font,
				primaryColor,
				secondaryColor,
				footerContent,
				logo,
				uploadedImage,
			} = myOrganizationForm;

			const myOrganizationBody = {
				name,
				logo,
				font: font.code,
				primaryColor,
				secondaryColor,
				footerContent,
			};

			this.updateMyOrganization(id, myOrganizationBody, uploadedImage);
		},

		async updateMyOrganization(id, myOrganizationBody, image) {
			this.myOrganizationModal.isWaiting = true;

			await MyOrganizationsService.updateMyOrganization(id, myOrganizationBody)
				.then(async ({ data, status }) => {
					if (status === 200) {
						await this.uploadImage(data.id, image);
						Notification(this.$t("My Organization Successfully Updated"), "success");
						this.$refs.myOrganizationsList.fetchData();
						this.onCloseMyOrganizationModal();
					}
				}).catch((e) => {
					Notification(`${this.$t("Organization")} ${e.message || e}`, "error");
					this.myOrganizationModal.isWaiting = false;
				});
		},

		async uploadImage(id, image) {
			if (image) {
				await MyOrganizationsService.uploadImage(id, image);
			}
		},

		async onPrintMyOrganization() {
			await MyOrganizationsService.printMyOrganization()
				.then((response) => {
					if (response.status === 200) {
						Notification(this.$t("Download Is Starting"), "success");
					}
				}).catch((e) => {
					Notification(`${this.$t("Organization")} ${e.message || e}`, "error");
				});
		},
	},
};
</script>
