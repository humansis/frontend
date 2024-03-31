<template>
	<v-card-text>
		<DataInput
			v-model="formModel.key"
			label="Key"
			name="key"
			class="mb-4"
			disabled
		/>

		<DataInput
			v-model="formModel.label"
			:disabled="isDetail"
			:error-messages="validationMsg('label')"
			label="Label"
			name="label"
			class="mb-4"
			@update:modelValue="onValidate('label')"
		/>

		<DataSelect
			v-model="formModel.type"
			:items="options.types"
			:disabled="isDetail || isEditing"
			:error-messages="validationMsg('type')"
			label="Type"
			name="type"
			class="mb-4"
			@update:modelValue="onValidate('type')"
		/>

		<DataSelect
			v-model="formModel.targetType"
			:items="options.targetTypes"
			:disabled="isDetail || isEditing"
			:error-messages="validationMsg('targetType')"
			label="Target"
			name="target"
			class="mb-4"
			@update:modelValue="onValidate('targetType')"
		/>

		<DataTextarea
			v-model.trim="formModel.note"
			:disabled="isDetail"
			:error-messages="validationMsg('note')"
			:rows="2"
			label="Note"
			name="note"
			class="mb-4"
			is-optional
			auto-grow
			@update:modelValue="onValidate('note')"
		/>

		<template v-if="isListSelected">
			<DataSelect
				v-model="formModel.selectionType"
				:items="options.selectionTypes"
				:disabled="isDetail || formModel.isUsed"
				:error-messages="validationMsg('selectionType')"
				label="Selection"
				name="selection"
				class="mb-4"
				@update:modelValue="onValidate('selectionType')"
			/>

			<div
				v-for="(value, index) in formModel.listOfValues"
				:key="index"
				class="d-flex"
			>
				<DataInput
					v-model="formModel.listOfValues[index].value"
					:disabled="isDetail || formModel.isUsed"
					:error-messages="validationMsg('listOfValues', 'formModel', index)"
					:label="`Value ${index + 1}`"
					:name="`value-${index + 1}`"
					class="mb-4"
					@update:modelValue="onValidate('listOfValues')"
				/>

				<ButtonAction
					v-if="index !== 0 && !isDetail"
					icon="trash"
					icon-color="red"
					tooltip-text="Remove input"
					class="pb-1"
					@actionConfirmed="removeInput(index)"
				/>
			</div>

			<p v-if="isDuplicityInValues" class="text-error">
				{{ $t("Each value must be unique") }}
			</p>

			<v-checkbox
				v-if="isListSelected"
				v-model="formModel.isPropagatedToSelectionCriteria"
				:disabled="isDetail || formModel.isUsed"
				:label="$t('Propagate to selection criteria')"
				name="propagate-to-selection-criteria"
				class="checkbox"
				hide-details
			/>

			<div class="d-flex justify-end">
				<v-btn
					v-if="!isDetail || !formModel.isUsed"
					color="primary"
					class="text-none mb-8"
					variant="elevated"
					@click="addNewValueInput"
				>
					{{ $t("Add new value") }}
				</v-btn>
			</div>
		</template>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			class="text-none"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="!formDisabled"
			:loading="loading"
			color="primary"
			class="text-none ml-3 mr-4"
			variant="elevated"
			@click="onSubmitForm"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import { helpers, maxLength, required } from "@vuelidate/validators";
import ButtonAction from "@/components/ButtonAction";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DataTextarea from "@/components/Inputs/DataTextarea";
import validation from "@/mixins/validation";
import { isCustomFieldLabelValid } from "@/utils/customValidators";
import { COUNTRY_SETTINGS } from "@/consts";

export default {
	name: "CustomFieldForm",

	emits: ["formSubmitted", "formClosed"],

	components: {
		ButtonAction,
		DataInput,
		DataSelect,
		DataTextarea,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				label: {
					required,
					isCustomFieldLabelValid: helpers.withMessage(
						this.$t("Label contains forbidden special characters: {}"),
						isCustomFieldLabelValid,
					),
				},
				note: { maxLength: maxLength(200) },
				type: { required },
				targetType: { required },
				...(this.isListSelected
					&& {
						selectionType: { required },
						listOfValues: {
							$each: helpers.forEach({
								value: {
									required,
								},
							}),
						},
					}
				),
			},
		};
	},

	props: {
		closeButton: Boolean,

		formModel: {
			type: Object,
			required: true,
		},

		submitButtonLabel: {
			type: String,
			required: true,
		},

		loading: {
			type: Boolean,
			default: false,
		},

		isEditing: {
			type: Boolean,
			default: false,
		},

		isDetail: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			isValuesForListDuplicated: false,
			options: {
				types: COUNTRY_SETTINGS.CUSTOM_FIELDS.TYPES,
				selectionTypes: COUNTRY_SETTINGS.CUSTOM_FIELDS.SELECTION_TYPES,
				targetTypes: COUNTRY_SETTINGS.CUSTOM_FIELDS.TARGET_TYPES,
			},
		};
	},

	computed: {
		isListSelected() {
			return this.formModel.type?.code === COUNTRY_SETTINGS.CUSTOM_FIELDS.LIST_TYPE_CODE;
		},

		isDuplicityInValues() {
			const { listOfValues } = this.formModel;

			if (!listOfValues?.length) {
				return false;
			}

			const uniqueValues = new Set();

			return listOfValues.some(({ value }) => {
				if (uniqueValues.has(value)) {
					return true;
				}

				uniqueValues.add(value);

				return false;
			});
		},
	},

	mounted() {
		if (this.isEditing || this.isDetail) {
			this.mapSelects();
		}
	},

	methods: {
		mapSelects() {
			const selectCode = this.formModel.isMultiSelect
				? COUNTRY_SETTINGS.CUSTOM_FIELDS.MULTI_SELECT_CODE
				: COUNTRY_SETTINGS.CUSTOM_FIELDS.SINGLE_SELECT_CODE;

			this.formModel.type = this.options.types.find(
				(item) => item.code === this.formModel.type,
			);
			this.formModel.targetType = this.options.targetTypes.find(
				(item) => item.code === this.formModel.targetType,
			);
			this.formModel.selectionType = this.options.selectionTypes.find(
				(type) => type.code === selectCode,
			);

			if (this.formModel.allowedValues) {
				this.formModel.listOfValues = this.formModel.allowedValues?.map((value) => ({
					value,
				}));
			}
		},

		addNewValueInput() {
			console.log(this.formModel);
			this.formModel.listOfValues.push({ value: "" });
		},

		removeInput(index) {
			this.formModel.listOfValues.splice(index, 1);
		},

		onSubmitForm() {
			this.v$.$touch();

			if (this.v$.$invalid || this.isDuplicityInValues) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.v$.$reset();
		},

		onCloseForm() {
			this.$emit("formClosed");
			this.v$.$reset();
		},
	},
};
</script>
