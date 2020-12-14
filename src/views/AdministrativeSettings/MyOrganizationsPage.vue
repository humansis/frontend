<template>
	<div>
		<Modal
			can-cancel
			:active="myOrganizationModal.isOpened"
			:header="modalHeader"
			@close="closeMyOrganizationModal"
		>
			<MyOrganizationForm
				close-button
				class="modal-card"
				:formModel="myOrganizationModel"
				:submit-button-label="myOrganizationModal.isEditing ? 'Update' : 'Create'"
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
import MyOrganizationsService from "@/services/MyOrganizationsService";
import { Toast } from "@/utils/UI";
import MyOrganizationForm from "@/components/AdministrativeSettings/MyOrganizationForm";
import Modal from "@/components/Modal";
import MyOrganizationsList from "@/components/AdministrativeSettings/MyOrganizationsList";

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
				result = "Detail of MyOrganization";
			} else if (this.myOrganizationModal.isEditing) {
				result = "Edit MyOrganization";
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
				uploadedImage,
			} = myOrganizationForm;

			const myOrganizationBody = {
				id,
				name,
				logo: uploadedImage,
				font,
				primaryColor,
				secondaryColor,
				footerContent,
			};

			this.updateMyOrganization(id, myOrganizationBody);

			this.closeMyOrganizationModal();
		},

		async updateMyOrganization(id, myOrganizationBody) {
			await MyOrganizationsService.updateMyOrganization(id, myOrganizationBody).then((response) => {
				if (response.status === 200) {
					Toast("My Organization Successfully Updated", "is-success");
					this.$refs.myOrganizationsList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Organization) ${e}`, "is-danger");
			});
		},

		async printMyOrganization(id) {
			await MyOrganizationsService.printMyOrganization(id).then((response) => {
				if (response.status === 200) {
					Toast("Your Download is starting", "is-success");
				}
			}).catch((e) => {
				Toast(`(Organization) ${e}`, "is-danger");
			});
		},
	},

};
</script>
