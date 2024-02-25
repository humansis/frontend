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
		<BeneficiariesModalList
			close-button
			:data="beneficiariesData"
			:scores="beneficiariesScores"
		/>
	</Modal>

	<Modal
		v-model="criteriaModal.isOpened"
		header="Create New Criteria"
	>
		<SelectionCriteriaForm
			ref="criteriaForm"
			:form-model="criteriaModel"
			submit-button-label="Create"
			close-button
			@formSubmitted="onSubmitCriteriaForm"
			@formClosed="onCloseCriteriaModal"
		/>
	</Modal>

	<SelectionCriteriaGroup
		v-for="(group, key) of groups"
		:data="group?.data"
		:count="group?.tableData?.length"
		:key="key"
		:group-id="key"
		:target-type="selectedTargetType"
		:loading="calculationLoading"
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
				:loading="scoringTypesLoading"
				:disabled="calculationLoading || !groups.length"
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
				:disabled="vulnerabilityScoreTouched || calculationLoading || !groups.length"
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

	<div class="text-h6 text-right mt-4">
		<strong>
			{{ countOf }}/{{ totalCount }}
		</strong>

		{{ $t(selectedTargetType) }}
	</div>
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
	},

	emits: [
		"deliveredCommodityValue",
		"updatedData",
		"beneficiariesCounted",
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

		isAssistanceDuplicated: {
			type: Boolean,
			default: false,
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
			scoringTypesLoading: false,
			minimumSelectionScoreValid: null,
			beneficiariesData: [],
			beneficiariesScores: [],
			totalBeneficiariesData: [],
			countOf: 0,
			totalCount: 0,
			calculationLoading: false,
			vulnerabilityScoreTouched: false,
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
			return this.vulnerabilityScoreTouched
				|| this.calculationLoading
				|| !this.groups.length
				|| !this.totalCount;
		},

		isMinVulnerabilityScoreFloat() {
			return Number(this.minimumSelectionScore) === this.minimumSelectionScore
				&& this.minimumSelectionScore % 1 !== 0;
		},

		isUpdateButtonEnabled() {
			return this.calculationLoading
				|| !this.groups.length
				|| this.isMinVulnerabilityScoreFloat;
		},
	},

	watch: {
		groups(groups) {
			if (!groups.length) {
				this.minimumSelectionScore = null;
			}

			this.$emit("deliveredCommodityValue");
		},

		data(data) {
			if (data) {
				this.groups = data;

				if (this.isAssistanceDuplicated) {
					this.fetchCriteriaInfo();
				}
			}
		},
	},

	async created() {
		await this.fetchScoringTypes();
	},

	methods: {
		submit() {
			return !!this.groups.length;
		},

		async onExportSelectedBeneficiaries(exportType, format) {
			if (exportType === EXPORT.VULNERABILITY_SCORES) {
				try {
					this.exportControl.loading = true;

					const filename = `Vulnerability scores ${normalizeExportDate()}`;
					const { data, status, message } = await AssistancesService.exportVulnerabilityScores(
						format,
						this.assistanceBody,
					);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Projects")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},

		async onScoringTypeChanged() {
			await this.fetchCriteriaInfo();
		},

		prepareCriteria() {
			const selectionCriteria = [];

			this.groups.forEach(({ data }, index) => {
				data.forEach(({ condition, scoreWeight, value, criteriaTarget, criteria }) => {
					selectionCriteria.push({
						group: Number(index),
						target: criteriaTarget.code,
						field: criteria.code,
						condition: condition.code,
						value: this.prepareCriteriaValue(value, criteria.type),
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
					result = Number(newValue.replace("locationId-", ""));
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

		onCloseCriteriaModal() {
			this.criteriaModal.isOpened = false;
		},

		onSubmitCriteriaForm(criteriaForm) {
			if (criteriaForm.groupId !== undefined) {
				this.groups[criteriaForm.groupId].tableData = [];
				this.groups[criteriaForm.groupId].data.push(criteriaForm);
			} else {
				const index = this.groups.push({ data: [] }) - 1;
				this.groups[index].tableData = [];
				this.groups[index].data.push(criteriaForm);
			}

			this.criteriaModal.isOpened = false;

			this.fetchCriteriaInfo();
		},

		async fetchCriteriaInfo() {
			this.calculationLoading = true;
			this.groups.forEach((group, key) => {
				this.getCountOfBeneficiariesInGroup(key);
			});

			await this.getCountOfBeneficiaries({ totalCount: true });
			await this.getCountOfBeneficiaries({ totalCount: false });

			this.$emit(
				"updatedData",
				this.prepareCriteria(),
				this.minimumSelectionScore,
				this.vulnerabilityScoreTouched,
				this.scoringType,
			);

			this.$emit("beneficiariesCounted", this.countOf);
			this.$emit("deliveredCommodityValue");
			this.calculationLoading = false;
		},

		onVulnerabilityScoreInput() {
			this.vulnerabilityScoreTouched = true;
			this.totalCount = 0;
			this.countOf = 0;
		},

		async onUpdateVulnerabilityScores() {
			if (this.calculationLoading || !this.groups.length) return;

			await this.fetchCriteriaInfo();

			this.vulnerabilityScoreTouched = false;
		},

		async getCountOfBeneficiariesInGroup(groupKey) {
			const assistanceBody = { ...this.assistanceBody };
			const preparedCriteria = this.prepareCriteria();

			assistanceBody.selectionCriteria = preparedCriteria
				.filter(({ group }) => group === groupKey);
			assistanceBody.threshold = null;

			if (assistanceBody.selectionCriteria?.length) {
				await this.calculationOfAssistanceBeneficiaries({
					assistanceBody, totalCount: false, groupKey,
				});
			}
		},

		async getCountOfBeneficiaries({ totalCount = false }) {
			const threshold = this.minimumSelectionScore ?? null;
			const assistanceBody = { ...this.assistanceBody };

			assistanceBody.selectionCriteria = [...this.prepareCriteria()];

			if (typeof threshold === "string") {
				assistanceBody.threshold = null;
			} else {
				assistanceBody.threshold = totalCount ? null : threshold;
			}

			if (totalCount) {
				assistanceBody.scoringBlueprintId = null;
			}

			if (assistanceBody.selectionCriteria?.length) {
				await this.calculationOfAssistanceBeneficiaries({
					assistanceBody,
					totalCount,
				});
				await this.calculationOfAssistanceBeneficiariesScores({
					assistanceBody,
				});
			} else {
				this.totalCount = 0;
				this.countOf = 0;
			}

			this.$emit("deliveredCommodityValue");
		},

		async calculationOfAssistanceBeneficiaries({ assistanceBody, totalCount, groupKey = null }) {
			const { dateExpiration, ...beneficiariesBody } = assistanceBody;

			if (this.assistanceBodyIsValid(assistanceBody)) {
				await AssistancesService.calculationOfBeneficiaries(beneficiariesBody)
					.then(({ data, status }) => {
						if (status === 200) {
							if (groupKey === null) {
								if (totalCount) {
									this.totalCount = data.totalCount;
								} else {
									this.countOf = data.totalCount;
								}
							}

							if (groupKey !== null) {
								const newGroups = [...this.groups];

								if (newGroups[groupKey]?.tableData) {
									newGroups[groupKey].tableData = data.data;
								}

								this.groups = newGroups;
							} else {
								this.totalBeneficiariesData = data.data;
							}
						}
					}).catch((e) => {
						Notification(`${this.$t("Calculation")} ${e.message || e}`, "error");
					});
			}
		},

		async calculationOfAssistanceBeneficiariesScores({ assistanceBody }) {
			const beneficiaryIds = this.totalBeneficiariesData?.map(({ id }) => id) || [];
			const threshold = typeof this.minimumSelectionScore === "string"
				? null
				: this.minimumSelectionScore;
			const body = {
				beneficiaryIds,
				sector: assistanceBody.sector,
				scoringBlueprintId: this.scoringType?.id || null,
				threshold,
			};

			if (beneficiaryIds.length) {
				await AssistancesService.calculationOfBeneficiariesScores(body)
					.then(({ data, status }) => {
						if (status === 200) {
							this.beneficiariesScores = data.data;
						}
					}).catch((e) => {
						Notification(`${this.$t("Calculation")} ${e.message || e}`, "error");
					}).finally(() => {
						this.minimumSelectionScoreValid = null;
					});
			}
		},

		async fetchScoringTypes() {
			try {
				this.scoringTypesLoading = true;

				const { data: { data }, status, message } = await AssistancesService.getScoringTypes(
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
				this.scoringTypesLoading = false;
			}
		},

		assistanceBodyIsValid({ sector, subsector, target, type }) {
			return sector && subsector && target && type;
		},

		onRemoveCriteriaGroup(groupKey) {
			this.groups.splice(groupKey, 1);

			this.groups.forEach((group, key) => {
				this.getCountOfBeneficiariesInGroup(key);
			});

			this.getCountOfBeneficiaries({ totalCount: true });
			this.getCountOfBeneficiaries({ totalCount: false });
		},

		onUpdatedCriteria({ groupKey }) {
			if (this.groups[groupKey].data?.length === 0) {
				this.groups.splice(groupKey, 1);
			}

			this.groups.forEach((group, key) => {
				this.getCountOfBeneficiariesInGroup(key);
			});

			this.getCountOfBeneficiaries({ totalCount: true });
			this.getCountOfBeneficiaries({ totalCount: false });

			this.$emit(
				"updatedData",
				this.prepareCriteria(),
				this.minimumSelectionScore,
				this.vulnerabilityScoreTouched || this.calculationLoading,
				this.scoringType,
			);

			this.$emit("beneficiariesCounted", this.countOf);
		},

		onShowBeneficiariesInGroup(key) {
			this.beneficiariesData = this.groups[key]?.tableData;
			this.detailModal.isOpened = true;
		},

		onShowTotalBeneficiaries() {
			this.beneficiariesData = this.totalBeneficiariesData;
			this.detailModal.isOpened = true;
		},

		closeCriteriaGroupModal() {
			this.detailModal.isOpened = false;
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
