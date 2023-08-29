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
		</div>

		<h3 class="title is-4">{{ $t('Target') }}</h3>
		<div class="box">
			<b-field
				:label="$t('Sector')"
				:type="validateType('sector')"
				:message="validateMsg('sector')"
			>
				<MultiSelect
					v-model="formModel.sector"
					searchable
					label="value"
					track-by="code"
					:placeholder="$t('Click to select')"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					:loading="loading.sectors"
					:options="options.sectors"
					:class="validateMultiselect('sector')"
					@select="onSectorSelect"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
					<template #option="props">
						<div class="option__desc">
							<span class="option__title">{{ normalizeSelectorValue(props.option.value) }}</span>
						</div>
					</template>
					<template #singleLabel="props">
						<div class="option__desc">
							<span class="option__title">{{ normalizeSelectorValue(props.option.value) }}</span>
						</div>
					</template>
				</MultiSelect>
			</b-field>
			<b-field
				:label="$t('Subsector')"
				:type="validateType('subsector')"
				:message="validateMsg('subsector')"
			>
				<MultiSelect
					v-model="formModel.subsector"
					searchable
					label="value"
					track-by="code"
					:placeholder="$t('Click to select')"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					:loading="loading.subsectors"
					:options="options.subsectors"
					:class="validateMultiselect('subsector')"
					@select="onSubsectorSelect"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
					<template #option="props">
						<div class="option__desc">
							<span class="option__title">{{ normalizeSelectorValue(props.option.value) }}</span>
						</div>
					</template>
					<template #singleLabel="props">
						<div class="option__desc">
							<span class="option__title">{{ normalizeSelectorValue(props.option.value) }}</span>
						</div>
					</template>
				</MultiSelect>
			</b-field>
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
import LocationForm from "@/components/LocationForm";
import SectorsService from "@/services/SectorsService";
import AssistancesService from "@/services/AssistancesService";
import AssistanceName from "@/components/Assistance/AssistanceName";
import { Notification } from "@/utils/UI";
import Validation from "@/mixins/validation";
import { normalizeText, normalizeSelectorValue } from "@/utils/datagrid";
import consts from "@/utils/assistanceConst";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import calendarHelper from "@/mixins/calendarHelper";

export default {
	name: "NewAssistanceForm",

	components: {
		LocationForm,
		AssistanceName,
	},

	mixins: [Validation, calendarHelper],

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
			},
			options: {
				rounds: consts.ROUNDS_OPTIONS,
				sectors: [],
				subsectors: [],
				assistanceTypes: [],
				targetTypes: [],
			},
			loading: {
				sectors: true,
				subsectors: false,
				assistanceTypes: false,
				targetTypes: false,
			},
		};
	},

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
	},

	updated() {
		this.$emit("updatedData", this.formModel);
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

			if (assistanceType === consts.TYPE.DISTRIBUTION) {
				switch (targetType) {
					case consts.TARGET.INDIVIDUAL:
						return [
							consts.COMPONENT.SELECTION_CRITERIA,
							consts.COMPONENT.DISTRIBUTED_COMMODITY,
						];
					case consts.TARGET.HOUSEHOLD:
						return [
							consts.COMPONENT.SELECTION_CRITERIA,
							consts.COMPONENT.DISTRIBUTED_COMMODITY,
						];
					case consts.TARGET.COMMUNITY:
						return [
							consts.COMPONENT.DISTRIBUTED_COMMODITY,
							consts.COMPONENT.COMMUNITIES,
						];
					case consts.TARGET.INSTITUTION:
						return [
							consts.COMPONENT.DISTRIBUTED_COMMODITY,
							consts.COMPONENT.INSTITUTIONS,
						];
					default:
						return [];
				}
			} else if (assistanceType === consts.TYPE.ACTIVITY) {
				switch (targetType) {
					case consts.TARGET.INDIVIDUAL:
						return [
							consts.COMPONENT.SELECTION_CRITERIA,
							consts.COMPONENT.ACTIVITY_DESCRIPTION,
						];
					case consts.TARGET.HOUSEHOLD:
						return [
							consts.COMPONENT.SELECTION_CRITERIA,
							consts.COMPONENT.ACTIVITY_DESCRIPTION,
						];
					case consts.TARGET.COMMUNITY:
						return [
							consts.COMPONENT.ACTIVITY_DESCRIPTION,
							consts.COMPONENT.HOUSEHOLD_TARGETED,
							consts.COMPONENT.INDIVIDUALS_TARGETED,
							consts.COMPONENT.COMMUNITIES,
						];
					case consts.TARGET.INSTITUTION:
						return [
							consts.COMPONENT.ACTIVITY_DESCRIPTION,
							consts.COMPONENT.HOUSEHOLD_TARGETED,
							consts.COMPONENT.INDIVIDUALS_TARGETED,
							consts.COMPONENT.INSTITUTIONS,
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
