<template>
	<v-dialog
		v-model="$attrs.modelValue"
		width="960"
		scrollable
	>
		<v-card>
			<v-card-title class="text-h6 font-weight-bold">
				{{ $t(header) }}
			</v-card-title>

			<v-card-text class="mt-4">
				<div v-for="(formInput, index) in formInputs" :key="formInput.key" class="mb-3">
					<DatePicker
						v-if="isInputTypeCalendar(formInput)"
						v-model="data[formInput.key]"
						:label="formInput.label"
						:error-messages="validateRequiredMsg(formInput)"
						:disabled="isFormDisabled"
						name="start-date"
						class="mb-4"
						@blur="onInputChanged(formInput, data)"
					/>

					<DataSelect
						v-if="isInputTypeSingleSelect(formInput) || isInputTypeMultiSelect(formInput)"
						v-model="data[formInput.key]"
						:items="formInput.options"
						:multiple="isInputTypeMultiSelect(formInput)"
						:is-data-shown-as-tag="isInputTypeMultiSelect(formInput)"
						:error-messages="validateRequiredMsg(formInput)"
						:clearable="true"
						:disabled="isFormDisabled"
						:label="formInput.label"
						name="subsectors"
						is-search-enabled
						optional
						class="mb-4"
						@update:modelValue="onInputChanged(formInput, data)"
					/>

					<DataInput
						v-if="isInputTypeText(formInput)"
						v-model="data[formInput.key]"
						:error-messages="validateRequiredMsg('name')"
						:disabled="isFormDisabled"
						:label="formInput.label"
						name="project-name"
						class="mb-4"
						@blur="onInputChanged(formInput, data)"
					/>

					<DataInput
						v-if="isInputTypeNumber(formInput)"
						v-model.number="data[formInput.key]"
						:label="formInput.label"
						:error-messages="validateRequiredMsg(formInput)"
						:hide-spin-buttons="true"
						:disabled="isFormDisabled"
						type="number"
						min="0"
						dense
						class="mb-4"
						@blur="onInputChanged(formInput, data)"
					/>

					<DataTextarea
						v-if="isInputTypeTextArea(formInput)"
						v-model="data[formInput.key]"
						:label="formInput.label"
						:error-messages="validateRequiredMsg(formInput)"
						:disabled="isFormDisabled"
						:name="`note-${index}`"
						class="mt-4"
						auto-grow
						@blur="onInputChanged(formInput, data)"
					/>

					<LocationForm
						v-if="isInputTypeLocation(formInput) && isLocationTypeAdm1(formInput)"
						ref="locationForm"
						:form-model="data"
						:form-disabled="isFormDisabled"
						:is-editing="modalState.isEditing"
						is-adm1-optional
					/>
				</div>
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
					v-if="!modalState.isDetail"
					:disabled="isFormDisabled"
					color="primary"
					class="text-none ml-3"
					variant="elevated"
					@click="onSubmitForm"
				>
					{{ buttonLabel }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DataTextarea from "@/components/Inputs/DataTextarea";
import DatePicker from "@/components/Inputs/DatePicker";
import LocationForm from "@/components/Inputs/LocationForm";
import validation from "@/mixins/validation";
import { GENERAL } from "@/consts";
import { maxValue, minValue, requiredIf } from "@vuelidate/validators";

export default {

	components: {
		DatePicker,
		DataSelect,
		DataInput,
		LocationForm,
		DataTextarea,
	},

	mixins: [validation],

	validations() {
		return {
			data: this.prepareValidations(),
		};
	},

	props: {
		formInputs: {
			type: Array,
			required: true,
		},

		createButtonLabel: {
			type: String,
			default: "Create",
		},

		modalState: {
			type: Object,
			required: true,
		},

		formData: {
			type: Object,
			default: () => {},
		},

		header: {
			type: String,
			default: "",
		},
	},

	data() {
		return {
			GENERAL,
			data: this.createNewObject(),
		};
	},

	computed: {
		buttonLabel() {
			return this.modalState.isEditing || this.modalState.isDetail
				? this.$t("Update")
				: this.$t(this.createButtonLabel);
		},

		isFormDisabled() {
			return this.modalState.isDetail;
		},
	},

	watch: {
		formData: {
			deep: true,
			handler(value) {
				if (this.modalState.isDetail || this.modalState.isEditing) {
					this.data = { ...value };
				} else {
					this.data = {};
				}
			},
		},
	},

	methods: {
		prepareValidations() {
			const validationsRules = {};

			this.formInputs.forEach((input) => {
				const { validations } = input;

				validationsRules[input.key] = {
					...((validations?.required || validations?.requiredIf)
						&& { required: requiredIf(() => this.data[validations?.requiredIf]
								|| validations?.required) }
					),
					...(validations?.minValue && { minValue: minValue(validations.minValue) }),
					...(validations?.maxValue && { maxValue: maxValue(validations.maxValue) }),
				};
			});
			return validationsRules;
		},

		isInputWithValidationsRules(key) {
			return this.v$.data[key]
				&& ("required" in this.v$.data[key]
					|| "minValue" in this.v$.data[key]
					|| "maxValue" in this.v$.data[key]
				);
		},

		checkDependencies(formInput) {
			const valueToReset = formInput.clearValueAfterChange;

			if (valueToReset && this.data[valueToReset]) {
				this.data[valueToReset] = null;
			}
		},

		validateRequiredMsg(formInput) {
			return this.isInputWithValidationsRules(formInput.key)
				? this.validationMsg(formInput.key, "data")
				: "";
		},

		validateAfterAction(formInput) {
			return this.isInputWithValidationsRules(formInput.key)
				? this.onValidate(formInput.key, "data")
				: "";
		},

		onCloseForm() {
			this.$emit("formClosed");
			this.v$.$reset();
		},

		onSubmitForm() {
			this.v$.$touch();
			if (this.v$.$invalid) {
				return;
			}

			this.$emit("rowConfirmed", {
				data: this.data,
				isCreate: !this.modalState.isEditing && !this.modalState.isDetail,
			});

			this.v$.$reset();
		},

		createNewObject() {
			const newObject = {};

			this.formInputs.forEach((column) => {
				newObject[column.key] = null;
			});

			return newObject;
		},

		onInputChanged(formInput, data) {
			this.validateAfterAction(formInput);
			this.checkDependencies(formInput);
			this.$emit("modalInputChanged", { formInput, data });
		},

		isInputTypeSingleSelect({ type }) {
			return type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.SINGLE_SELECT;
		},

		isInputTypeMultiSelect({ type }) {
			return type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.MULTI_SELECT;
		},

		isInputTypeCalendar({ type }) {
			return type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.CALENDAR;
		},

		isInputTypeText({ type }) {
			return type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.TEXT_INPUT;
		},

		isInputTypeNumber({ type }) {
			return type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.NUMBER_INPUT;
		},

		isInputTypeTextArea({ type }) {
			return type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.TEXT_AREA;
		},

		isInputTypeLocation({ type }) {
			return type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.LOCATION;
		},

		isLocationTypeAdm1({ key }) {
			return key === GENERAL.EDITABLE_TABLE.ADM_TYPE.ADM1;
		},
	},
};
</script>
