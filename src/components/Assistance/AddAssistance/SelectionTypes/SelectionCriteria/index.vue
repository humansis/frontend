<template>
	<div class="d-flex align-baseline justify-space-between">
		<h2 class="text-h6 mt-5 font-weight-bold">{{ $t('Selection Criteria') }}</h2>

		<v-btn
			color="primary"
			prepend-icon="plus"
			class="text-none"
			@click="onAddCriteria()"
		>
			{{ $t('Add Group') }}
		</v-btn>
	</div>

	<v-alert
		v-if="!groups.length"
		variant="outlined"
		type="warning"
		border="top"
		class="mt-5"
	>
		{{ $t('There Are No Criteria Groups') }}.
		{{ $t('Please Add At Least One Criteria Group') }}.
	</v-alert>

	<Modal
		v-model="detailModal.isOpened"
		header="Selected Beneficiaries"
	>
		<BeneficiariesModalList :data="beneficiariesData" />
	</Modal>

	<Modal
		v-model="criteriaModal.isOpened"
		header="Create New Criteria"
	>
		<SelectionCriteriaForm
			ref="criteriaForm"
			:form-model="criteriaModel"
			:target-type="assistanceBody.target"
			submit-button-label="Create"
			close-button
			@formSubmitted="onSubmitCriteriaForm"
			@formClosed="criteriaModal.isOpened = false"
		/>
	</Modal>

	<SelectionCriteriaGroup
		v-for="(group, key) of groups"
		:data="group?.data"
		:beneficiaries-count="group?.beneficiaries?.totalCount"
		:key="key"
		:group-id="key"
		:target-type="selectedTargetType"
		:loading="isCalculationLoading"
		:is-assistance-duplicated="isAssistanceDuplicated"
		:custom-fields="customFields"
		@addCriteria="onAddCriteria"
		@updatedCriteria="onUpdatedCriteria"
		@removeGroup="onRemoveCriteriaGroup(key)"
		@showDetail="onShowBeneficiariesInGroup(key)"
	/>

	<v-row class="mt-6 align-center justify-end">
		<v-col cols="4">
			<DataSelect
				v-model="scoringType"
				:items="options.scoringTypes"
				:loading="isScoringTypesLoading"
				:disabled="isCalculationLoading || !groups.length"
				label="Scoring"
				name="scoring"
				item-title="identifier"
				item-value="id"
				@update:modelValue="onScoringTypeChanged"
			/>
		</v-col>

		<v-col cols="6">
			<DataInput
				v-model.number="minimumSelectionScore"
				:label="vulnerabilityScoreLabel"
				name="minimum-vulnerability-score"
				type="number"
				hide-spin-buttons
				@update:modelValue="onVulnerabilityScoreInput"
			/>
		</v-col>

		<v-col cols="2">
			<v-btn
				:disabled="isUpdateButtonEnabled"
				color="primary"
				class="text-none"
				variant="elevated"
				@click="onUpdateVulnerabilityScores"
			>
				{{ $t('Update') }}
			</v-btn>
		</v-col>
	</v-row>

	<v-row>
		<v-col class="d-flex align-center justify-end">
			<v-btn
				:disabled="isDetailsButtonDisabled"
				color="primary"
				class="text-none mr-3"
				variant="elevated"
				@click="onShowTotalBeneficiaries"
			>
				{{ $t('Details') }}
			</v-btn>

			<ExportControl
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				:disabled="isExportButtonDisabled"
				@export="onExportSelectedBeneficiaries"
			/>
		</v-col>
	</v-row>

	<template v-if="!isCalculatedDataLoading && !isBeneficiariesCountLoading">
		<div class="text-h6 text-right mt-4">
			<strong>
				{{ countOf }}/{{ totalCount }}
			</strong>

			{{ $t(selectedTargetType) }}
		</div>
	</template>

	<template v-else>
		<Loading custom-class="text-right mt-4 mr-12" is-small />
	</template>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesModalList from "@/components/Assistance/AddAssistance/SelectionTypes/SelectionCriteria/BeneficiariesModalList";
