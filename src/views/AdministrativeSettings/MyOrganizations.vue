<template>
	<v-container fluid>
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

		<Tabs :pre-selected-tab-value="ADMINISTRATIVE_SETTINGS.TABS_VALUE.MY_ORGANIZATIONS" />

		<MyOrganizationsList
			ref="myOrganizationsList"
			@showEdit="onEditMyOrganization"
			@showDetail="onShowDetail"
			@print="onPrintMyOrganization"
		/>
	</v-container>
</template>

<script>
import MyOrganizationsService from "@/services/MyOrganizationsService";
import MyOrganizationForm from "@/components/AdministrativeSettings/MyOrganizations/Form";
import MyOrganizationsList from "@/components/AdministrativeSettings/MyOrganizations/List";
import Tabs from "@/components/AdministrativeSettings/Tabs";
import Modal from "@/components/Inputs/Modal";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ADMINISTRATIVE_SETTINGS } from "@/consts";

export default {
	name: "MyOrganizationsPage",

	components: {
		MyOrganizationsList,
		MyOrganizationForm,
		Modal,
		Tabs,
	},

	data() {
		return {
			ADMINISTRATIVE_SETTINGS,
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
				uploadedImage: null,
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
			try {
				this.myOrganizationModal.isWaiting = true;

				const {
					data,
					status,
					message,
				} = await MyOrganizationsService.updateMyOrganization({
					body: myOrganizationBody,
					id,
				});

				checkResponseStatus(status, message);

				await this.uploadImage(data.id, image);
				Notification(this.$t("My Organization Successfully Updated"), "success");
				await this.$refs.myOrganizationsList.fetchData();
				this.onCloseMyOrganizationModal();
			} catch (e) {
				Notification(`${this.$t("Organization")}: ${e.message || e}`, "error");
			} finally {
				this.myOrganizationModal.isWaiting = false;
			}
		},

		async uploadImage(id, image) {
			if (!image) return;

			try {
				const {
					status,
					message,
				} = await MyOrganizationsService.uploadImage({
					id,
					image,
				});

				checkResponseStatus(status, message);
			} catch (e) {
				Notification(`${this.$t("Image upload")}: ${e.message || e}`, "error");
			}
		},

		async onPrintMyOrganization() {
			try {
				const {
					status,
					message,
				} = await MyOrganizationsService.printMyOrganization();

				checkResponseStatus(status, message);

				Notification(this.$t("Download Is Starting"), "success");
			} catch (e) {
				Notification(`${this.$t("Organization")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
