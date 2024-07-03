<template>
	<h2 class="text-h6 mt-5 font-weight-bold">{{ $t('Basic properties') }}</h2>

	<v-card class="mx-auto mt-5">
		<v-card-text>
			<AssistanceName
				v-model="formModel.name"
				ref="assistanceName"
				:is-assistance-duplicated="newAssistanceForm !== null"
				:data-before-duplicated="dataBeforeDuplicated"
				:data-for-assistance-name="dataForAssistanceName"
			/>

			<LocationForm
				ref="locationForm"
				:form-model="formModel"
				@mapped="onUpdateData"
				@locationChanged="onValuesForAssistanceName"
			/>

			<DatePicker
				v-model="formModel.dateOfAssistance"
				:max-date="maxDateOfAssistance"
				:min-date="minDateOfAssistance"
				:hint="isDateOfAssistanceInvalidMsg"
				label="Date of Assistance"
				name="date-of-assistance"
				class="has-warning-message mb-4"
				persistent-hint
				@update:modelValue="onUpdateData"
			/>

			<DataSelect
				v-model="formModel.round"
				:items="options.rounds"
				label="Round"
				name="round"
				class="mb-4"
				@update:modelValue="onUpdateData(false)"
			/>

			<DataInput
				v-model="formModel.eloNumber"
				label="ELO number"
				name="elo-number"
				class="mb-4"
				@input="onUpdateData(false)"
			/>

			<div class="mb-4">
				<DataInput
					v-if="!options.activities.length"
					v-model="formModel.activity"
					label="Activity"
					name="activity"
					@input="onUpdateData(false)"
				/>

				<DataSelect
					v-else
					v-model="formModel.activity"
					:items="options.activities"
					:hint="validationMessages.activity"
					label="Activity"
					name="activity"
					class="has-warning-message"
					persistent-hint
					optional
					@update:modelValue="onUpdateData(false)"
				/>
			</div>

			<div>
				<DataInput
					v-if="!options.budgetLines.length"
					v-model="formModel.budgetLine"
					label="Budget line"
					name="budget-line"
					@input="onUpdateData(false)"
				/>

				<DataSelect
					v-else
					v-model="formModel.budgetLine"
					:items="options.budgetLines"
					:hint="validationMessages.budgetLine"
					label="Budget line"
					name="budget-line"
					class="has-warning-message"
					persistent-hint
					optional
					@update:modelValue="onUpdateData(false)"
				/>
			</div>
		</v-card-text>
	</v-card>

	<h2 class="text-h6 mt-5 font-weight-bold">{{ $t('Target') }}</h2>

	<v-card class="mx-auto mt-5">
		<v-card-text>
			<DataSelect
				v-model="formModel.sector"
				:items="options.sectors"
				:loading="loading.isSectors"
				:error-messages="validationMsg('sector')"
				:hint="sectorValidationMessage"
				label="Sector"
				name="sector"
				class="has-warning-message mb-4 "
				persistent-hint
				@click:clear="resetTargetInputs('sector')"
				@update:modelValue="onSectorSelect"
			/>

			<DataSelect
				v-model="formModel.subsector"
				:items="options.subsectors"
				:loading="loading.isSubsectors"
				:error-messages="validationMsg('subsector')"
				:hint="subsectorValidationMessage"
				label="Subsector"
				name="sub-sector"
				class="has-warning-message mb-4"
				persistent-hint
				@click:clear="resetTargetInputs('subSector')"
				@update:modelValue="onSubsectorSelect"
			/>

			<DataSelect
				v-model="formModel.assistanceType"
				:items="options.assistanceTypes"
				:loading="loading.isAssistanceTypes"
				:error-messages="validationMsg('assistanceType')"
				label="Assistance Type"
				name="assistance-type"
				class="mb-4"
				@click:clear="resetTargetInputs('assistanceType')"
				@update:modelValue="onAssistanceTypeSelect"
			/>

			<DataSelect
				v-model="formModel.targetType"
				:items="options.targetTypes"
				:loading="loading.isTargetTypes"
				:error-messages="validationMsg('targetType')"
				label="Target Type"
				name="target-type"
				@update:modelValue="onTargetTypeSelect"
			/>
		</v-card-text>
	</v-card>

	<v-card class="mx-auto mt-10">
		<v-card-text>
			<DataTextarea
				v-model.trim="formModel.note"
				label="Note"
				name="note"
				auto-grow
				@blur="onUpdateData(false)"
			/>
		</v-card-text>
	</v-card>

