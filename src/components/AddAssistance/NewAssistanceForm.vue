<template>
	<div>
		<h3 class="title is-4">{{ $t('Location and Date') }}</h3>
		<div class="box">
			<LocationForm
				ref="locationForm"
				:form-model="formModel"
				@mapped="$emit('updatedData', formModel)"
			/>
			<b-field class="mt-2" :label="$t('Date of Assistance')">
				<b-datepicker
					v-model="formModel.dateOfAssistance"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					:max-date="maxDateOfAssistance"
					:placeholder="$t('Click to select')"
				/>
			</b-field>

			<b-field :label="$t('Expiration Date')">
				<b-datepicker
					v-model="formModel.dateExpiration"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					:min-date="formModel.dateOfAssistance"
					:max-date="maxDateOfAssistance"
					:placeholder="$t('Click to select')"
				/>
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
					:loading="loading.sectors"
					:options="options.sectors"
					:class="validateMultiselect('sector')"
					@select="onSectorSelect"
				>
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
					:loading="loading.subsectors"
					:options="options.subsectors"
					:class="validateMultiselect('subsector')"
					@select="onSubsectorSelect"
				>
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
				:label="$t('Assistance Type')"
				:type="validateType('assistanceType')"
				:message="validateMsg('assistanceType')"
			>
				<MultiSelect
					v-model="formModel.assistanceType"
					searchable
					:placeholder="$t('Click to select')"
					:loading="loading.assistanceTypes"
					:options="options.assistanceTypes"
					:class="validateMultiselect('assistanceType')"
					@select="onAssistanceTypeSelect"
				>
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
					:loading="loading.targetTypes"
					:options="options.targetTypes"
					:class="validateMultiselect('targetType')"
					@input="onTargetTypeSelect"
				>
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
	</div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import LocationForm from "@/components/LocationForm";
import SectorsService from "@/services/SectorsService";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import Validation from "@/mixins/validation";
import { normalizeText } from "@/utils/datagrid";
import consts from "@/utils/assistanceConst";
import { getArrayOfCodeListByKey } from "@/utils/codeList";

export default {
	name: "NewAssistanceForm",

	components: { LocationForm },

	mixins: [Validation],

	props: {
		project: {
			type: Object,
			default: () => {},
		},
	},

	data() {
		return {
			formModel: {
				adm1Id: null,
				adm2Id: null,
				adm3Id: null,
				adm4Id: null,
				locationId: null,
				dateOfAssistance: new Date(),
				dateExpiration: new Date(),
				sector: null,
				subsector: null,
				targetType: null,
				assistanceType: null,
			},
			options: {
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
			dateOfAssistance: { required },
			dateExpiration: { required },
			sector: { required },
			subsector: { required },
			targetType: { required },
			assistanceType: { required },
		},
	},

	watch: {
		async formModel() {
			await this.mapTargets();
		},
	},

	async mounted() {
		await this.fetchSectors();
	},

	updated() {
		this.$emit("updatedData", this.formModel);
	},

	computed: {
		maxDateOfAssistance() {
			const { endDate } = this.project;
			return new Date(endDate);
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
			return !this.$v.$invalid || (!this.$v.$invalid && !invalidLocationForm);
		},

		normalizeText(text) {
			return normalizeText(String(text));
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
				targetType: { value: targetType },
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
			this.loading.subsectors = true;
			await SectorsService.getListOfSubSectors(code)
				.then(({ data }) => {
					this.options.subsectors = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Subsectors")} ${e}`, "is-danger");
				});
			this.loading.subsectors = false;
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
	},
};
</script>
