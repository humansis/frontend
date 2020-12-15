<template>
	<div>
		<Modal
			:active="donorModal.isOpened"
			:can-cancel="true"
			:header="modalHeader"
			@close="closeDonorModal"
		>
			<DonorForm
				close-button
				class="modal-card"
				:formModel="donorModel"
				:submit-button-label="donorModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="donorModal.isDetail"
				@formSubmitted="submitDonorForm"
				@formClosed="closeDonorModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewDonor"
		>
			Add
		</b-button>
		<DonorsList
			ref="donorsList"
			@onShowDetail="showDetail"
			@onRemove="removeDonor"
			@onShowEdit="editDonor"
		/>
	</div>
</template>

<script>
import DonorsService from "@/services/DonorsService";
import DonorForm from "@/components/AdministrativeSettings/DonorForm";
import Modal from "@/components/Modal";
import DonorsList from "@/components/AdministrativeSettings/DonorsList";
import { Toast, Notification } from "@/utils/UI";

export default {
	name: "DonorsPage",

	components: {
		Modal,
		DonorForm,
		DonorsList,
	},

	data() {
		return {
			donorModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			donorModel: {
				id: null,
				fullName: "",
				shortName: "",
				logo: null,
				notes: "",
			},
		};
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.donorModal.isDetail) {
				result = "Detail of Donor";
			} else if (this.donorModal.isEditing) {
				result = "Edit Donor";
			} else {
				result = "Create new Donor";
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
			};
		},

		mapToFormModel(
			{
				id,
				fullName,
				shortName,
				logo,
				notes,
			},
		) {
			this.donorModel = {
				...this.donorModel,
				id,
				fullName,
				shortName,
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
			};
		},

		addNewDonor() {
			this.donorModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
			};

			this.donorModel = {
				...this.donorModel,
				id: null,
				fullName: "",
				shortName: "",
				logo: null,
				notes: "",
			};
		},

		submitDonorForm(donorForm) {
			const {
				id,
				fullName,
				shortName,
				logo,
				notes,
			} = donorForm;

			const donorBody = {
				fullName,
				shortName,
				logo,
				notes,
			};

			if (this.donorModal.isEditing && id) {
				this.updateDonor(id, donorBody);
			} else {
				this.createDonor(donorBody);
			}

			this.closeDonorModal();
		},

		async createDonor(donorBody) {
			await DonorsService.createDonor(donorBody).then((response) => {
				if (response.status === 200) {
					Toast("Donor Successfully Created", "is-success");
					this.$refs.donorsList.fetchData();
				}
			}).catch((e) => {
				Notification(`Donor ${e}`, "is-danger");
			});
		},

		async updateDonor(id, donorBody) {
			await DonorsService.updateDonor(id, donorBody).then((response) => {
				if (response.status === 200) {
					Toast("Donor Successfully Updated", "is-success");
					this.$refs.donorsList.fetchData();
				}
			}).catch((e) => {
				Notification(`Donor ${e}`, "is-danger");
			});
		},

		async removeDonor(id) {
			await DonorsService.deleteDonor(id)
				.then((response) => {
					if (response.status === 204) {
						Toast("Donor successfully removed", "is-success");
						this.$refs.donorsList.fetchData();
					}
				}).catch((e) => {
					Notification(`Donor ${e}`, "is-danger");
				});
		},
	},
};
</script>
