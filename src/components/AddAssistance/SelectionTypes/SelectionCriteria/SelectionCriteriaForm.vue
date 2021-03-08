<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field label="Criteria Target">
				<MultiSelect
					v-model="formModel.criteriaTarget"
					label="value"
					track-by="code"
					placeholder="Click to select..."
					:loading="criteriaTargetLoading"
					:options="options.criteriaTargets"
					:searchable="false"
					@select="onCriteriaTargetSelect"
				/>
			</b-field>

			<b-field label="Criteria">
				<MultiSelect
					v-model="formModel.criteria"
					placeholder="Click to select..."
					:options="options.criteria"
					:loading="criteriaLoading"
					label="code"
					track-by="code"
					:searchable="false"
					@select="onCriteriaSelect"
				/>
			</b-field>

			<b-field label="Condition">
				<MultiSelect
					v-model="formModel.condition"
					placeholder="Click to select..."
					label="value"
					track-by="code"
					:options="options.conditions"
					:loading="criteriaConditionsLoading"
					:searchable="false"
				/>
			</b-field>

			<b-field label="Value">
				<b-datepicker
					v-if="fieldTypeToDisplay === consts.FIELD_TYPE.DATE"
					v-model="formModel.value"
					show-week-number
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus
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
					placeholder="Click to select..."
					:loading="valueSelectLoading"
					:options="valueSelectOptions"
					:searchable="false"
				/>

				<b-input
					v-if="fieldTypeToDisplay === consts.FIELD_TYPE.STRING"
					v-model="formModel.value"
				/>

				<b-numberinput
					v-if="
						fieldTypeToDisplay === consts.FIELD_TYPE.INTEGER
							|| fieldTypeToDisplay === consts.FIELD_TYPE.DOUBLE
					"
					v-model="formModel.value"
					expanded
					controls-alignment="right"
					controls-position="compact"
				/>
			</b-field>

			<LocationForm
				v-if="fieldTypeToDisplay === consts.FIELD_TYPE.LOCATION"
				ref="locationForm"
				:form-model="formModel"
			/>

			<b-field label="Score Weight">
				<b-numberinput
					v-model="formModel.scoreWeight"
					expanded
					controls-alignment="right"
					controls-position="compact"
				/>
			</b-field>
		</section>

		<footer class="modal-card-foot">
			<button v-if="closeButton" class="button" type="button" @click="closeForm">
				Close
			</button>
			<b-button
				tag="input"
				class="is-success"
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

export default {
	name: "SelectionCriteriaForm",

	components: { LocationForm },

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
	},

	data() {
		return {
			consts,
			options: {
				criteriaTargets: [],
				criteria: [],
				conditions: [],
				gender: [
					{ code: "M", value: "Male" },
					{ code: "F", value: "Female" },
				],
				boolean: [
					{ code: true, value: "True" },
					{ code: false, value: "False" },
				],
			},
			valueSelectOptions: [],
			valueSelectLoading: false,
			fieldTypeToDisplay: "",
			criteriaTargetLoading: false,
			criteriaLoading: false,
			criteriaConditionsLoading: false,
		};
	},

	computed: {
		criteria() {
			return this.options.criteria;
		},
	},

	async created() {
		await this.fetchCriteriaTargets();
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
					Notification(`Criteria Targets ${e}`, "is-danger");
				});

			this.criteriaTargetLoading = false;
		},

		async fetchCriteriaFields(target) {
			this.criteriaLoading = true;

			await AssistancesService.getAssistanceSelectionCriteriaFields(target.code)
				.then(({ data }) => { this.options.criteria = data; })
				.catch((e) => {
					Notification(`Criteria Fields ${e}`, "is-danger");
				});

			this.criteriaLoading = false;
		},

		async fetchCriteriaConditions(target, field) {
			this.criteriaConditionsLoading = true;

			await AssistancesService.getAssistanceSelectionCriteriaConditions(target.code, field.code)
				.then(({ data }) => {
					this.options.conditions = data;

					if (
						data.length === 1
						&& data[0].code === "="
					) {
						this.formModel.condition = { ...data[0] };
					}
				})
				.catch((e) => {
					Notification(`Criteria Conditions ${e}`, "is-danger");
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
					Notification(`Residence Status ${e}`, "is-danger");
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
					Notification(`Livelihoods ${e}`, "is-danger");
				});

			this.valueSelectLoading = false;
		},

		async fetchLocationsTypes() {
			this.valueSelectLoading = true;

			await BeneficiariesService.getListOfLocationsTypes()
				.then(({ data }) => { this.valueSelectOptions = data; })
				.catch((e) => {
					Notification(`Location Types ${e}`, "is-danger");
				});
			this.valueSelectLoading = false;
		},

		submitForm() {
			this.$emit("formSubmitted", this.formModel);
		},

		closeForm() {
			this.$emit("formClosed");
		},
	},
};
</script>
