<template>
	<div>
		<h1 class="title">New Assistance</h1>

		<h2 class="subtitle">Location and Date</h2>
		<div class="box">
			<LocationForm
				ref="locationForm"
				:form-model="formModel"
			/>
			<b-field label="Date of Assistance">
				<b-datepicker
					v-model="formModel.dateOfAssistance"
					show-week-number
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus
				/>
			</b-field>
		</div>

		<h2 class="subtitle">Target</h2>
		<div class="box">
			<b-field
				label="Sector"
				:type="validateType('sector')"
				:message="validateMsg('sector')"
			>
				<MultiSelect
					v-model="formModel.sector"
					searchable
					label="value"
					track-by="code"
					placeholder="Click to select..."
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
				label="Subsector"
				:type="validateType('subsector')"
				:message="validateMsg('subsector')"
			>
				<MultiSelect
					v-model="formModel.subsector"
					searchable
					label="value"
					track-by="code"
					placeholder="Click to select..."
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
				label="Assistance Type"
				:type="validateType('assistanceType')"
				:message="validateMsg('assistanceType')"
			>
				<MultiSelect
					v-model="formModel.assistanceType"
					searchable
					placeholder="Click to select..."
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
				label="Target Type"
				:type="validateType('targetType')"
				:message="validateMsg('targetType')"
			>
				<MultiSelect
					v-model="formModel.targetType"
					searchable
					label="value"
					track-by="code"
					placeholder="Click to select..."
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

	data() {
		return {
			formModel: {
				adm1Id: null,
				adm2Id: null,
				adm3Id: null,
				adm4Id: null,
				dateOfAssistance: new Date(),
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
			sector: { required },
			subsector: { required },
			targetType: { required },
			assistanceType: { required },
		},
	},

	watch: {
		formModel: "mapTargets",
	},

	async mounted() {
		await this.fetchSectors();
		await this.mapTargets();
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
			const { adm1Id, adm2Id, adm3Id, adm4Id } = this.formModel;

			let locationId = null;

			if (adm4Id) {
				locationId = adm4Id.locationId;
			} else if (adm3Id) {
				locationId = adm3Id.locationId;
			} else if (adm2Id) {
				locationId = adm2Id.locationId;
			} else if (adm1Id) {
				locationId = adm1Id.locationId;
			}

			return locationId;
		},

		onSectorSelect({ code }) {
			this.formModel.subsector = [];
			this.formModel.assistanceType = [];
			this.formModel.targetType = [];
			this.validate("sector");
			this.fetchSubsectors(code);
		},

		onSubsectorSelect() {
			this.formModel.assistanceType = [];
			this.formModel.targetType = [];
			this.validate("subsector");
			this.fetchAssistanceTypes();
		},

		onAssistanceTypeSelect() {
			this.formModel.targetType = [];
			this.validate("assistanceType");
			this.fetchTargetTypes();
		},

		onTargetTypeSelect(targetType) {
			this.validate("targetType");
			this.$emit("onTargetSelect", targetType);
			this.showComponents();
		},

		async showComponents() {
			const components = await this.getComponentsToShow();
			this.$emit("showComponent", components);
		},

		async getComponentsToShow() {
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
			await SectorsService.getListOfSectors()
				.then(({ data }) => {
					this.options.sectors = data;
				})
				.catch((e) => {
					Notification(`Sectors ${e}`, "is-danger");
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
					Notification(`Subsectors ${e}`, "is-danger");
				});
			this.loading.subsectors = false;
		},

		async fetchAssistanceTypes() {
			this.loading.assistanceTypes = true;
			await AssistancesService.getAssistanceTypes()
				.then(({ data }) => {
					this.options.assistanceTypes = data;
				})
				.catch((e) => {
					Notification(`Assistance Types ${e}`, "is-danger");
				});
			this.loading.assistanceTypes = false;
		},

		async fetchTargetTypes() {
			this.loading.targetTypes = true;
			await AssistancesService.getTargetTypes()
				.then(({ data }) => {
					this.options.targetTypes = data;
				})
				.catch((e) => {
					Notification(`Target Types ${e}`, "is-danger");
				});
			this.loading.targetTypes = false;
		},
	},
};
</script>
