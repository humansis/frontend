<template>
	<div class="new-assistance-form">
		<h3 class="title is-4">{{ $t('Basic properties') }}</h3>
		<div class="box">
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

			<b-field class="mt-2" :label="$t('Date of Assistance')">
				<b-datepicker
					v-model="formModel.dateOfAssistance"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					:max-date="maxDateOfAssistance"
					:min-date="minDateOfAssistance"
					:month-names="months()"
					:placeholder="$t('Click to select')"
					@input="valuesForAssistanceName"
				/>
				<p v-if="!isDateOfAssistanceValid" class="help is-danger">
					{{ $t("Date is after Expiration date of the commodity") }}
				</p>
			</b-field>

			<b-field
				:label="$t('Round')"
			>
				<MultiSelect
					v-model="formModel.round"
					searchable
					label="value"
					track-by="code"
					:placeholder="$t('N/A')"
					:options="options.rounds"
					@input="valuesForAssistanceName"
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

			<InputWithLabel
				v-model="formModel.eloNumber"
				name="elo-number"
				label="Elo number"
				optional
			/>

			<div class="mb-3">
				<InputWithLabel
					v-if="!options.activities.length"
					v-model="formModel.activity"
					name="activity"
					label="Activity"
					optional
				/>

				<MultiSelectWithLabel
					v-else
					v-model="formModel.activity"
					name="activity"
					label="Activity"
					optional
					:options="options.activities"
					:custom-error-message="validationMessages.activity"
				/>
			</div>

			<div>
				<InputWithLabel
					v-if="!options.budgetLines.length"
					v-model="formModel.budgetLine"
					name="budget-line"
					label="Budget line"
					optional
				/>

				<MultiSelectWithLabel
					v-else
					v-model="formModel.budgetLine"
					name="budget-line"
					label="Budget line"
					optional
					:options="options.budgetLines"
					:custom-error-message="validationMessages.budgetLine"
				/>
			</div>
		</div>

		<h3 class="title is-4">{{ $t('Target') }}</h3>

		<div class="box">
			<MultiSelectWithLabel
				v-model="formModel.sector"
				name="sector"
				label="Sector"
				validated-field-name="sector"
				:options="options.sectors"
				:loading="loading.sectors"
				:validation="getValidations"
				:custom-error-message="sectorValidationMessage"
				@select="onSectorSelect"
			/>

			<MultiSelectWithLabel
				v-model="formModel.subsector"
				name="subsector"
				label="Subsector"
				validated-field-name="subsector"
				:options="options.subsectors"
				:loading="loading.subsectors"
				:validation="getValidations"
				:custom-error-message="subsectorValidationMessage"
				@select="onSubsectorSelect"
			/>

			<b-field
				:label="$t('Assistance Type')"
				:type="validateType('assistanceType')"
				:message="validateMsg('assistanceType')"
			>
				<MultiSelect
					v-model="formModel.assistanceType"
					searchable
					:placeholder="$t('Click to select')"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					:loading="loading.assistanceTypes"
					:options="options.assistanceTypes"
					:class="validateMultiselect('assistanceType')"
					@select="onAssistanceTypeSelect"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
					<template #option="props">
						<div class="option__desc">
							<span class="option__title">{{ normalizeText(props.option.value) }}</span>
						</div>
					</template>
					<template #singleLabel="props">
						<div class="option__desc">
							<span class="option__title">{{ normalizeText(props.option.value) }}</span>
						</div>
					</template>
				</MultiSelect>
			</b-field>

			<b-field
				:label="$t('Target Type')"
				:type="validateType('targetType')"
				:message="validateMsg('targetType')"
			>
				<MultiSelect
					v-model="formModel.targetType"
					searchable
					label="value"
					track-by="code"
					:placeholder="$t('Click to select')"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					:loading="loading.targetTypes"
					:options="options.targetTypes"
					:class="validateMultiselect('targetType')"
					@input="onTargetTypeSelect"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
					<template #singleLabel="props">
						<div class="option__desc">
							<span class="option__title">{{ normalizeText(props.option.value) }}</span>
						</div>
					</template>
					<template #option="props">
						<div class="option__desc">
							<span class="option__title">{{ normalizeText(props.option.value) }}</span>
						</div>
					</template>
				</MultiSelect>
			</b-field>
		</div>

		<div class="box">
			<b-field
				:label="$t('Note')"
			>
				<b-input
					v-model.trim="formModel.note"
					type="textarea"
					:placeholder="$t('Type…')"
				/>
			</b-field>
		</div>
	</div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import AssistancesService from "@/services/AssistancesService";
import SectorsService from "@/services/SectorsService";
import AssistanceName from "@/components/Assistance/AssistanceName";
import InputWithLabel from "@/components/Inputs/InputWithLabel";
import MultiSelectWithLabel from "@/components/Inputs/MultiSelectWithLabel";
import LocationForm from "@/components/LocationForm";
import calendarHelper from "@/mixins/calendarHelper";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { normalizeSelectorValue, normalizeText } from "@/utils/datagrid";
import { getUniqueObjectsInArray } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";

export default {
	name: "NewAssistanceForm",

	components: {
		LocationForm,
		AssistanceName,
		InputWithLabel,
		MultiSelectWithLabel,
	},

	mixins: [validation, calendarHelper],

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
		}
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

			this.validateSectorAndSubSector(sector, subsector);

			if (!this.sectorValidationMessage.length && !this.subsectorValidationMessage.length) {
				await this.showComponents();
			}

			this.$emit("updatedData", this.formModel);
		},

		submit() {
			this.$v.$touch();
			const invalidLocationForm = this.$refs.locationForm.submitLocationForm();
			const invalidAssistanceName = this.$refs.assistanceName.isValid();
			return !this.$v.$invalid
				|| (!this.$v.$invalid && !invalidLocationForm && !invalidAssistanceName);
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

		async onSectorSelect({ code }) {
			this.formModel.subsector = [];
			this.formModel.assistanceType = [];
			this.formModel.targetType = [];
			this.validate("sector");
			await this.fetchSubsectors(code);
			this.sectorValidationMessage = "";
		},

		async onSubsectorSelect({ code }) {
			this.formModel.assistanceType = [];
			this.formModel.targetType = [];
			this.validate("subsector");
			await this.fetchAssistanceTypes(code);
			this.subsectorValidationMessage = "";
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
			if (!this.project.targets.length) {
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

		validateSectorAndSubSector(sector, subsector) {
			if (!this.formModel.sector?.code) {
				this.sectorValidationMessage = `${this.$t("Sector")}:
					${sector} ${this.$t("was removed, because this sector is not selectable.")}`;
			}

			if (!this.formModel.subsector?.code) {
				this.subsectorValidationMessage = `${this.$t("Subsector")}:
				 	${normalizeText(subsector)} ${this.$t("was removed, because this subsector is not selectable.")}`;
			}
		},
	},
};
</script>

<style lang="scss">
	.new-assistance-form {
		.name-input {
			width: 100%;
		}
	}
</style>