import SelectionCriteriaForm from "@/components/Assistance/AddAssistance/SelectionTypes/SelectionCriteria/SelectionCriteriaForm";
import SelectionCriteriaGroup from "@/components/Assistance/AddAssistance/SelectionTypes/SelectionCriteria/SelectionCriteriaGroup";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import ExportControl from "@/components/Inputs/ExportControl";
import Modal from "@/components/Inputs/Modal";
import Loading from "@/components/Loading";
import { normalizeExportDate } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { ASSISTANCE, EXPORT } from "@/consts";

export default {
	name: "SelectionCriteria",

	components: {
		BeneficiariesModalList,
		SelectionCriteriaGroup,
		Modal,
		SelectionCriteriaForm,
		DataSelect,
		DataInput,
		ExportControl,
		Loading,
	},

	emits: [
		"updatedData",
		"beneficiariesCounted",
		"calculatedCommodities",
	],

	props: {
		targetType: {
			type: String,
			default: "",
		},

		assistanceBody: {
			type: Object,
			required: true,
		},

		data: {
			type: Array,
			default: null,
		},

		customFields: {
			type: Array,
			default: () => [],
		},

		isAssistanceDuplicated: {
			type: Boolean,
			default: false,
		},

		isCommoditiesCreated: {
			type: Boolean,
			default: false,
		},

		isCalculatedDataLoading: {
			type: Boolean,
			default: false,
		},

		calculatedBeneficiaries: {
			type: Object,
			default: () => {},
		},
	},

	data() {
		return {
			exportControl: {
				loading: false,
				location: "vulnerabilityScores",
				types: [EXPORT.VULNERABILITY_SCORES],
				formats: [EXPORT.FORMAT_XLSX],
			},
			criteriaModal: {
				isOpened: false,
			},
			criteriaModel: {
				criteriaTarget: null,
				criteria: null,
				condition: null,
				value: null,
				scoreWeight: 1,
				count: 0,
			},
			groups: [],
			detailModal: {
				isOpened: false,
			},
			options: {
				scoringTypes: [AssistancesService.getDefaultScoringType()],
			},
			filters: { enabled: true },
			minimumSelectionScore: null,
			scoringType: AssistancesService.getDefaultScoringType(),
			isScoringTypesLoading: false,
			isBeneficiariesCountLoading: false,
			beneficiariesData: [],
			totalBeneficiariesData: [],
			countOf: 0,
			totalCount: 0,
			isCalculationLoading: false,
			isVulnerabilityScoreTouched: false,
		};
	},

	computed: {
		selectedTargetType() {
			let result = this.targetType;

			if (typeof result !== "string") return "";

			if (this.targetType === "household") {
				result = this.countOf === 1 ? "household" : "households";
			}

			if (this.targetType === "individual") {
				result = this.countOf === 1 ? "individual" : "individuals";
			}

			return result.charAt(0).toUpperCase() + result.slice(1);
		},

		vulnerabilityScoreLabel() {
			return this.$t("Minimum Vulnerability Score");
		},

		isExportButtonDisabled() {
			return this.isVulnerabilityScoreTouched
				|| this.isCalculationLoading
				|| !this.groups.length
				|| !this.totalCount;
		},

		isMinVulnerabilityScoreFloat() {
			return Number(this.minimumSelectionScore) === this.minimumSelectionScore
				&& this.minimumSelectionScore % 1 !== 0;
		},

		isUpdateButtonEnabled() {
			return this.isCalculationLoading
				|| !this.groups.length
				|| this.isMinVulnerabilityScoreFloat;
		},

		isDetailsButtonDisabled() {
			return this.isVulnerabilityScoreTouched
				|| this.isCalculationLoading
				|| !this.groups.length;
		},
	},

	watch: {
		groups: {
			deep: true,
			handler(groups) {
				if (!groups.length) {
					this.minimumSelectionScore = null;
					this.totalCount = 0;
					this.countOf = 0;
				}
			},
		},

		calculatedBeneficiaries: {
			deep: true,
			handler(value) {
				this.totalCount = value.totalCount;
				this.countOf = value.selectedCount;
			},
		},

		data(data) {
			if (data) {
				this.groups = data;

				if (this.isAssistanceDuplicated) {
					this.updateComponentsData();
				}
			}
		},
	},

	async created() {
		await this.fetchScoringTypes();
	},

	methods: {
		async fetchCriteriaInfo() {
			this.isCalculationLoading = true;

			this.updateComponentsData();

			await this.getCountOfBeneficiaries();

			this.$emit("beneficiariesCounted", this.countOf);
			this.isCalculationLoading = false;
		},

		async onUpdateVulnerabilityScores() {
			if (this.isCalculationLoading || !this.groups.length) return;

			await this.fetchCriteriaInfo();
		},

		async getCountOfBeneficiaries() {
			const threshold = this.minimumSelectionScore ?? null;
			const assistanceBody = { ...this.assistanceBody };

			assistanceBody.selectionCriteria = [...this.prepareCriteria()];

			if (typeof threshold === "string") {
				assistanceBody.threshold = null;
			} else {
				assistanceBody.threshold = threshold;
			}

			if (assistanceBody.selectionCriteria?.length) {
				await this.calculationOfAssistanceBeneficiaries(assistanceBody);
			}
		},

		async calculationOfAssistanceBeneficiaries(assistanceBody) {
			const { dateExpiration, ...beneficiariesBody } = assistanceBody;

			if (this.assistanceBodyIsValid(assistanceBody)) {
				try {
					this.isBeneficiariesCountLoading = true;
					this.$emit("updateDataLoadingState", this.isBeneficiariesCountLoading);

					const {
						data: { groupEligibleIndividuals, selectedCount, totalCount, commodities },
						status,
						message,
					} = await AssistancesService.assistancePrecalculate(beneficiariesBody);

					checkResponseStatus(status, message);

					this.totalCount = totalCount;
					this.countOf = selectedCount;

					if (this.isCommoditiesCreated) {
						this.$emit("calculatedCommodities", commodities);
					}

					this.prepareDataForBeneficiariesModal(groupEligibleIndividuals);
				} catch (e) {
					Notification(`${this.$t("Precalculate")}: ${e.message || e}`, "error");
				} finally {
					this.isBeneficiariesCountLoading = false;
					this.$emit("updateDataLoadingState", this.isBeneficiariesCountLoading);
				}
			}
		},

		async fetchScoringTypes() {
			try {
				this.isScoringTypesLoading = true;

				const {
					data: { data },
					status,
					message,
				} = await AssistancesService.getScoringTypes(
					null,
					null,
					this.filters,
				);

				checkResponseStatus(status, message);

				data.forEach((item) => {
					this.options.scoringTypes.push({
						...item,
						identifier: `${item.name} (ID: ${item.id})`,
					});
				});
			} catch (e) {
				Notification(`${this.$t("Scoring Types")}: ${e.message || e}`, "error");
			} finally {
				this.scoringType = this.options.scoringTypes?.[0] || null;
				this.isScoringTypesLoading = false;
			}
		},

		async onScoringTypeChanged() {
			await this.fetchCriteriaInfo();
		},

		async onRemoveCriteriaGroup(groupKey) {
			this.groups.splice(groupKey, 1);

			await this.getCountOfBeneficiaries();

			this.selectionCriteriaUpdate();
		},

		async onUpdatedCriteria({ groupKey }) {
			if (this.groups[groupKey].data?.length === 0) {
				this.groups.splice(groupKey, 1);
			}

			await this.getCountOfBeneficiaries();

			this.selectionCriteriaUpdate();
		},

		async onExportSelectedBeneficiaries(exportType, format) {
			if (exportType === EXPORT.VULNERABILITY_SCORES) {
				try {
					this.exportControl.loading = true;

					const filename = `Vulnerability scores ${normalizeExportDate()}`;
					const {
						data,
						status,
						message,
					} = await AssistancesService.exportVulnerabilityScores({
						body: this.assistanceBody,
						format,
					});

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Projects")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},

		prepareCriteria() {
			const selectionCriteria = [];

			this.groups.forEach(({ data }, index) => {
				data.forEach(({ condition, scoreWeight, value, criteriaTarget, criteria }) => {
					const fieldType = criteria.type || criteria.code;

					selectionCriteria.push({
						group: Number(index),
						target: criteriaTarget.code,
						field: criteria.code,
						condition: condition.code,
						value: this.prepareCriteriaValue(value, fieldType),
						weight: scoreWeight,
					});
				});
			});

			return selectionCriteria;
		},

		prepareCriteriaValue(value, dataType) {
			if (value === null || value === undefined) {
				return "";
			}

			let newValue = value.code || value;
			let result = null;

			if (value.code === false && dataType === ASSISTANCE.FIELD_TYPE.BOOLEAN) {
				newValue = false;
			}

			switch (dataType) {
				case ASSISTANCE.FIELD_TYPE.DATE:
					result = this.$moment(newValue).format("YYYY-MM-DD");

					break;
				case ASSISTANCE.FIELD_TYPE.LOCATION:
					result = (typeof newValue === "number")
						? newValue
						: Number(newValue.replace("locationId-", ""));

					break;
				case ASSISTANCE.FIELD_TYPE.GENDER:
				case ASSISTANCE.FIELD_TYPE.RESIDENCY_STATUS:
				case ASSISTANCE.FIELD_TYPE.LIVELIHOOD:
				case ASSISTANCE.FIELD_TYPE.INTEGER:
				case ASSISTANCE.FIELD_TYPE.DOUBLE:
				case ASSISTANCE.FIELD_TYPE.STRING:
				case ASSISTANCE.FIELD_TYPE.LOCATION_TYPE:
					result = String(newValue);

					break;
				default:
					result = newValue;
			}

			return result;
		},

		onAddCriteria(id) {
			this.criteriaModal.isOpened = true;

			this.criteriaModel = {
				criteriaTarget: null,
				criteria: null,
				condition: null,
				value: null,
				scoreWeight: 1,
				groupId: id,
				count: 0,
				data: [],
			};
		},

		updateComponentsData() {
			this.isVulnerabilityScoreTouched = false;

			this.$emit(
				"updatedData",
				this.prepareCriteria(),
				this.minimumSelectionScore,
				this.isVulnerabilityScoreTouched,
				this.scoringType,
			);
		},

		onSubmitCriteriaForm(criteriaForm) {
			if (criteriaForm.groupId !== undefined) {
				this.groups[criteriaForm.groupId].beneficiaries = [];
				this.groups[criteriaForm.groupId].data.push({ ...criteriaForm, newlyCreated: true });
			} else {
				const index = this.groups.push({ data: [] }) - 1;
				this.groups[index].beneficiaries = [];
				this.groups[index].data.push({ ...criteriaForm, newlyCreated: true });
			}

			this.criteriaModal.isOpened = false;

			this.fetchCriteriaInfo();
		},

		isSelectionCriteriaDataAvailable() {
			return !!this.groups.length;
		},

		onVulnerabilityScoreInput() {
			this.isVulnerabilityScoreTouched = true;
			this.totalCount = 0;
			this.countOf = 0;
		},

		prepareDataForBeneficiariesModal(groupData) {
			this.groups.forEach((group, key) => {
				this.groups[key].beneficiaries = groupData[key];
			});
		},

		assistanceBodyIsValid({ sector, subsector, target, type }) {
			return sector && subsector && target && type;
		},

		selectionCriteriaUpdate() {
			this.$emit(
				"updatedData",
				this.prepareCriteria(),
				this.minimumSelectionScore,
				this.isVulnerabilityScoreTouched || this.isCalculationLoading,
				this.scoringType,
			);

			this.$emit("beneficiariesCounted", this.countOf);
		},

		onShowBeneficiariesInGroup(key) {
			this.beneficiariesData = this.groups[key]?.beneficiaries.data;
			this.detailModal.isOpened = true;
		},

		onShowTotalBeneficiaries() {
			this.beneficiariesData = this.totalBeneficiariesData;
			this.detailModal.isOpened = true;
		},

		clearComponent() {
			this.groups = [];
			this.beneficiariesData = [];
			this.totalBeneficiariesData = [];
			this.countOf = 0;
			this.totalCount = 0;
			this.minimumSelectionScore = 0;
		},
	},
};
</script>
