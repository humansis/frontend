<template>
	<div>
		<Modal
			can-cancel
			:active="donorModal.isOpened"
			:header="modalHeader"
			:is-waiting="donorModal.isWaiting"
			@close="closeDonorModal"
		>
			<DonorForm
				close-button
				class="modal-card"
				:formModel="donorModel"
				:submit-button-label="donorModal.isEditing ? $t('Update') : $t('Create')"
				:form-disabled="donorModal.isDetail"
				@formSubmitted="submitDonorForm"
				@formClosed="closeDonorModal"
			/>
		</Modal>
		<b-button
			v-if="userCan.addEditDonors"
			class="mb-4"
			type="is-primary"
			icon-left="plus"
			@click="addNewDonor"
		>
			{{ $t('Add') }}
		</b-button>
		<DonorList
			ref="DonorList"
			@onShowDetail="showDetail"
			@onRemove="removeDonor"
			@onShowEdit="editDonor"
		/>
	</div>
</template>

<script>
import DonorList from "@/components/AdministrativeSettings/DonorList";
import DonorForm from "@/components/AdministrativeSettings/DonorForm";
import Modal from "@/components/Modal";
import DonorService from "@/services/DonorService";
import { Toast } from "@/utils/UI";
import permissions from "@/mixins/permissions";

export default {
	name: "DonorPage",

	components: {
		Modal,
		DonorForm,
		DonorList,
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
			let result = "";
			if (this.donorModal.isDetail) {
				result = this.$t("Detail of Donor");
			} else if (this.donorModal.isEditing) {
				result = this.$t("Edit Donor");
			} else {
				result = this.$t("Create New Donor");
			}
			return result;
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
						Toast(this.$t("Donor Successfully Created"), "is-success");
						this.$refs.DonorList.fetchData();
						this.closeDonorModal();
					}
				}).catch((e) => {
					Toast(`${this.$t("Donor")} ${e}`, "is-danger");
					this.donorModal.isWaiting = false;
				});
		},

		async updateDonor(id, donorBody, image) {
			this.donorModal.isWaiting = true;

			await DonorService.updateDonor(id, donorBody)
				.then(async ({ data, status }) => {
					if (status === 200) {
						await this.uploadImage(data.id, image);
						Toast(this.$t("Donor Successfully Updated"), "is-success");
						this.$refs.DonorList.fetchData();
						this.closeDonorModal();
					}
				}).catch((e) => {
					Toast(`${this.$t("Donor")} ${e}`, "is-danger");
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
						Toast(this.$t("Donor successfully removed"), "is-success");
						this.$refs.DonorList.removeFromList(id);
					}
				}).catch((e) => {
					Toast(`${this.$t("Donor")} ${e}`, "is-danger");
				});
		},
	},
};
</script>
