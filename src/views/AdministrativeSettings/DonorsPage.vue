<template>
	<div>
		<Modal
			:active="donorModal.isOpened"
			:can-cancel="true"
			:header="modalHeader"
			:is-waiting="donorModal.isWaiting"
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
import DonorsList from "@/components/AdministrativeSettings/DonorsList";
import DonorForm from "@/components/AdministrativeSettings/DonorForm";
import Modal from "@/components/Modal";
import HomeService from "@/services/HomeService";
import { Toast } from "@/utils/UI";

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
			} = donorForm;

			const donorBody = {
				fullname,
				shortname,
				logo,
				notes,
			};

			if (this.donorModal.isEditing && id) {
				this.updateDonor(id, donorBody);
			} else {
				this.createDonor(donorBody);
			}
		},

		async createDonor(donorBody) {
			this.donorModal.isWaiting = true;

			await HomeService.createDonor(donorBody).then((response) => {
				if (response.status === 200) {
					Toast("Donor Successfully Created", "is-success");
					this.$refs.donorsList.fetchData();
					this.closeDonorModal();
				}
			}).catch((e) => {
				Toast(`Donor ${e}`, "is-danger");
				this.donorModal.isWaiting = false;
			});
		},

		async updateDonor(id, donorBody) {
			this.donorModal.isWaiting = true;

			await HomeService.updateDonor(id, donorBody).then((response) => {
				if (response.status === 200) {
					Toast("Donor Successfully Updated", "is-success");
					this.$refs.donorsList.fetchData();
					this.closeDonorModal();
				}
			}).catch((e) => {
				Toast(`Donor ${e}`, "is-danger");
				this.donorModal.isWaiting = false;
			});
		},

		async removeDonor(id) {
			await HomeService.deleteDonor(id)
				.then((response) => {
					if (response.status === 204) {
						Toast("Donor successfully removed", "is-success");
						this.$refs.donorsList.removeFromList(id);
					}
				}).catch((e) => {
					Toast(`Donor ${e}`, "is-danger");
				});
		},
	},
};
</script>
