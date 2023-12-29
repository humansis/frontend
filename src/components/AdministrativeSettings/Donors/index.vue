<template>
	<Modal
		v-model="donorModal.isOpened"
		:header="modalHeader"
	>
		<DonorForm
			:form-model="donorModel"
			:submit-button-label="donorModal.isEditing ? 'Update' : 'Create'"
			:form-disabled="donorModal.isDetail"
			close-button
			@formSubmitted="submitDonorForm"
			@formClosed="closeDonorModal"
		/>
	</Modal>

	<div class="d-flex justify-end">
		<v-btn
			v-if="userCan.addEditDonors"
			class="text-none ml-0 mb-3"
			color="primary"
			size="small"
			prepend-icon="plus"
			@click="addNewDonor"
		>
			{{ $t('Add') }}
		</v-btn>
	</div>

	<DonorsList
		ref="donorsList"
		@delete="removeDonor"
		@showEdit="editDonor"
		@showDetail="showDetail"
	/>
</template>

<script>
import DonorService from "@/services/DonorService";
import DonorForm from "@/components/AdministrativeSettings/Donors/Form";
import DonorsList from "@/components/AdministrativeSettings/Donors/List";
import Modal from "@/components/Inputs/Modal";
import permissions from "@/mixins/permissions";
import { Notification } from "@/utils/UI";

export default {
	name: "DonorPage",

	components: {
		Modal,
		DonorForm,
		DonorsList,
	},

	mixins: [permissions],

	data() {
		return {
			donorModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
				isWaiting: false,
			},
			donorModel: {
				id: null,
				fullname: "",
				shortname: "",
				logo: null,
				notes: "",
			},
		};
	},

	computed: {
		modalHeader() {
			if (this.donorModal.isDetail) {
				return "Detail of Donor";
			}

			if (this.donorModal.isEditing) {
				return "Edit Donor";
			}

			return "Create New Donor";
		},
	},

	methods: {
		showDetail(donor) {
			this.mapToFormModel(donor);
			this.donorModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
				isWaiting: false,
			};
		},

		mapToFormModel(
			{
				id,
				fullname,
				shortname,
				logo,
				notes,
			},
		) {
			this.donorModel = {
				...this.donorModel,
				id,
				fullname,
				shortname,
				logo,
				notes,
			};
		},

		closeDonorModal() {
			this.donorModal.isOpened = false;
		},

		editDonor(donor) {
			this.mapToFormModel(donor);
			this.donorModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
		},

		addNewDonor() {
			this.donorModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};

			this.donorModel = {
				...this.donorModel,
				id: null,
				fullname: "",
				shortname: "",
				logo: null,
				notes: "",
			};
		},

		submitDonorForm(donorForm) {
			const {
				id,
				fullname,
				shortname,
				logo,
				notes,
				uploadedImage,
			} = donorForm;

			const donorBody = {
				fullname,
				shortname,
				logo,
				notes,
			};

			if (this.donorModal.isEditing && id) {
				this.updateDonor(id, donorBody, uploadedImage);
			} else {
				this.createDonor(donorBody, uploadedImage);
			}
		},

		async createDonor(donorBody, image) {
			this.donorModal.isWaiting = true;

			await DonorService.createDonor(donorBody)
				.then(async ({ data, status }) => {
					if (status === 200) {
						await this.uploadImage(data.id, image);
						Notification(this.$t("Donor Successfully Created"), "success");
						this.$refs.donorsList.fetchData();
						this.closeDonorModal();
					}
				}).catch((e) => {
					Notification(`${this.$t("Donor")} ${e.message || e}`, "error");
					this.donorModal.isWaiting = false;
				});
		},

		async updateDonor(id, donorBody, image) {
			this.donorModal.isWaiting = true;

			await DonorService.updateDonor(id, donorBody)
				.then(async ({ data, status }) => {
					if (status === 200) {
						await this.uploadImage(data.id, image);
						Notification(this.$t("Donor Successfully Updated"), "success");
						this.$refs.donorsList.fetchData();
						this.closeDonorModal();
					}
				}).catch((e) => {
					Notification(`${this.$t("Donor")} ${e.message || e}`, "error");
					this.donorModal.isWaiting = false;
				});
		},

		async uploadImage(id, image) {
			if (image) {
				await DonorService.uploadImage(id, image);
			}
		},

		async removeDonor(id) {
			await DonorService.deleteDonor(id)
				.then((response) => {
					if (response.status === 204) {
						Notification(this.$t("Donor successfully removed"), "success");
						this.$refs.donorsList.removeFromList(id);
					}
				}).catch((e) => {
					Notification(`${this.$t("Donor")} ${e.message || e}`, "error");
				});
		},
	},
};
</script>
