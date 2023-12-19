<template>
	<h2 class="text-h6 mt-5 font-weight-bold">{{ $t('Basic properties') }}</h2>

	<v-card
		class="mx-auto mt-5"
	>
		<v-card-text>
			<AssistanceName
				v-model="formModel.name"
				ref="assistanceName"
				:duplicate-assistance="newAssistanceForm !== null"
				:data-before-duplicated="dataBeforeDuplicated"
				:data-for-assistance-name="dataForAssistanceName"
			/>

			<LocationForm
				ref="locationForm"
				:form-model="formModel"
				@mapped="updateData"
				@locationChanged="valuesForAssistanceName"
			/>

			<DatePicker
				v-model="formModel.dateOfAssistance"
				:max-date="maxDateOfAssistance"
				:min-date="minDateOfAssistance"
				:hint="isDateOfAssistanceInvalidMsg"
				label="Date of Assistance"
				name="date-of-assistance"
				@update:modelValue="valuesForAssistanceName"
			/>

			<DataSelect
				v-model="formModel.round"
				:items="options.rounds"
				label="Round"
				name="round"
				item-title="value"
				item-value="code"
				class="mb-6"
				is-search-enabled
				@update:modelValue="valuesForAssistanceName"
			/>

			<DataInput
				v-model="formModel.eloNumber"
				label="Elo number"
				name="elo-number"
				class="mb-6"
			/>

			<div class="mb-6">
				<DataInput
					v-if="!options.activities.length"
					v-model="formModel.activity"
					label="Activity"
					name="activity"
				/>

				<DataSelect
					v-else
					v-model="formModel.activity"
					:items="options.activities"
					:hint="validationMessages.activity"
					label="Activity"
					name="activity"
					item-title="value"
					item-value="code"
					is-search-enabled
					optional
				/>
			</div>

			<div class="mb-6">
				<DataInput
					v-if="!options.budgetLines.length"
					v-model="formModel.budgetLine"
					label="Budget line"
					name="budget-line"
				/>

				<DataSelect
					v-else
					v-model="formModel.budgetLine"
					:items="options.budgetLines"
					:hint="validationMessages.budgetLine"
					label="Budget line"
					name="budget-line"
					item-title="value"
					item-value="code"
					is-search-enabled
					optional
				/>
			</div>
		</v-card-text>
	</v-card>

	<h2 class="text-h6 mt-5 font-weight-bold">{{ $t('Target') }}</h2>

	<v-card
		class="mx-auto mt-5"
	>
		<v-card-text>
			<DataSelect
				v-model="formModel.sector"
				:items="options.sectors"
				:loading="loading.sectors"
				:error-messages="validationMsg('sector')"
				label="Sector"
				name="sector"
				item-title="value"
				item-value="code"
				class="mb-6"
				@update:modelValue="onSectorSelect"
			/>

			<DataSelect
				v-model="formModel.subsector"
				:items="options.subsectors"
				:loading="loading.subsectors"
				:error-messages="validationMsg('subsector')"
				label="Subsector"
				name="sub-sector"
				item-title="value"
				item-value="code"
				class="mb-6"
				@update:modelValue="onSubsectorSelect"
			/>

			<DataSelect
				v-model="formModel.assistanceType"
				:items="options.assistanceTypes"
				:loading="loading.assistanceTypes"
				:error-messages="validationMsg('assistanceType')"
				label="Assistance Type"
				name="assistance-type"
				item-title="value"
				item-value="code"
				class="mb-6"
				@update:modelValue="onAssistanceTypeSelect"
			/>

			<DataSelect
				v-model="formModel.targetType"
				:items="options.targetTypes"
				:loading="loading.targetTypes"
				:error-messages="validationMsg('targetType')"
				label="Target Type"
				name="target-type"
				item-title="value"
				item-value="code"
				@update:modelValue="onTargetTypeSelect"
			/>
		</v-card-text>
	</v-card>

	<v-card
		class="mx-auto mt-10"
	>
		<v-card-text>
			<v-textarea
				v-model.trim="formModel.note"
				:label="$t('Note')"
				name="note"
				variant="outlined"
				density="compact"
				hide-details="auto"
				auto-grow
			/>
		</v-card-text>
	</v-card>

