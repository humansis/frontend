<template>
	<Modal
		v-model="customFieldModal.isOpened"
		:header="modalHeader"
	>
		<CustomFieldsForm
			:form-model="customFieldModel"
			:submit-button-label="submitButtonLabel"
			:form-disabled="customFieldModal.isDetail"
			close-button
			@formSubmitted="onSubmitCustomFieldForm"
			@formClosed="onCloseCustomFieldModal"
		/>
	</Modal>

	<div class="d-flex justify-end">
		<v-btn
			class="text-none ml-0 mb-3"
			color="primary"
			prepend-icon="plus"
			@click="onAddNewCustomField"
		>
			{{ $t('New') }}
		</v-btn>
	</div>

	<CustomFieldsList
		ref="customFieldsList"
		@delete="onRemoveCustomField"
		@showDetail="onShowDetail"
		@showEdit="onEditCustomField"
	/>
</template>

<script>
import { mapState } from "vuex";
import CustomFieldsService from "@/services/CustomFieldsService";
import CustomFieldsForm from "@/components/CountrySettings/CountrySpecific/CustomFields/CustomFieldsForm";
import CustomFieldsList from "@/components/CountrySettings/CountrySpecific/CustomFields/CustomFieldsList";
import Modal from "@/components/Inputs/Modal";
import { Notification } from "@/utils/UI";

export default {
	name: "CustomFieldPage",

	components: {
		CustomFieldsList,
		Modal,
		CustomFieldsForm,
	},

	data() {
		return {
			customFieldModal: {
				isOpened: false,
				isDetail: false,
				isEditing: false,
				isWaiting: false,
			},
			customFieldModel: {
				id: null,
				iso3: "",
				field: "",
				type: "",
				target: "",
			},
		};
	},

	computed: {
		...mapState(["country"]),

		modalHeader() {
			if (this.customFieldModal.isDetail) {
				return "Detail of Custom Field";
			}

			if (this.customFieldModal.isEditing) {
				return "Edit Custom Field";
			}

			return "Create New Custom Field";
		},

		submitButtonLabel() {
			return this.customFieldModal.isEditing
				? "Update"
				: "Create";
		},
	},

	methods: {
		onShowDetail(customField) {
			this.mapToFormModel(customField);
			this.customFieldModal = {
				isOpened: true,
				isDetail: true,
				isEditing: false,
				isWaiting: false,
			};
		},

		onEditCustomField(customField) {
			this.mapToFormModel(customField);
			this.customFieldModal = {
				isOpened: true,
				isDetail: false,
				isEditing: true,
				isWaiting: false,
			};
		},

		mapToFormModel(
			{
				id,
				iso3,
				field,
				type,
				target,
			},
		) {
			this.customFieldModel = {
				...this.customFieldModel,
				id,
				iso3,
				field,
				type,
				target,
			};
		},

		onCloseCustomFieldModal() {
			this.customFieldModal.isOpened = false;
		},

		onAddNewCustomField() {
			this.customFieldModal = {
				isOpened: true,
				isDetail: false,
				isEditing: false,
				isWaiting: false,
			};

			this.customFieldModel = {
				...this.customFieldModel,
				id: null,
				iso3: "",
				field: "",
				type: "",
			};
		},

		onSubmitCustomFieldForm(customFieldForm) {
			const {
				id,
				field,
				type,
				target,
				iso3,
			} = customFieldForm;

			const customFieldBody = {
				field,
				type: type.code,
				target: target?.code,
				iso3: iso3 || this.country.iso3,
			};

			if (this.customFieldModal.isEditing && id) {
				this.updateCustomField(id, customFieldBody);
			} else {
				this.createCustomField(customFieldBody);
			}
		},

		async createCustomField(customFieldBody) {
			this.customFieldModal.isWaiting = true;

			await CustomFieldsService.createCustomField(customFieldBody)
				.then((response) => {
					if (response.status === 200) {
						Notification(this.$t("Custom Field Successfully Created"), "success");
						this.$refs.customFieldsList.fetchData();
						this.onCloseCustomFieldModal();
					} else if (response.message) {
						Notification(response.message, "error");
					}
				}).catch((e) => {
					Notification(`${this.$t("Custom Fields")} ${e.message || e}`, "error");
				}).finally(() => {
					this.customFieldModal.isWaiting = false;
				});
		},

		async updateCustomField(id, customFieldBody) {
			this.customFieldModal.isWaiting = true;

			await CustomFieldsService.updateCustomField(id, customFieldBody)
				.then((response) => {
					if (response.status === 200) {
						Notification(this.$t("Custom Field Successfully Updated"), "success");
						this.$refs.customFieldsList.fetchData();
						this.onCloseCustomFieldModal();
					} else if (response.message) {
						Notification(response.message, "error");
					}
				}).catch((e) => {
					Notification(`${this.$t("Custom Fields")} ${e.message || e}`, "error");
				}).finally(() => {
					this.customFieldModal.isWaiting = false;
				});
		},

		async onRemoveCustomField(id) {
			await CustomFieldsService.deleteCustomField(id)
				.then((response) => {
					if (response.status === 204) {
						Notification(this.$t("Custom Field Successfully Removed"), "success");
						this.$refs.customFieldsList.removeFromList(id);
					} else if (response.message) {
						Notification(response.message, "error");
					}
				}).catch((e) => {
					Notification(`${this.$t("Custom Fields")} ${e.message || e}`, "error");
				});
		},
	},
};
</script>
