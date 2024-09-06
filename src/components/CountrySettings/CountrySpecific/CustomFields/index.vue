<template>
	<Modal
		v-model="customFieldModal.isOpened"
		:header="modalHeader"
	>
		<CustomFieldsForm
			:form-model="customFieldModel"
			:submit-button-label="submitButtonLabel"
			:is-editing="customFieldModal.isEditing"
			:is-detail="customFieldModal.isDetail"
			:loading="customFieldModal.isWaiting"
			close-button
			@formSubmitted="onSubmitCustomFieldForm"
			@formClosed="onCloseCustomFieldModal"
		/>
	</Modal>

	<div class="d-flex justify-end">
		<v-btn
			:disabled="!isUserPermissionGranted(PERMISSIONS.COUNTRY_SETTINGS_CUSTOM_FIELD_CREATE)"
			:data-cy="identifierBuilder('custom-fields-new-button')"
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
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { COUNTRY_SETTINGS } from "@/consts";

export default {
	name: "CustomFieldPage",

	components: {
		CustomFieldsList,
		Modal,
		CustomFieldsForm,
	},

	mixins: [permissions, identifierBuilder],

	data() {
		return {
			customFieldModal: {
				isOpened: false,
				isDetail: false,
				isEditing: false,
				isWaiting: false,
			},
			customFieldModel: COUNTRY_SETTINGS.CUSTOM_FIELDS.CUSTOM_FIELD_MODEL,
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
				key,
				iso3,
				field,
				type,
				label,
				note,
				isUsed,
				targetType,
				selectionType,
				isMultiSelect,
				allowedValues,
				isPropagatedToSelectionCriteria,
			},
		) {
			this.customFieldModel = {
				...this.customFieldModel,
				id,
				key,
				iso3,
				field,
				type,
				label,
				note,
				isUsed,
				targetType,
				selectionType,
				isMultiSelect,
				allowedValues,
				isPropagatedToSelectionCriteria,
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
				...COUNTRY_SETTINGS.CUSTOM_FIELDS.CUSTOM_FIELD_MODEL,
				listOfValues: [{ value: "" }],
			};
		},

		onSubmitCustomFieldForm(customFieldForm) {
			const {
				id,
				label,
				note,
				type,
				iso3,
				targetType,
				isPropagatedToSelectionCriteria,
				listOfValues,
				selectionType,
			} = customFieldForm;

			const dataForListType = {
				...(type.code === COUNTRY_SETTINGS.CUSTOM_FIELDS.LIST_TYPE_CODE && {
					isPropagatedToSelectionCriteria,
					allowedValues: listOfValues.map((item) => item.value),
					isMultiSelect: selectionType?.code === COUNTRY_SETTINGS.CUSTOM_FIELDS.MULTI_SELECT_CODE,
				}),
			};

			const customFieldBody = {
				label,
				note,
				type: type.code,
				iso3: iso3 || this.country.iso3,
				targetType: targetType.code,
				...dataForListType,
			};

			if (this.customFieldModal.isEditing && id) {
				this.updateCustomField(id, customFieldBody);
			} else {
				this.createCustomField(customFieldBody);
			}
		},

		async createCustomField(customFieldBody) {
			try {
				this.customFieldModal.isWaiting = true;

				const {
					status,
					message,
				} = await CustomFieldsService.createCustomField(customFieldBody);

				checkResponseStatus(status, message);

				Notification(this.$t("Custom Field Successfully Created"), "success");
				await this.$refs.customFieldsList.fetchData();
				this.onCloseCustomFieldModal();
			} catch (e) {
				Notification(`${this.$t("Custom Fields")}: ${e.message || e}`, "error");
			} finally {
				this.customFieldModal.isWaiting = false;
			}
		},

		async updateCustomField(id, customFieldBody) {
			try {
				this.customFieldModal.isWaiting = true;

				const {
					status,
					message,
				} = await CustomFieldsService.updateCustomField({
					body: customFieldBody,
					id,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("Custom Field Successfully Updated"), "success");
				await this.$refs.customFieldsList.fetchData();
				this.onCloseCustomFieldModal();
			} catch (e) {
				Notification(`${this.$t("Custom Fields")}: ${e.message || e}`, "error");
			} finally {
				this.customFieldModal.isWaiting = false;
			}
		},

		async onRemoveCustomField(id) {
			try {
				const {
					status,
					message,
				} = await CustomFieldsService.deleteCustomField(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Custom Field Successfully Removed"), "success");
				this.$refs.customFieldsList.removeFromList(id);
			} catch (e) {
				Notification(`${this.$t("Custom Fields")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
