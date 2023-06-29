<template>
	<div>
		<div class="add-config-btn">
			<b-button
				type="is-primary"
				icon-left="plus"
				@click="addNewCustomField"
			>
				{{ $t('Add') }}
			</b-button>
		</div>

		<Modal
			can-cancel
			:active="customFieldModal.isOpened"
			:header="modalHeader"
			:is-waiting="customFieldModal.isWaiting"
			@close="closeCustomFieldModal"
		>
			<CustomFieldForm
				close-button
				class="modal-card"
				:formModel="customFieldModel"
				:submit-button-label="submitButtonLabel"
				:form-disabled="customFieldModal.isDetail"
				@formSubmitted="submitCustomFieldForm"
				@formClosed="closeCustomFieldModal"
			/>
		</Modal>

		<CustomFieldsList
			ref="customFieldsList"
			@remove="removeCustomField"
			@showDetail="showDetail"
			@showEdit="editCustomField"
		/>
	</div>
</template>

<script>
import { mapState } from "vuex";
import CustomFieldForm from "@/components/CountrySettings/CountrySpecific/CustomFields/CustomFieldsForm";
import CustomFieldsList from "@/components/CountrySettings/CountrySpecific/CustomFields/CustomFieldsList";
import Modal from "@/components/Modal";
import CustomFieldsService from "@/services/CustomFieldsService";
import { Toast, Notification } from "@/utils/UI";

export default {
	name: "CustomFieldPage",

	components: {
		CustomFieldsList,
		Modal,
		CustomFieldForm,
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
			let result = "";
			if (this.customFieldModal.isDetail) {
				result = this.$t("Detail of Custom Field");
			} else if (this.customFieldModal.isEditing) {
				result = this.$t("Edit Custom Field");
			} else {
				result = this.$t("Create New Custom Field");
			}
			return result;
		},

		submitButtonLabel() {
			return this.customFieldModal.isEditing
				? this.$t("Update")
				: this.$t("Create");
		},
	},

	methods: {
		showDetail(customField) {
			this.mapToFormModel(customField);
			this.customFieldModal = {
				isOpened: true,
				isDetail: true,
				isEditing: false,
				isWaiting: false,
			};
		},

		editCustomField(customField) {
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

		closeCustomFieldModal() {
			this.customFieldModal.isOpened = false;
		},

		addNewCustomField() {
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

		submitCustomFieldForm(customFieldForm) {
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
						Toast(
							this.$t("Custom Field Successfully Created"), "is-success",
						);
						this.$refs.customFieldsList.fetchData();
						this.closeCustomFieldModal();
					} else if (response.message) {
						Notification(response.message, "is-danger");
					}
				}).catch((e) => {
					Toast(`${this.$t("Custom Fields")} ${e}`, "is-danger");
				}).finally(() => {
					this.customFieldModal.isWaiting = false;
				});
		},

		async updateCustomField(id, customFieldBody) {
			this.customFieldModal.isWaiting = true;

			await CustomFieldsService.updateCustomField(id, customFieldBody)
				.then((response) => {
					if (response.status === 200) {
						Toast(
							this.$t("Custom Field Successfully Updated"), "is-success",
						);
						this.$refs.customFieldsList.fetchData();
						this.closeCustomFieldModal();
					} else if (response.message) {
						Notification(response.message, "is-danger");
					}
				}).catch((e) => {
					Toast(`${this.$t("Custom Fields")} ${e}`, "is-danger");
				}).finally(() => {
					this.customFieldModal.isWaiting = false;
				});
		},

		async removeCustomField(id) {
			await CustomFieldsService.deleteCustomField(id)
				.then((response) => {
					if (response.status === 204) {
						Toast(
							this.$t("Custom Field Successfully Removed"), "is-success",
						);
						this.$refs.customFieldsList.removeFromList(id);
					} else if (response.message) {
						Notification(response.message, "is-danger");
					}
				}).catch((e) => {
					Toast(`${this.$t("Custom Fields")} ${e}`, "is-danger");
				});
		},
	},
};
</script>
