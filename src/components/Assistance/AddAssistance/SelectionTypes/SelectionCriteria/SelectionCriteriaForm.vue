<template>
	<v-card-text>
		<DataSelect
			v-model="formModel.criteriaTarget"
			:items="options.criteriaTargets"
			:loading="criteriaTargetLoading"
			:error-messages="validationMsg('criteriaTarget')"
			label="Criteria Target"
			name="criteria-target"
			class="mb-4"
			@update:modelValue="onCriteriaTargetSelect"
		/>

		<DataSelect
			v-model="formModel.criteria"
			:items="options.criteria"
			:loading="criteriaLoading"
			:error-messages="validationMsg('criteria')"
			label="Criteria"
			name="criteria"
			class="mb-4"
			@update:modelValue="onCriteriaSelect"
		/>

		<DataSelect
			v-model="formModel.condition"
			:items="options.conditions"
			:loading="criteriaConditionsLoading"
			:error-messages="validationMsg('condition')"
			label="Condition"
			name="condition"
			class="mb-4"
			@update:modelValue="onValidate('condition')"
		/>

		<template v-if="fieldTypeToDisplay !== ASSISTANCE.FIELD_TYPE.LOCATION">
			<DatePicker
				v-if="fieldTypeToDisplay === ASSISTANCE.FIELD_TYPE.DATE"
				v-model="formModel.value"
				:error-messages="validationMsg('value')"
				label="Value"
				name="value"
				@update:modelValue="onValidate('value')"
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
				@update:modelValue="onValidate('value')"
			/>

			<DataInput
				v-else-if="fieldTypeToDisplay === ASSISTANCE.FIELD_TYPE.STRING"
				v-model="formModel.value"
				:error-messages="validationMsg('value')"
				label="Value"
				name="value"
				@blur="onValidate('value')"
			/>

			<DataInput
				v-else-if="isValueDefaultInput"
				v-model.number="formModel.value"
				:error-messages="validationMsg('value')"
				:step="(fieldTypeToDisplay === ASSISTANCE.FIELD_TYPE.DOUBLE) ? '0.01' : '1'"
				label="Value"
				name="value"
				type="number"
				hide-spin-buttons
				@blur="onValidate('value')"
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
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			color="primary"
			class="text-none ml-3"
			variant="elevated"
			@click="onSubmitForm"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import { integer, minValue, required, requiredIf } from "@vuelidate/validators";
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DatePicker from "@/components/Inputs/DatePicker";
import LocationForm from "@/components/Inputs/LocationForm";
import validation from "@/mixins/validation";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";

export default {
	name: "SelectionCriteriaForm",

	emits: ["formSubmitted", "formClosed"],

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
				value: {
					required: requiredIf(this.fieldTypeToDisplay !== this.ASSISTANCE.FIELD_TYPE.LOCATION),
					...(this.isSelectedCriteriaInteger && {
						minValue: minValue(1),
						integer,
					}),
				},
			},
		};
	},

	props: {
		formModel: {
			type: Object,
			required: true,
		},

		submitButtonLabel: {
			type: String,
			required: true,
		},

		closeButton: {
			type: Boolean,
			default: false,
		},

		targetType: {
			type: String,
			required: true,
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
			selectedCriteria: {},
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
				|| this.fieldTypeToDisplay === this.ASSISTANCE.FIELD_TYPE.LIVELIHOOD
				|| this.isCriteriaTypeOfList;
		},

		isValueDefaultInput() {
			return 	this.fieldTypeToDisplay === this.ASSISTANCE.FIELD_TYPE.INTEGER
				|| this.fieldTypeToDisplay === this.ASSISTANCE.FIELD_TYPE.DOUBLE;
		},

		isCriteriaTypeOfList() {
			return this.selectedCriteria.allowedValues?.length;
		},

		isSelectedCriteriaInteger() {
			return this.formModel.criteria?.type === ASSISTANCE.FIELD_TYPE.INTEGER;
		},
	},

	created() {
		this.advancedOptions = false;
		this.fetchCriteriaTargets();
	},

	methods: {
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
			try {
				this.criteriaLoading = true;

				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getAssistanceSelectionCriteriaFields(
					target.code,
				);

				checkResponseStatus(status, message);

				this.prepareDataForCriteria(data);
			} catch (e) {
				Notification(`${this.$t("Criteria Fields")}: ${e.message || e}`, "error");
			} finally {
				this.criteriaLoading = false;
			}
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

		prepareDataForCriteria(selectionCriteria) {
			let modifiedSelectionCriteria = selectionCriteria;

			if (this.targetType === ASSISTANCE.TARGET.INDIVIDUAL
				&& this.formModel.criteriaTarget?.code === ASSISTANCE.CRITERIA_TARGET.HEAD) {
				modifiedSelectionCriteria = modifiedSelectionCriteria.filter(
					(criteria) => criteria.code !== ASSISTANCE.CRITERIA.HAS_VALID_SMART_CARD,
				);
			}

			modifiedSelectionCriteria = modifiedSelectionCriteria.sort((a, b) => {
				const alphaNumericOrder = a.value.localeCompare(b.value, undefined, {
					numeric: true,
					sensitivity: "base",
				});

				if (a.fieldType === ASSISTANCE.CRITERIA_FIELD_TYPE.CORE
					&& b.fieldType === ASSISTANCE.CRITERIA_FIELD_TYPE.CUSTOM) {
					return -1;
				}

				if (a.fieldType === ASSISTANCE.CRITERIA_FIELD_TYPE.CUSTOM
					&& b.fieldType === ASSISTANCE.CRITERIA_FIELD_TYPE.CORE) {
					return 1;
				}

				return alphaNumericOrder;
			});

			modifiedSelectionCriteria = modifiedSelectionCriteria.map((criteria) => {
				const value = criteria.fieldType === ASSISTANCE.CRITERIA_FIELD_TYPE.CUSTOM
					? `${criteria.value} (${this.$t("Custom Field")})`
					: criteria.value;

				return {
					...criteria,
					value,
				};
			});

			this.options.criteria = modifiedSelectionCriteria;
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

		onSubmitForm() {
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

		onCloseForm() {
			this.$emit("formClosed");
		},

		onCriteriaTargetSelect(target) {
			this.onValidate("criteriaTarget");

			this.formModel.criteria = "";
			this.formModel.condition = "";

			this.formModel.criteriaTarget = target;
			this.fetchCriteriaFields(target);
		},

		onCriteriaSelect(criteria) {
			this.onValidate("criteria");

			this.formModel.condition = "";
			this.formModel.value = null;

			this.selectedCriteria = criteria;
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

			if (this.isCriteriaTypeOfList) {
				this.valueSelectOptions = criteria.allowedValues;
			}

			this.fetchCriteriaConditions(this.formModel.criteriaTarget, criteria);

			this.presetValueBasedOnCriteria(criteria);
		},
	},
};
</script>
