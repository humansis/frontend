<template>
	<v-card-text>
		<DataSelect
			v-model="formModel.criteriaTarget"
			:items="options.criteriaTargets"
			:loading="criteriaTargetLoading"
			:error-messages="validationMsg('criteriaTarget')"
			label="Criteria Target"
			name="criteria-target"
			item-title="value"
			item-value="code"
			class="mb-6"
			@update:modelValue="criteriaTargetSelect"
		/>

		<DataSelect
			v-model="formModel.criteria"
			:items="options.criteria"
			:loading="criteriaLoading"
			:error-messages="validationMsg('criteria')"
			label="Criteria"
			name="criteria"
			item-title="value"
			item-value="code"
			class="mb-6"
			@update:modelValue="criteriaTarget"
		/>

		<DataSelect
			v-model="formModel.condition"
			:items="options.conditions"
			:loading="criteriaConditionsLoading"
			:error-messages="validationMsg('condition')"
			label="Condition"
			name="condition"
			item-title="value"
			item-value="code"
			class="mb-6"
			@update:modelValue="validate('condition')"
		/>

		<template v-if="fieldTypeToDisplay !== ASSISTANCE.FIELD_TYPE.LOCATION">
			<DatePicker
				v-if="fieldTypeToDisplay === ASSISTANCE.FIELD_TYPE.DATE"
				v-model="formModel.value"
				:error-messages="validationMsg('value')"
				label="Value"
				name="value"
				@update:modelValue="validate('value')"
			/>

			<DataSelect
				v-else-if="isValueMultiselect"
				v-model="formModel.value"
				:items="valueSelectOptions"
				:loading="valueSelectLoading"
				:disabled="valueDisabled"
				:error-messages="validationMsg('value')"
				label="Value"
				name="value"
				item-title="value"
				item-value="code"
				@update:modelValue="validate('value')"
			/>

			<DataInput
				v-else-if="fieldTypeToDisplay === ASSISTANCE.FIELD_TYPE.STRING"
				v-model="formModel.value"
				:error-messages="validationMsg('value')"
				label="Value"
				name="value"
				@blur="validate('value')"
			/>

			<DataInput
				v-else-if="isValueDefaultInput"
				v-model="formModel.value"
				:error-messages="validationMsg('value')"
				:step="(fieldTypeToDisplay === ASSISTANCE.FIELD_TYPE.DOUBLE) ? '0.01' : '1'"
				label="Value"
				name="value"
				hide-spin-buttons
				@blur="validate('value')"
			/>

		</template>

		<LocationForm
			v-else
			ref="locationForm"
			:form-model="admModel"
		/>
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
			color="primary"
			size="small"
			class="text-none ml-3"
			variant="elevated"
			@click="submitForm"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DatePicker from "@/components/Inputs/DatePicker";
import LocationForm from "@/components/Inputs/LocationForm";
import validation from "@/mixins/validation";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";
import { required, requiredIf } from "@vuelidate/validators";

