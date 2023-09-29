<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<div v-for="formInput in formInputs" :key="formInput.key" class="mb-3">
				<b-field
					v-if="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.CALENDAR"
					:type="validateRequiredType(formInput)"
					:message="validateRequiredMsg(formInput)"
				>
					<template #label>
						{{ formInput.label }}
						<span v-if="!formInput.required" class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>

					<b-datepicker
						v-model="data[formInput.key]"
						show-week-number
						locale="en-CA"
						icon="calendar-day"
						trap-focus
						:placeholder="$t('Click to select')"
						:disabled="isFormDisabled"
						@input="inputChanged(formInput, data)"
					/>
				</b-field>
				<b-field
					v-if="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.SINGLE_SELECT"
					:type="validateRequiredType(formInput)"
					:message="validateRequiredMsg(formInput)"
				>
					<template #label>
						{{ formInput.label }}
						<span v-if="!formInput.required" class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>

					<MultiSelect
						v-model="data[formInput.key]"
						searchable
						label="value"
						track-by="code"
						:placeholder="$t('Click to select')"
						:select-label="$t('Press enter to select')"
						:selected-label="$t('Selected')"
						:deselect-label="$t('Press enter to remove')"
						:loading="formInput.isDataLoading"
						:options="formInput.options"
						:disabled="isFormDisabled"
						:class="validateRequiredMultiselect(formInput)"
						@input="inputChanged(formInput, data)"
					>
						<span slot="noOptions">{{ $t("List is empty")}}</span>
						<template #option="props">
							<div class="option__desc">
								<span class="option__title">{{ props.option.value }}</span>
							</div>
						</template>
						<template #singleLabel="props">
							<div class="option__desc">
								<span class="option__title">{{ props.option.value }}</span>
							</div>
						</template>
					</MultiSelect>
				</b-field>

				<b-field
					v-if="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.MULTI_SELECT"
					:type="validateRequiredType(formInput)"
					:message="validateRequiredMsg(formInput, data)"
				>
					<template #label>
						{{ formInput.label }}
						<span v-if="!formInput.required" class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>

					<MultiSelect
						v-model="data[formInput.key]"
						multiple
						searchable
						label="value"
						track-by="code"
						:placeholder="$t('Click to select')"
						:select-label="$t('Press enter to select')"
						:selected-label="$t('Selected')"
						:deselect-label="$t('Press enter to remove')"
						:loading="formInput.isDataLoading"
						:options="formInput.options"
						:disabled="isFormDisabled"
						:class="validateRequiredMultiselect(formInput)"
						@input="inputChanged(formInput, data)"
					>
						<span slot="noOptions">{{ $t("List is empty")}}</span>
						<template #option="props">
							<div class="option__desc">
								<span class="option__title">{{ props.option.value }}</span>
							</div>
						</template>
						<template #singleLabel="props">
							<div class="option__desc">
								<span class="option__title">{{ props.option.value }}</span>
							</div>
						</template>
					</MultiSelect>
				</b-field>

				<b-field
					v-if="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.TEXT_INPUT"
					:type="validateRequiredType(formInput)"
					:message="validateRequiredMsg(formInput)"
				>
					<template #label>
						{{ formInput.label }}
						<span v-if="!formInput.required" class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>

					<b-input
						v-model="data[formInput.key]"
						:disabled="isFormDisabled"
						@blur="inputChanged(formInput, data)"
					/>
				</b-field>

				<b-field
					v-if="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.NUMBER_INPUT"
					:type="validateRequiredType(formInput)"
					:message="validateRequiredMsg(formInput)"
				>
					<template #label>
						{{ formInput.label }}
						<span v-if="!formInput.required" class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>

					<b-numberinput
						v-model="data[formInput.key]"
						:controls="false"
						:disabled="isFormDisabled"
						@blur="inputChanged(formInput, data)"
					/>
				</b-field>

				<b-field
					v-if="formInput.type === GENERAL.EDITABLE_TABLE.COLUMN_TYPE.TEXT_AREA"
					:type="validateRequiredType(formInput)"
					:message="validateRequiredMsg(formInput)"
				>
					<template #label>
						{{ formInput.label }}
						<span v-if="!formInput.required" class="optional-text has-text-weight-normal is-italic">
							- {{ $t('Optional') }}
						</span>
					</template>

					<b-input
						v-model.trim="data[formInput.key]"
						type="textarea"
						:disabled="isFormDisabled"
						@blur="inputChanged(formInput, data)"
					/>
				</b-field>

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
		</section>

		<footer class="modal-card-foot">
			<b-button @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="!modalState.isDetail"
				:disabled="isFormDisabled"
				type="is-primary"
				native-type="submit"
			>
				{{ buttonLabel }}
			</b-button>
		</footer>
	</form>
</template>

<script>
import { minValue, maxValue, requiredIf } from "vuelidate/lib/validators";
import LocationForm from "@/components/LocationForm";
import validation from "@/mixins/validation";
import { GENERAL } from "@/consts";

export default {
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
	},

	components: {
		LocationForm,
	},

	mixins: [validation],

	created() {
		if (this.modalState.isDetail || this.modalState.isEditing) {
			this.data = { ...this.formData };
		}
	},

	data() {
		return {
			GENERAL,
			data: this.createNewObject(),
		};
	},

	validations() {
		return {
			data: this.prepareValidations(),
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

	methods: {
		prepareValidations() {
			const validationsRules = {};

			this.formInputs.forEach((input) => {
				const { validations } = input;

				validationsRules[input.key] = {
					...((validations?.required || validations?.requiredIf)
						&& { required: requiredIf((form) => form[validations?.requiredIf]
								|| validations?.required) }
					),
					...(validations?.minValue && { minValue: minValue(validations.minValue) }),
					...(validations?.maxValue && { maxValue: maxValue(validations.maxValue) }),
				};
			});
			return validationsRules;
		},

		isInputWithValidationsRules(key) {
			return this.$v.data[key]
				&& ("required" in this.$v.data[key]
					|| "minValue" in this.$v.data[key]
					|| "maxValue" in this.$v.data[key]
				);
		},

		checkDependencies(formInput) {
			const valueToReset = formInput.clearValueAfterChange;

			if (valueToReset && this.data[valueToReset]) {
				this.data[valueToReset] = null;
			}
		},

		validateRequiredType(formInput) {
			return this.isInputWithValidationsRules(formInput.key)
				? this.validateType(formInput.key, true, "data")
				: "";
		},

		validateRequiredMsg(formInput) {
			return this.isInputWithValidationsRules(formInput.key)
				? this.validateMsg(formInput.key, "Required", "data")
				: "";
		},

		validateRequiredMultiselect(formInput) {
			return this.isInputWithValidationsRules(formInput.key)
				? this.validateMultiselect(formInput.key, true, "data")
				: "";
		},

		validateAfterAction(formInput) {
			return this.isInputWithValidationsRules(formInput.key)
				? this.validate(formInput.key, "data")
				: "";
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

		submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("rowConfirmed", {
				data: this.data,
				isCreate: !this.modalState.isEditing && !this.modalState.isDetail,
			});

			this.$v.$reset();
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
