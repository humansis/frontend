<template>
	<Modal
		v-model="customFieldModal.isOpened"
		:header="modalHeader"
	>
		<CustomFieldsForm
			:form-model="customFieldModel"
			:submit-button-label="submitButtonLabel"
			:form-disabled="customFieldModal.isDetail"
			:is-editing="customFieldModal.isEditing"
			:loading="customFieldModal.isWaiting"
			close-button
			@formSubmitted="onSubmitCustomFieldForm"
			@formClosed="onCloseCustomFieldModal"
		/>
	</Modal>

	<div class="d-flex justify-end">
		<v-btn
			v-if="userCan.addCustomField"
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
import permissions from "@/mixins/permissions";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "CustomFieldPage",

	components: {
		CustomFieldsList,
		Modal,
		CustomFieldsForm,
	},

	mixins: [permissions],

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
				targetType: "",
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
				targetType,
			},
		) {
			this.customFieldModel = {
				...this.customFieldModel,
				id,
				iso3,
				field,
				type,
				targetType,
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
				targetType: "",
			};
		},

		onSubmitCustomFieldForm(customFieldForm) {
			const {
				id,
				field,
				type,
				iso3,
				targetType,
			} = customFieldForm;

			const customFieldBody = {
				field,
				type: type.code,
				iso3: iso3 || this.country.iso3,
				targetType: targetType.code,
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

				const { status, message } = await CustomFieldsService.createCustomField(customFieldBody);

				checkResponseStatus(status, message);

				Notification(this.$t("Custom Field Successfully Created"), "success");
				await this.$refs.customFieldsList.fetchData();
				this.onCloseCustomFieldModal();
			} catch (e) {
				Notification(`${this.$t("Custom Fields:")} ${e.message || e}`, "error");
			} finally {
				this.customFieldModal.isWaiting = false;
			}
		},

		async updateCustomField(id, customFieldBody) {
			try {
				this.customFieldModal.isWaiting = true;

				const { status, message } = await CustomFieldsService.updateCustomField(
					id,
					customFieldBody,
				);

				checkResponseStatus(status, message);

				Notification(this.$t("Custom Field Successfully Updated"), "success");
				await this.$refs.customFieldsList.fetchData();
				this.onCloseCustomFieldModal();
			} catch (e) {
				Notification(`${this.$t("Custom Fields:")} ${e.message || e}`, "error");
			} finally {
				this.customFieldModal.isWaiting = false;
			}
		},

		async onRemoveCustomField(id) {
			try {
				const { status, message } = await CustomFieldsService.deleteCustomField(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Custom Field Successfully Removed"), "success");
				this.$refs.customFieldsList.removeFromList(id);
			} catch (e) {
				Notification(`${this.$t("Custom Fields:")} ${e.message || e}`, "error");
			}
		},
	},
};
</script>