</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import SectorsService from "@/services/SectorsService";
import AssistanceName from "@/components/Assistance/AssistanceName";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DatePicker from "@/components/Inputs/DatePicker";
import LocationForm from "@/components/Inputs/LocationForm";
import calendarHelper from "@/mixins/calendarHelper";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { normalizeSelectorValue, normalizeText } from "@/utils/datagrid";
import { getUniqueObjectsInArray } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";
import { required } from "@vuelidate/validators";

export default {
	name: "NewAssistanceForm",

	components: {
		LocationForm,
		AssistanceName,
		DatePicker,
		DataSelect,
		DataInput,
	},

	emits: [
		"updatedData",
		"onTargetSelect",
		"showComponent",
	],

	mixins: [validation, calendarHelper],

	validations: {
		formModel: {
			name: { required },
			dateOfAssistance: { required },
			sector: { required },
			subsector: { required },
			targetType: { required },
			assistanceType: { required },
		},
	},

	props: {
		project: {
			type: Object,
			default: () => {},
		},

		newAssistanceForm: {
			type: Object,
			default: null,
		},

		dataBeforeDuplicated: {
			type: Object,
			default: () => {},
		},

		dateExpiration: {
			type: String,
			default: "",
		},

		validationMessages: {
			type: Object,
			default: () => {},
		},
	},

	data() {
		return {
			dataForAssistanceName: {},
			isDateOfAssistanceValid: true,
			formModel: {
				name: "",
				adm1: null,
				adm2: null,
				adm3: null,
				adm4: null,
				locationId: null,
				dateOfAssistance: new Date(),
				sector: null,
				subsector: null,
				targetType: null,
				assistanceType: null,
				note: "",
				round: null,
				eloNumber: "",
				activity: null,
				budgetLine: null,
			},
			options: {
				rounds: ASSISTANCE.ROUNDS_OPTIONS,
				sectors: [],
				subsectors: [],
				assistanceTypes: [],
				targetTypes: [],
				activities: [],
				budgetLines: [],
			},
			loading: {
				sectors: true,
				subsectors: false,
				assistanceTypes: false,
				targetTypes: false,
			},
		};
	},

	computed: {
		maxDateOfAssistance() {
			const { endDate } = this.project;
			return endDate ? new Date(`${endDate} 00:00`) : new Date();
		},

		minDateOfAssistance() {
			const { startDate } = this.project;
			return startDate ? new Date(`${startDate} 00:00`) : new Date();
		},

		assistanceDates() {
			return `${this.formModel.dateOfAssistance} - ${this.dateExpiration}`;
		},

		isDateOfAssistanceInvalidMsg() {
			return !this.isDateOfAssistanceValid
				? this.$t("Date is after Expiration date of the commodity")
				: "";
		},
	},

	watch: {
		formModel() {
			this.mapTargets();
		},

		newAssistanceForm(data) {
			if (data) {
				this.formModel = data;
			}
		},

		assistanceDates() {
			if (this.dateExpiration) {
				this.isDateOfAssistanceValid = this.$moment(this.formModel.dateOfAssistance)
					.format("YYYY-MM-DD") <= this.dateExpiration;
				this.formModel.isDateOfAssistanceValid = this.isDateOfAssistanceValid;
			}
		},
	},

	async mounted() {
		await this.fetchSectors();
		this.defaultDateOfAssistance();
		this.prepareDataFromProjectTargets();
	},

	updated() {
		this.$emit("updatedData", this.formModel);
	},

	methods: {
		async mapTargets() {
			const { sector, subsector, assistanceType, targetType } = this.formModel;
			if (sector && typeof sector !== "object") {
				this.formModel.sector = getArrayOfCodeListByKey([sector], this.options.sectors, "code");
				await this.fetchSubsectors(sector);
			}
			if (subsector && typeof subsector !== "object") {
				this.formModel.subsector = getArrayOfCodeListByKey([subsector], this.options.subsectors, "code");
				await this.fetchAssistanceTypes(subsector);
			} else {
				await this.fetchAssistanceTypes(subsector);
			}
			if (assistanceType && typeof assistanceType !== "object") {
				this.formModel.assistanceType = getArrayOfCodeListByKey([assistanceType], this.options.assistanceTypes, "code");
				await this.fetchTargetTypes(assistanceType);
			}
			if (targetType && typeof targetType !== "object") {
				this.formModel.targetType = getArrayOfCodeListByKey([targetType], this.options.targetTypes, "code");
			}
			await this.showComponents();
			this.$emit("updatedData", this.formModel);
		},

		submit() {
			this.v$.$touch();
			const invalidLocationForm = this.$refs.locationForm.submitLocationForm();
			const invalidAssistanceName = this.$refs.assistanceName.isValid();
			return !this.v$.$invalid
				|| (!this.v$.$invalid && !invalidLocationForm && !invalidAssistanceName);
		},

		updateData() {
			this.$emit("updatedData", this.formModel);
			this.valuesForAssistanceName();
		},

		normalizeText(text) {
			return normalizeText(String(text));
		},

		normalizeSelectorValue(text) {
			return normalizeSelectorValue(text);
		},

		getLocationId() {
			return this.formModel.locationId;
		},

		onSectorSelect({ code }) {
			this.formModel.subsector = [];
			this.formModel.assistanceType = [];
			this.formModel.targetType = [];
			this.validate("sector");
			this.fetchSubsectors(code);
		},

		onSubsectorSelect({ code }) {
			this.formModel.assistanceType = [];
			this.formModel.targetType = [];
			this.validate("subsector");
			this.fetchAssistanceTypes(code);
		},

		onAssistanceTypeSelect({ code }) {
			this.formModel.targetType = [];
			this.validate("assistanceType");
			this.fetchTargetTypes(code);
		},

		async onTargetTypeSelect(targetType) {
			const isLocationInvalid = this.$refs.locationForm.submitLocationForm();

			if (isLocationInvalid) {
				this.formModel.targetType = [];
			} else {
				this.validate("targetType");
				this.$emit("onTargetSelect", targetType);
				await this.showComponents();
				this.$emit("updatedData", this.formModel);
			}
		},

		async showComponents() {
			const components = await this.getComponentsToShow();
			this.$emit("showComponent", components);
		},

		async getComponentsToShow() {
			if (!(this.formModel.assistanceType && this.formModel.targetType)) return [];
			const {
				assistanceType: { code: assistanceType },
				targetType: { code: targetType },
			} = this.formModel;

			if (assistanceType === ASSISTANCE.TYPE.DISTRIBUTION) {
				switch (targetType) {
					case ASSISTANCE.TARGET.INDIVIDUAL:
						return [
							ASSISTANCE.COMPONENT.SELECTION_CRITERIA,
							ASSISTANCE.COMPONENT.DISTRIBUTED_COMMODITY,
						];
					case ASSISTANCE.TARGET.HOUSEHOLD:
						return [
							ASSISTANCE.COMPONENT.SELECTION_CRITERIA,
							ASSISTANCE.COMPONENT.DISTRIBUTED_COMMODITY,
						];
					case ASSISTANCE.TARGET.COMMUNITY:
						return [
							ASSISTANCE.COMPONENT.DISTRIBUTED_COMMODITY,
							ASSISTANCE.COMPONENT.COMMUNITIES,
						];
					case ASSISTANCE.TARGET.INSTITUTION:
						return [
							ASSISTANCE.COMPONENT.DISTRIBUTED_COMMODITY,
							ASSISTANCE.COMPONENT.INSTITUTIONS,
						];
					default:
						return [];
				}
			} else if (assistanceType === ASSISTANCE.TYPE.ACTIVITY) {
				switch (targetType) {
					case ASSISTANCE.TARGET.INDIVIDUAL:
						return [
							ASSISTANCE.COMPONENT.SELECTION_CRITERIA,
							ASSISTANCE.COMPONENT.ACTIVITY_DESCRIPTION,
						];
					case ASSISTANCE.TARGET.HOUSEHOLD:
						return [
							ASSISTANCE.COMPONENT.SELECTION_CRITERIA,
							ASSISTANCE.COMPONENT.ACTIVITY_DESCRIPTION,
						];
					case ASSISTANCE.TARGET.COMMUNITY:
						return [
							ASSISTANCE.COMPONENT.ACTIVITY_DESCRIPTION,
							ASSISTANCE.COMPONENT.HOUSEHOLD_TARGETED,
							ASSISTANCE.COMPONENT.INDIVIDUALS_TARGETED,
							ASSISTANCE.COMPONENT.COMMUNITIES,
						];
					case ASSISTANCE.TARGET.INSTITUTION:
						return [
							ASSISTANCE.COMPONENT.ACTIVITY_DESCRIPTION,
							ASSISTANCE.COMPONENT.HOUSEHOLD_TARGETED,
							ASSISTANCE.COMPONENT.INDIVIDUALS_TARGETED,
							ASSISTANCE.COMPONENT.INSTITUTIONS,
						];
					default:
						return [];
				}
			}
			return [];
		},

		async fetchSectors() {
			const { projectId } = this.$route.params;

			await SectorsService.getListOfProjectSectors(projectId)
				.then(({ data }) => {
					this.options.sectors = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Sectors")} ${e}`, "is-danger");
				});
			this.loading.sectors = false;
		},

		async fetchSubsectors(code) {
			const { projectId } = this.$route.params;

			try {
				this.loading.subsectors = true;
				const { data: { data } } = await SectorsService.getListOfProjectSubSectors(projectId, code);

				this.options.subsectors = data;
			} catch (e) {
				if (e.message) Notification(`${this.$t("Subsectors")} ${e}`, "is-danger");
			} finally {
				this.loading.subsectors = false;
			}
		},

		async fetchAssistanceTypes(code) {
			this.loading.assistanceTypes = true;
			await AssistancesService.getAssistanceTypes(code)
				.then(({ data }) => {
					this.options.assistanceTypes = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Assistance Types")} ${e}`, "is-danger");
				});
			this.loading.assistanceTypes = false;
		},

		async fetchTargetTypes(code) {
			this.loading.targetTypes = true;
			await AssistancesService.getTargetTypes(code)
				.then(({ data }) => {
					this.options.targetTypes = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Target Types")} ${e}`, "is-danger");
				});
			this.loading.targetTypes = false;
		},

		valuesForAssistanceName() {
			const {
				adm1,
				adm2,
				adm3,
				adm4,
				dateOfAssistance,
				round,
			} = this.formModel;

			this.dataForAssistanceName = {
				adm1,
				adm2,
				adm3,
				adm4,
				dateOfAssistance,
				round,
			};
		},

		defaultDateOfAssistance() {
			this.formModel.dateOfAssistance = this.minDateOfAssistance >= new Date()
				? this.minDateOfAssistance
				: new Date();
		},

		prepareDataFromProjectTargets() {
			if (!this.project.targets?.length) {
				return;
			}

			this.project.targets.forEach((target) => {
				const { activity, budgetLine } = target;

				if (activity) {
					this.options.activities.push({
						code: activity, value: activity,
					});
				}

				if (budgetLine) {
					this.options.budgetLines.push({
						code: budgetLine, value: budgetLine,
					});
				}
			});

			this.options.activities = getUniqueObjectsInArray(this.options.activities, "code");
			this.options.budgetLines = getUniqueObjectsInArray(this.options.budgetLines, "code");
		},
	},
};
</script>