export default {
	name: "SelectionCriteriaForm",

	components: {
		LocationForm,
		DataSelect,
		DatePicker,
		DataInput,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				criteriaTarget: { required },
				criteria: { required },
				condition: { required },
				value: { required: requiredIf(
					this.fieldTypeToDisplay !== this.ASSISTANCE.FIELD_TYPE.LOCATION,
				) },
			},
		};
	},

	props: {
		formModel: Object,

		submitButtonLabel: {
			type: String,
			default: "",
		},

		closeButton: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			ASSISTANCE,
			admModel: {
				adm1: null,
				adm2: null,
				adm3: null,
				adm4: null,
			},
			options: {
				criteriaTargets: [],
				criteria: [],
				conditions: [],
				gender: [
					{ code: "M", value: this.$t("Male") },
					{ code: "F", value: this.$t("Female") },
				],
				boolean: [
					{ code: true, value: this.$t("True") },
					{ code: false, value: this.$t("False") },
				],
			},
			valueSelectOptions: [],
			valueSelectLoading: false,
			fieldTypeToDisplay: "",
			criteriaTargetLoading: false,
			criteriaLoading: false,
			criteriaConditionsLoading: false,
			advancedOptions: false,
			valueDisabled: false,
		};
	},

	computed: {
		criteria() {
			return this.options.criteria;
		},

		isValueMultiselect() {
			return this.fieldTypeToDisplay === this.ASSISTANCE.FIELD_TYPE.GENDER
				|| this.fieldTypeToDisplay === this.ASSISTANCE.FIELD_TYPE.LOCATION_TYPE
				|| this.fieldTypeToDisplay === this.ASSISTANCE.FIELD_TYPE.BOOLEAN
				|| this.fieldTypeToDisplay === this.ASSISTANCE.FIELD_TYPE.RESIDENCY_STATUS
				|| this.fieldTypeToDisplay === this.ASSISTANCE.FIELD_TYPE.LIVELIHOOD;
		},

		isValueDefaultInput() {
			return 	this.fieldTypeToDisplay === this.ASSISTANCE.FIELD_TYPE.INTEGER
				|| this.fieldTypeToDisplay === this.ASSISTANCE.FIELD_TYPE.DOUBLE;
		},
	},

	created() {
		this.advancedOptions = false;
		this.fetchCriteriaTargets();
	},

	methods: {
		onCriteriaTargetSelect(target) {
			this.formModel.criteria = "";
			this.formModel.condition = "";

			this.formModel.criteriaTarget = target;
			this.fetchCriteriaFields(target);
		},

		onCriteriaSelect(criteria) {
			this.formModel.condition = "";
			this.formModel.value = null;

			this.fieldTypeToDisplay = criteria.type;

			switch (criteria.type) {
				case ASSISTANCE.FIELD_TYPE.GENDER:
					this.valueSelectOptions = this.options.gender;
					break;
				case ASSISTANCE.FIELD_TYPE.LOCATION_TYPE:
					this.fetchLocationsTypes();
					break;
				case ASSISTANCE.FIELD_TYPE.BOOLEAN:
					this.valueSelectOptions = this.options.boolean;
					break;
				case ASSISTANCE.FIELD_TYPE.RESIDENCY_STATUS:
					this.fetchResidenceStatuses();
					break;
				case ASSISTANCE.FIELD_TYPE.LIVELIHOOD:
					this.fetchLivelihoods();
					break;
				default:
					this.valueSelectOptions = [];
			}

			this.fetchCriteriaConditions(this.formModel.criteriaTarget, criteria);

			this.presetValueBasedOnCriteria(criteria);
		},

		async fetchCriteriaTargets() {
			this.criteriaTargetLoading = true;

			await AssistancesService.getAssistanceSelectionCriteriaTargets()
				.then(({ data }) => { this.options.criteriaTargets = data; })
				.catch((e) => {
					Notification(`${this.$t("Criteria Targets")} ${e.message || e}`, "error");
				});

			this.criteriaTargetLoading = false;
		},

		async fetchCriteriaFields(target) {
			this.criteriaLoading = true;

			await AssistancesService.getAssistanceSelectionCriteriaFields(target.code)
				.then(({ data }) => { this.options.criteria = data; })
				.catch((e) => {
					Notification(`${this.$t("Criteria Fields")} ${e.message || e}`, "error");
				});

			this.criteriaLoading = false;
		},

		async fetchCriteriaConditions(target, field) {
			this.criteriaConditionsLoading = true;

			await AssistancesService.getAssistanceSelectionCriteriaConditions(target.code, field.code)
				.then(({ data }) => {
					this.options.conditions = data;

					if (data.length === 1 && data[0].code === "=") {
						this.formModel.condition = { ...data[0] };
					}
				})
				.catch((e) => {
					Notification(`${this.$t("Criteria Conditions")} ${e.message || e}`, "error");
				});

			this.criteriaConditionsLoading = false;
		},

		async fetchResidenceStatuses() {
			this.valueSelectLoading = true;

			await BeneficiariesService.getListOfResidenceStatuses()
				.then(({ data }) => {
					this.valueSelectOptions = data;
				})
				.catch((e) => {
					Notification(`${this.$t("Residency Statuses")} ${e.message || e}`, "error");
				});

			this.valueSelectLoading = false;
		},

		async fetchLivelihoods() {
			this.valueSelectLoading = true;

			await BeneficiariesService.getListOfLivelihoods()
				.then(({ data }) => {
					this.valueSelectOptions = data;
				})
				.catch((e) => {
					Notification(`${this.$t("Livelihoods")} ${e.message || e}`, "error");
				});

			this.valueSelectLoading = false;
		},

		async fetchLocationsTypes() {
			this.valueSelectLoading = true;

			await BeneficiariesService.getListOfLocationsTypes()
				.then(({ data }) => { this.valueSelectOptions = data; })
				.catch((e) => {
					Notification(`${this.$t("Location Types")} ${e.message || e}`, "error");
				});

			this.valueSelectLoading = false;
		},

		presetValueBasedOnCriteria(criteria) {
			const criteriaWithPresetValue = ["disabled", "disabledHeadOfHousehold", "soloParent", "lactating", "pregnant", "chronicallyIll"];
			// if any of these criteria is set, preset value to true and disable the field
			if (criteriaWithPresetValue.includes(criteria.code)) {
				[this.formModel.value] = this.options.boolean;
				this.valueDisabled = true;
			} else {
				this.valueDisabled = false;
			}
		},

		submitForm() {
			this.v$.$touch();
			if (this.v$.$invalid) {
				return;
			}

			if (this.fieldTypeToDisplay === ASSISTANCE.FIELD_TYPE.LOCATION
				&& this.$refs.locationForm.submitLocationForm()) {
				return;
			}

			if (this.fieldTypeToDisplay === ASSISTANCE.FIELD_TYPE.LOCATION) {
				const { adm1, adm2, adm3, adm4 } = this.admModel;
				const prefix = "locationId-";

				if (adm4) {
					this.formModel.value = prefix + adm4.locationId;
				} else if (adm3) {
					this.formModel.value = prefix + adm3.locationId;
				} else if (adm2) {
					this.formModel.value = prefix + adm2.locationId;
				} else if (adm1) {
					this.formModel.value = prefix + adm1.locationId;
				}
			}

			this.$emit("formSubmitted", this.formModel);
		},

		closeForm() {
			this.$emit("formClosed");
		},

		criteriaTargetSelect(target) {
			this.validate("criteriaTarget");
			this.onCriteriaTargetSelect(target);
		},

		criteriaTarget(criteria) {
			this.validate("criteria");
			this.onCriteriaSelect(criteria);
		},
	},
};
</script>
