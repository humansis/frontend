<template>
	<div class="d-flex align-baseline justify-space-between">
		<h2 class="text-h6 mt-5 font-weight-bold">{{ $t('Selection Criteria') }}</h2>

		<v-btn
			color="primary"
			size="small"
			prepend-icon="plus"
			class="text-none"
			@click="addCriteria()"
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
		:header="$t('Selected Beneficiaries')"
	>
		<BeneficiariesModalList
			close-button
			:data="beneficiariesData"
			:scores="beneficiariesScores"
		/>
	</Modal>

	<Modal
		v-model="criteriaModal.isOpened"
		:header="$t('Create New Criteria')"
	>
		<SelectionCriteriaForm
			close-button
			class="modal-card"
			ref="criteriaForm"
			:submit-button-label="$t('Create')"
			:formModel="criteriaModel"
			@formSubmitted="submitCriteriaForm"
			@formClosed="closeCriteriaModal"
		/>
	</Modal>

	<SelectionCriteriaGroup
		v-for="(group, key) of groups"
		:data="group && group.data"
		:count="group && group.tableData.length"
		:key="key"
		:group-id="key"
		:target-type="selectedTargetType"
		:loading="calculationLoading"
		@addCriteria="addCriteria"
		@updatedCriteria="onUpdatedCriteria"
		@removeGroup="removeCriteriaGroup(key)"
		@showDetail="showBeneficiariesInGroup(key)"
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
				@update:modelValue="scoringTypeChanged"
			/>
		</v-col>

		<v-col cols="6">
			<DataInput
				v-model="minimumSelectionScore"
				:label="vulnerabilityScoreLabel"
				name="minimum-vulnerability-score"
				@update:modelValue="onVulnerabilityScoreInput"
			/>
		</v-col>

		<v-col cols="2">
			<v-btn
				:disabled="isUpdateButtonEnabled"
				color="primary"
				size="small"
				class="text-none"
				variant="elevated"
				@click="updateVulnerabilityScores"
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
				size="small"
				class="text-none mr-3"
				variant="elevated"
				@click="showTotalBeneficiaries"
			>
				{{ $t('Details') }}
			</v-btn>

			<ExportControl
				type="is-primary"
				field-class="is-pulled-right ml-3"
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.loading"
				:location="exportControl.location"
				:disabled="isExportButtonDisabled"
				@onExport="exportSelectedBeneficiaries"
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
		"onDeliveredCommodityValue",
		"updatedData",
		"beneficiariesCounted",
	],

	props: {
		targetType: String,
		assistanceBody: Object,

		data: {
			type: Array,
			default: null,
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

			this.$emit("onDeliveredCommodityValue");
		},

		data(data) {
			if (data) {
				this.groups = data;
			}
		},
	},

	created() {
		this.fetchScoringTypes();
	},

	updated() {
		this.$emit(
			"updatedData",
			this.prepareCriteria(),
			this.minimumSelectionScore,
			this.vulnerabilityScoreTouched || this.calculationLoading,
			this.scoringType,
		);

		this.$emit("beneficiariesCounted", this.countOf);
	},

	methods: {
		submit() {
			return !!this.groups.length;
		},

		async exportSelectedBeneficiaries(exportType, format) {
			if (exportType === EXPORT.VULNERABILITY_SCORES) {
				try {
					this.exportControl.loading = true;

					const filename = `Vulnerability scores ${normalizeExportDate()}`;
					const { data, status, message } = await AssistancesService.exportVulnerabilityScores(format, this.assistanceBody);

					downloadFile(data, filename, status, format, message);
				} catch (e) {
					Notification(`${this.$t("Export Projects")} ${e.message || e}`, "is-danger");
				} finally {
					this.exportControl.loading = false;
				}
			}
		},

		async scoringTypeChanged() {
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

		addCriteria(id) {
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

		closeCriteriaModal() {
			this.criteriaModal.isOpened = false;
		},

		submitCriteriaForm(criteriaForm) {
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

		fetchCriteriaInfo() {
			this.groups.forEach((group, key) => {
				this.getCountOfBeneficiariesInGroup(key);
			});

			this.getCountOfBeneficiaries({ totalCount: true });
			this.getCountOfBeneficiaries({ totalCount: false });
		},

		onVulnerabilityScoreInput() {
			this.vulnerabilityScoreTouched = true;
			this.totalCount = 0;
			this.countOf = 0;
		},

		async updateVulnerabilityScores() {
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
			assistanceBody.threshold = totalCount ? null : threshold;

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

			this.$emit("onDeliveredCommodityValue");
		},

		async calculationOfAssistanceBeneficiaries({ assistanceBody, totalCount, groupKey = null }) {
			const { dateExpiration, ...beneficiariesBody } = assistanceBody;
			this.calculationLoading = true;

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
						if (e.message) Notification(`${this.$t("Calculation")} ${e}`, "is-danger");
					});
			}

			this.calculationLoading = false;
		},

		async calculationOfAssistanceBeneficiariesScores({ assistanceBody }) {
			const beneficiaryIds = this.totalBeneficiariesData?.map(({ id }) => id) || [];

			const body = {
				beneficiaryIds,
				sector: assistanceBody.sector,
				scoringBlueprintId: this.scoringType?.id || null,
				threshold: this.minimumSelectionScore,
			};

			if (beneficiaryIds.length) {
				await AssistancesService.calculationOfBeneficiariesScores(body)
					.then(({ data, status }) => {
						if (status === 200) {
							this.beneficiariesScores = data.data;
						}
					}).catch((e) => {
						if (e.message) Notification(`${this.$t("Calculation")} ${e}`, "is-danger");
					}).finally(() => {
						this.minimumSelectionScoreValid = null;
					});
			}
		},

		async fetchScoringTypes() {
			this.scoringTypesLoading = true;

			await AssistancesService.getScoringTypes(
				null,
				null,
				this.filters,
			)
				.then(({ data }) => {
					data.forEach((item) => {
						this.options.scoringTypes.push({
							...item,
							identifier: `${item.name} (ID: ${item.id})`,
						});
					});
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Scoring Types")} ${e}`, "is-danger");
				}).finally(() => {
					this.scoringTypesLoading = false;
					this.scoringType = this.options.scoringTypes?.[0] || null;
				});
		},

		assistanceBodyIsValid({ sector, subsector, target, type }) {
			return sector && subsector && target && type;
		},

		removeCriteriaGroup(groupKey) {
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
		},

		showBeneficiariesInGroup(key) {
			this.beneficiariesData = this.groups[key]?.tableData;
			this.detailModal.isOpened = true;
		},

		showTotalBeneficiaries() {
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
