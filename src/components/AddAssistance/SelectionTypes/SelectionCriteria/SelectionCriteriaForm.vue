<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				:label="$t('Criteria Target')"
				:type="validateType('criteriaTarget')"
				:message="validateMsg('criteriaTarget')"
			>
				<MultiSelect
					v-model="formModel.criteriaTarget"
					label="value"
					track-by="code"
					:placeholder="$t('Click to select')"
					:loading="criteriaTargetLoading"
					:options="options.criteriaTargets"
					:searchable="false"
					:class="validateMultiselect('criteriaTarget')"
					@select="onCriteriaTargetSelect"
					@input="validate('criteriaTarget')"
				/>
			</b-field>

			<b-field
				:label="$t('Criteria')"
				:type="validateType('criteria')"
				:message="validateMsg('criteria')"
			>
				<MultiSelect
					v-model="formModel.criteria"
					:placeholder="$t('Click to select')"
					:options="options.criteria"
					:loading="criteriaLoading"
					label="value"
					track-by="code"
					:searchable="false"
					:class="validateMultiselect('criteria')"
					@select="onCriteriaSelect"
					@input="validate('criteria')"
				/>
			</b-field>

			<b-field
				:label="$t('Condition')"
				:type="validateType('condition')"
				:message="validateMsg('condition')"
			>
				<MultiSelect
					v-model="formModel.condition"
					:placeholder="$t('Click to select')"
					label="value"
					track-by="code"
					:options="options.conditions"
					:loading="criteriaConditionsLoading"
					:searchable="false"
					:class="validateMultiselect('condition')"
					@input="validate('condition')"
				/>
			</b-field>

			<b-field
				v-if="fieldTypeToDisplay !== consts.FIELD_TYPE.LOCATION"
				:label="$t('Value')"
				:type="validateType('value')"
				:message="validateMsg('value')"
			>
				<b-datepicker
					v-if="fieldTypeToDisplay === consts.FIELD_TYPE.DATE"
					v-model="formModel.value"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					:placeholder="$t('Click to select')"
					@input="validate('value')"
				/>

				<MultiSelect
					v-if="
						fieldTypeToDisplay === consts.FIELD_TYPE.GENDER
							|| fieldTypeToDisplay === consts.FIELD_TYPE.LOCATION_TYPE
							|| fieldTypeToDisplay === consts.FIELD_TYPE.BOOLEAN
							|| fieldTypeToDisplay === consts.FIELD_TYPE.RESIDENCY_STATUS
							|| fieldTypeToDisplay === consts.FIELD_TYPE.LIVELIHOOD
					"
					v-model="formModel.value"
					label="value"
					track-by="code"
					:placeholder="$t('Click to select')"
					:loading="valueSelectLoading"
					:options="valueSelectOptions"
					:searchable="false"
					:class="validateMultiselect('value')"
					@input="validate('value')"
				/>

				<b-input
					v-if="fieldTypeToDisplay === consts.FIELD_TYPE.STRING"
					v-model="formModel.value"
					@blur="validate('value')"
				/>

				<b-numberinput
					v-if="
						fieldTypeToDisplay === consts.FIELD_TYPE.INTEGER
							|| fieldTypeToDisplay === consts.FIELD_TYPE.DOUBLE
					"
					v-model="formModel.value"
					:step="(fieldTypeToDisplay === consts.FIELD_TYPE.DOUBLE) ? '0.01' : '1'"
					min="0"
					max="1000"
					expanded
					:controls="false"
					@blur="validate('value')"
				/>
			</b-field>

			<LocationForm
				v-if="fieldTypeToDisplay === consts.FIELD_TYPE.LOCATION"
				ref="locationForm"
				:form-model="admModel"
			/>
		</section>

		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				tag="input"
				class="is-primary"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import LocationForm from "@/components/LocationForm";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import consts from "@/utils/assistanceConst";
import BeneficiariesService from "@/services/BeneficiariesService";
import { required, requiredIf } from "vuelidate/lib/validators";
import validation from "@/mixins/validation";

export default {
	name: "SelectionCriteriaForm",

	components: { LocationForm },

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
	},

	mixins: [validation],

	data() {
		return {
			consts,
			admModel: {
				adm1Id: null,
				adm2Id: null,
				adm3Id: null,
				adm4Id: null,
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
		};
	},

	validations: {
		formModel: {
			criteriaTarget: { required },
			criteria: { required },
			condition: { required },
			// eslint-disable-next-line func-names
			value: { required: requiredIf(function () {
				return this.fieldTypeToDisplay !== consts.FIELD_TYPE.LOCATION;
			}) },
		},
	},

	computed: {
		criteria() {
			return this.options.criteria;
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
				case consts.FIELD_TYPE.GENDER:
					this.valueSelectOptions = this.options.gender;
					break;
				case consts.FIELD_TYPE.LOCATION_TYPE:
					this.fetchLocationsTypes();
					break;
				case consts.FIELD_TYPE.BOOLEAN:
					this.valueSelectOptions = this.options.boolean;
					break;
				case consts.FIELD_TYPE.RESIDENCY_STATUS:
					this.fetchResidenceStatuses();
					break;
				case consts.FIELD_TYPE.LIVELIHOOD:
					this.fetchLivelihoods();
					break;
				default:
					this.valueSelectOptions = [];
			}

			this.fetchCriteriaConditions(this.formModel.criteriaTarget, criteria);
		},

		async fetchCriteriaTargets() {
			this.criteriaTargetLoading = true;

			await AssistancesService.getAssistanceSelectionCriteriaTargets()
				.then(({ data }) => { this.options.criteriaTargets = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Criteria Targets")} ${e}`, "is-danger");
				});

			this.criteriaTargetLoading = false;
		},

		async fetchCriteriaFields(target) {
			this.criteriaLoading = true;

			await AssistancesService.getAssistanceSelectionCriteriaFields(target.code)
				.then(({ data }) => { this.options.criteria = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Criteria Fields")} ${e}`, "is-danger");
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
					if (e.message) Notification(`${this.$t("Criteria Conditions")} ${e}`, "is-danger");
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
					if (e.message) Notification(`${this.$t("Residency Statuses")} ${e}`, "is-danger");
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
					if (e.message) Notification(`${this.$t("Livelihoods")} ${e}`, "is-danger");
				});

			this.valueSelectLoading = false;
		},

		async fetchLocationsTypes() {
			this.valueSelectLoading = true;

			await BeneficiariesService.getListOfLocationsTypes()
				.then(({ data }) => { this.valueSelectOptions = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Location Types")} ${e}`, "is-danger");
				});

			this.valueSelectLoading = false;
		},

		submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			if (this.fieldTypeToDisplay === consts.FIELD_TYPE.LOCATION
				&& this.$refs.locationForm.submitLocationForm()) {
				return;
			}

			if (this.fieldTypeToDisplay === consts.FIELD_TYPE.LOCATION) {
				const { adm1Id, adm2Id, adm3Id, adm4Id } = this.admModel;
				const prefix = "locationId-";

				if (adm4Id) {
					this.formModel.value = prefix + adm4Id.locationId;
				} else if (adm3Id) {
					this.formModel.value = prefix + adm3Id.locationId;
				} else if (adm2Id) {
					this.formModel.value = prefix + adm2Id.locationId;
				} else if (adm1Id) {
					this.formModel.value = prefix + adm1Id.locationId;
				}
			}

			this.$emit("formSubmitted", this.formModel);
		},

		closeForm() {
			this.$emit("formClosed");
		},
	},
};
</script>
