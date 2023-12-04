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
				<div v-for="formInput in formInputs" :key="formInput.key" class="mb-3">
					<DatePicker
						v-if="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.CALENDAR"
						v-model="data[formInput.key]"
						:label="formInput.label"
						:error-messages="validateRequiredMsg(formInput)"
						:disabled="isFormDisabled"
						name="start-date"
						@blur="inputChanged(formInput, data)"
					/>

					<DataSelect
						v-if="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.SINGLE_SELECT
							|| formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.MULTI_SELECT"
						v-model="data[formInput.key]"
						:items="formInput.options"
						:multiple="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.MULTI_SELECT"
						:error-messages="validateRequiredMsg(formInput)"
						:clearable="true"
						:disabled="isFormDisabled"
						:label="formInput.label"
						name="subsectors"
						variant="outlined"
						density="compact"
						hide-details="auto"
						item-title="value"
						item-value="code"
						is-search-enabled
						is-data-shown-as-tag
						optional
						class="mb-6"
						@update:modelValue="inputChanged(formInput, data)"
					/>

					<DataInput
						v-if="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.TEXT_INPUT"
						v-model="data[formInput.key]"
						:error-messages="validateRequiredMsg('name')"
						:disabled="isFormDisabled"
						:label="formInput.label"
						name="project-name"
						variant="outlined"
						density="compact"
						hide-details="auto"
						class="mb-6"
						@blur="inputChanged(formInput, data)"
					/>

					<DataInput
						v-if="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.NUMBER_INPUT"
						v-model.number="data[formInput.key]"
						type="number"
						step="any"
						min="0"
						variant="outlined"
						density="compact"
						hide-details
						dense
						class="mb-6"
						:label="formInput.label"
						:error-messages="validateRequiredMsg(formInput)"
						:hide-spin-buttons="true"
						:disabled="isFormDisabled"
						@blur="inputChanged(formInput, data)"
					/>

					<v-textarea
						v-if="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.TEXT_AREA"
						v-model="data[formInput.key]"
						name="notes"
						variant="outlined"
						density="compact"
						hide-details="auto"
						class="mt-6"
						auto-grow
						:label="formInput.label"
						:error-messages="validateRequiredMsg(formInput)"
						:disabled="isFormDisabled"
						@blur="inputChanged(formInput, data)"
					/>

					<LocationForm
						v-if="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.LOCATION
							&& formInput.key === 'adm1'"
						ref="locationForm"
						is-adm1-optional
						:form-model="data"
						:form-disabled="isFormDisabled"
						:is-editing="modalState.isEditing"
					/>
				</div>
			</v-card-text>

			<v-card-actions>
				<v-spacer />

				<v-btn
					class="text-none"
					size="small"
					color="blue-grey-lighten-4"
					variant="elevated"
					@click="closeForm"
				>
					{{ $t('Close') }}
				</v-btn>

				<v-btn
					v-if="!modalState.isDetail"
					:disabled="isFormDisabled"
					color="primary"
					size="small"
					class="text-none ml-3"
					variant="elevated"
					@click="submitForm"
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
				? this.validate(formInput.key, "data")
				: "";
		},

		closeForm() {
			this.$emit("formClosed");
			this.v$.$reset();
		},

		submitForm() {
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

		inputChanged(formInput, data) {
			this.validateAfterAction(formInput);
			this.checkDependencies(formInput);
			this.$emit("modalInputChanged", { formInput, data });
		},
	},
};
</script>
