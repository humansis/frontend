<template>
	<div>
		<Modal
			can-cancel
			:active="myOrganizationModal.isOpened"
			:header="modalHeader"
			:is-waiting="myOrganizationModal.isWaiting"
			@close="closeMyOrganizationModal"
		>
			<MyOrganizationForm
				close-button
				class="modal-card"
				:formModel="myOrganizationModel"
				:submit-button-label="myOrganizationModal.isEditing ?  $t('Update') :  $t('Create')"
				:form-disabled="myOrganizationModal.isDetail"
				@formSubmitted="submitMyOrganizationForm"
				@formClosed="closeMyOrganizationModal"
			/>
		</Modal>
		<MyOrganizationsList
			ref="myOrganizationsList"
			@onShowEdit="editMyOrganization"
			@onShowDetail="showDetail"
			@onPrint="printMyOrganization"
		/>
	</div>
</template>

<script>
import MyOrganizationsList from "@/components/AdministrativeSettings/MyOrganizationsList";
import MyOrganizationForm from "@/components/AdministrativeSettings/MyOrganizationForm";
import Modal from "@/components/Modal";
import MyOrganizationsService from "@/services/MyOrganizationsService";
import { Toast } from "@/utils/UI";

export default {
	name: "MyOrganizationsPage",

	components: {
		MyOrganizationsList,
		Modal,
		MyOrganizationForm,
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
			let result = "";
			if (this.myOrganizationModal.isDetail) {
				result = this.$t("Detail of MyOrganization");
			} else if (this.myOrganizationModal.isEditing) {
				result = this.$t("Edit MyOrganization");
			}
			return result;
		},
	},

	methods: {
		showDetail(myOrganization) {
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

		closeMyOrganizationModal() {
			this.myOrganizationModal.isOpened = false;
		},

		editMyOrganization(myOrganization) {
			this.mapToFormModel(myOrganization);
			this.myOrganizationModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
		},

		submitMyOrganizationForm(myOrganizationForm) {
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
						Toast(this.$t("My Organization Successfully Updated"), "is-success");
						this.$refs.myOrganizationsList.fetchData();
						this.closeMyOrganizationModal();
					}
				}).catch((e) => {
					Toast(`${this.$t("Organization")} ${e}`, "is-danger");
					this.myOrganizationModal.isWaiting = false;
				});
		},

		async uploadImage(id, image) {
			if (image) {
				await MyOrganizationsService.uploadImage(id, image);
			}
		},

		async printMyOrganization(id) {
			await MyOrganizationsService.printMyOrganization(id)
				.then((response) => {
					if (response.status === 200) {
						Toast(this.$t("Download is starting"), "is-success");
					}
				}).catch((e) => {
					Toast(`${this.$t("Organization")} ${e}`, "is-danger");
				});
		},
	},

};
</script>
