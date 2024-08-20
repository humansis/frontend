<template>
	<v-container fluid>
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

		<Tabs :pre-selected-tab-value="ADMINISTRATIVE_SETTINGS.TABS_VALUE.DONORS" />

		<div class="d-flex justify-end">
			<v-btn
				:data-cy="identifierBuilder('new-button')"
				class="text-none ml-0 mb-3"
				color="primary"
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
	</v-container>
</template>

<script>
import DonorService from "@/services/DonorService";
import DonorForm from "@/components/AdministrativeSettings/Donors/Form";
import DonorsList from "@/components/AdministrativeSettings/Donors/List";
import Tabs from "@/components/AdministrativeSettings/Tabs";
import Modal from "@/components/Inputs/Modal";
import permissions from "@/mixins/permissions";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import identifierBuilder from "@/mixins/identifierBuilder";
import { ADMINISTRATIVE_SETTINGS } from "@/consts";

export default {
	name: "DonorPage",

	components: {
		Modal,
		DonorForm,
		DonorsList,
		Tabs,
	},

	mixins: [permissions, identifierBuilder],

	data() {
		return {
			ADMINISTRATIVE_SETTINGS,
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
			dataCy: "donors",
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
			try {
				this.donorModal.isWaiting = true;

				const {
					data,
					status,
					message,
				} = await DonorService.createDonor(donorBody);

				checkResponseStatus(status, message);

				await this.uploadImage(data.id, image);
				Notification(this.$t("Donor Successfully Created"), "success");
				await this.$refs.donorsList.fetchData();
				this.closeDonorModal();
			} catch (e) {
				Notification(`${this.$t("Donor")}: ${e.message || e}`, "error");
			} finally {
				this.donorModal.isWaiting = false;
			}
		},

		async updateDonor(id, donorBody, image) {
			try {
				this.donorModal.isWaiting = true;

				const {
					data,
					status,
					message,
				} = await DonorService.updateDonor(id, donorBody);

				checkResponseStatus(status, message);

				await this.uploadImage(data.id, image);
				Notification(this.$t("Donor Successfully Updated"), "success");
				await this.$refs.donorsList.fetchData();
				this.closeDonorModal();
			} catch (e) {
				Notification(`${this.$t("Donor")}: ${e.message || e}`, "error");
			} finally {
				this.donorModal.isWaiting = false;
			}
		},

		async uploadImage(id, image) {
			if (!image) return;

			try {
				const {
					status,
					message,
				} = await DonorService.uploadImage({
					id,
					image,
				});

				checkResponseStatus(status, message);
			} catch (e) {
				Notification(`${this.$t("Image upload")}: ${e.message || e}`, "error");
			}
		},

		async removeDonor(id) {
			try {
				const {
					status,
					message,
				} = await DonorService.deleteDonor(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Donor successfully removed"), "success");
				this.$refs.donorsList.removeFromList(id);
			} catch (e) {
				Notification(`${this.$t("Donor")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