</template>

<script>
import { required } from "@vuelidate/validators";
import AssistancesService from "@/services/AssistancesService";
import SectorsService from "@/services/SectorsService";
import AssistanceName from "@/components/Assistance/AssistanceName";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DataTextarea from "@/components/Inputs/DataTextarea";
import DatePicker from "@/components/Inputs/DatePicker";
import LocationForm from "@/components/Inputs/LocationForm";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { normalizeSelectorValue, normalizeText } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { getUniqueObjectsInArray, isDateBeforeOrEqual } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";

export default {
	name: "NewAssistanceForm",

	components: {
		LocationForm,
		AssistanceName,
		DatePicker,
		DataSelect,
		DataInput,
		DataTextarea,
	},

	emits: [
		"updatedData",
		"targetSelect",
		"showComponent",
	],

	mixins: [validation],

	validations() {
		return {
			formModel: {
				name: { required },
				dateOfAssistance: { required },
				sector: { required },
				subsector: { required },
				targetType: { required },
				assistanceType: { required },
			},
		};
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

		isCommoditySmartCard: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			dataForAssistanceName: {},
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
				isDateOfAssistanceValid: true,
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
				isSectors: true,
				isSubsectors: false,
				isAssistanceTypes: false,
				isTargetTypes: false,
			},
			sectorValidationMessage: "",
			subsectorValidationMessage: "",
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
			return !this.formModel.isDateOfAssistanceValid
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

		project(data) {
			if (data) {
				this.prepareDataFromProjectTargets();
			}
		},

		assistanceDates() {
			this.validateAssistanceDate();
		},

		isCommoditySmartCard() {
			this.validateAssistanceDate();
		},

		"formModel.targetType": function targetType() {
			this.showComponents();
		},

		"formModel.name": function targetType() {
			this.$emit("updatedData", this.formModel);
		},
	},

	async mounted() {
		await this.fetchSectors();
		this.defaultDateOfAssistance();
	},

	updated() {
		this.$emit("updatedData", this.formModel);
	},

	methods: {
		async mapTargets() {
			const {
				sector,
				subsector,
				assistanceType,
				targetType,
			} = this.formModel;

			if (sector && typeof sector !== "object") {
				this.formModel.sector = getArrayOfCodeListByKey(
					[sector],
					this.options.sectors,
					"code",
				);
				await this.fetchSubsectors(sector);
			}

			if (subsector && typeof subsector !== "object") {
				this.formModel.subsector = getArrayOfCodeListByKey(
					[subsector],
					this.options.subsectors,
					"code",
				);
			}

			await this.fetchAssistanceTypes(subsector);

			if (assistanceType && typeof assistanceType !== "object") {
				this.formModel.assistanceType = getArrayOfCodeListByKey(
					[assistanceType],
					this.options.assistanceTypes,
					"code",
				);
				await this.fetchTargetTypes(assistanceType);
			}

			if (targetType && typeof targetType !== "object") {
				this.formModel.targetType = getArrayOfCodeListByKey(
					[targetType],
					this.options.targetTypes,
					"code",
				);
			}

			this.validateSectorAndSubSector(sector, subsector);

			if (!this.sectorValidationMessage.length && !this.subsectorValidationMessage.length) {
				await this.showComponents();
			}

			this.$emit("updatedData", this.formModel);
		},

		isFormValid() {
			this.v$.$touch();

			const invalidLocationForm = this.$refs.locationForm.submitLocationForm();
			const invalidAssistanceName = this.$refs.assistanceName.onIsValid();

			return !this.v$.$invalid
				|| (!this.v$.$invalid && !invalidLocationForm && !invalidAssistanceName);
		},

		async onUpdateData() {
			this.onValuesForAssistanceName();
			await this.$nextTick();
			this.$emit("updatedData", this.formModel);
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

		async onSectorSelect(sector) {
			this.resetTargetInputs("sector");
			this.onValidate("sector");

			if (!sector?.code) return;

			await this.fetchSubsectors(sector.code);
			this.sectorValidationMessage = "";
		},

		async onSubsectorSelect(subSector) {
			this.resetTargetInputs("subSector");
			this.onValidate("subsector");

			if (!subSector?.code) return;

			await this.fetchAssistanceTypes(subSector.code);
			this.subsectorValidationMessage = "";
		},

		async onAssistanceTypeSelect(assistanceType) {
			this.resetTargetInputs("assistanceType");
			this.onValidate("assistanceType");

			if (!assistanceType?.code) return;

			await this.fetchTargetTypes(assistanceType.code);
		},

		async onTargetTypeSelect(targetType) {
			const isLocationInvalid = this.$refs.locationForm.submitLocationForm();

			if (isLocationInvalid) {
				this.formModel.targetType = [];
			} else {
				this.onValidate("targetType");
				this.$emit("targetSelect", targetType);
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

			try {
				const {
					data: { data },
					status,
					message,
				} = await SectorsService.getListOfProjectSectors(projectId);

				checkResponseStatus(status, message);

				this.options.sectors = data;
			} catch (e) {
				Notification(`${this.$t("Sectors")}: ${e.message || e}`, "error");
			} finally {
				this.loading.isSectors = false;
			}
		},

		async fetchSubsectors(code) {
			const { projectId } = this.$route.params;

			try {
				this.loading.isSubsectors = true;

				const {
					data: { data },
					status,
					message,
				} = await SectorsService.getListOfProjectSubSectors({
					projectId,
					code,
				});

				checkResponseStatus(status, message);

				this.options.subsectors = data;
			} catch (e) {
				Notification(`${this.$t("Subsectors")}: ${e.message || e}`, "error");
			} finally {
				this.loading.isSubsectors = false;
			}
		},

		async fetchAssistanceTypes(code) {
			try {
				this.loading.isAssistanceTypes = true;

				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getAssistanceTypes({
					subsector: code,
				});

				checkResponseStatus(status, message);

				this.options.assistanceTypes = data.map((type) => ({
					...type,
					value: type.value.replace(/^\w/, (value) => value.toUpperCase()),
				}));
			} catch (e) {
				Notification(`${this.$t("Assistance Types")}: ${e.message || e}`, "error");
			} finally {
				this.loading.isAssistanceTypes = false;
			}
		},

		async fetchTargetTypes(code) {
			try {
				this.loading.isTargetTypes = true;

				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getTargetTypes({
					type: code,
				});

				checkResponseStatus(status, message);

				this.options.targetTypes = data;
			} catch (e) {
				Notification(`${this.$t("Target Types")}: ${e.message || e}`, "error");
			} finally {
				this.loading.isTargetTypes = false;
			}
		},

		onValuesForAssistanceName() {
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
			if (!this.project.targets?.length) return;

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

		validateSectorAndSubSector(sector, subsector) {
			if (!this.formModel.sector?.code) {
				this.sectorValidationMessage = `${this.$t("Sector: {sector} was removed, because this sector is not selectable.", { sector })}`;
			}

			if (!this.formModel.subsector?.code) {
				this.subsectorValidationMessage = `${this.$t("Subsector: {subSector} was removed, because this subsector is not selectable.", { subSector: normalizeText(subsector) })}`;
			}
		},

		validateAssistanceDate() {
			if (!this.isCommoditySmartCard) {
				this.formModel.isDateOfAssistanceValid = true;
			} else if (this.dateExpiration) {
				this.formModel.isDateOfAssistanceValid = isDateBeforeOrEqual(
					this.formModel.dateOfAssistance,
					this.dateExpiration,
				);
			}
		},

		resetTargetInputs(selectedInput) {
			switch (selectedInput) {
				case "sector":
					this.formModel.subsector = [];
					this.formModel.assistanceType = [];
					this.formModel.targetType = [];

					break;
				case "subSector":
					this.formModel.assistanceType = [];
					this.formModel.targetType = [];
					break;
				case "assistanceType":

					this.formModel.targetType = [];
					break;
				default:

					break;
			}
		},
	},
};
</script>
