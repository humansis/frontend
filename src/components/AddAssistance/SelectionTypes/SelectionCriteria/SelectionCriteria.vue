<template>
	<div class="mb-6">
		<Modal
			can-cancel
			:header="$t('Selected Beneficiaries')"
			:active="detailModal.isOpened"
			@close="closeCriteriaGroupModal"
		>
			<BeneficiariesModalList
				close-button
				:data="beneficiariesData"
				:scores="beneficiariesScores"
			/>
		</Modal>
		<h3 class="title is-4 space-between mb-0">
			{{ $t('Selection Criteria') }}
			<b-button
				class="mb-5"
				type="is-primary"
				icon-left="plus"
				@click="addCriteria()"
			>
				{{ $t('Add Group') }}
			</b-button>
		</h3>
		<Modal
			can-cancel
			:header="$t('Create New Criteria')"
			:active.sync="criteriaModal.isOpened"
			@close="closeCriteriaModal"
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
		<div class="mb-2">
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
			<b-notification
				v-if="!groups.length"
				type="is-light"
				has-icon
				icon="eye-slash"
				:closable="false"
			>
				<p class="mt-3">
					{{ $t('There Are No Criteria Groups') }}.
					{{ $t('Please Add At Least One Criteria Group') }}.
				</p>
			</b-notification>
		</div>

		<div class="columns">
			<div class="column is-4">
				<b-field
					class="vulnerability-type-field"
					:label="$t('Scoring')"
					expanded
				>
					<MultiSelect
						v-model="scoringType"
						:placeholder="$t('Click to select')"
						:select-label="$t('Press enter to select')"
						:selected-label="$t('Selected')"
						:deselect-label="$t('Press enter to remove')"
						label="name"
						track-by="id"
						:options="options.scoringTypes"
						:loading="scoringTypesLoading"
						:disabled="calculationLoading || !groups.length"
						:searchable="false"
						:allow-empty="false"
						@select="scoringTypeChanged"
					>
						<span slot="noOptions">{{$t("List is empty")}}</span>
					</MultiSelect>
				</b-field>
			</div>

			<div class="column is-8 is-flex pl-0">
				<form @submit.prevent="updateVulnerabilityScores"  class="is-flex-grow-1">
					<b-field grouped>
						<b-field
							:label="vulnerabilityScoreLabel"
							expanded
						>
							<b-numberinput
								v-model="minimumSelectionScore"
								expanded
								class="vulnerability-number-input"
								type="is-dark"
								:controls="false"
								:disabled="calculationLoading || !groups.length"
								@input="onVulnerabilityScoreInput"
							/>
						</b-field>
					</b-field>
				</form>
				<b-button
					class="vulnerability-update-button is-align-self-center ml-2"
					type="is-primary"
					:disabled="isUpdateButtonEnabled"
					@click="updateVulnerabilityScores"
				>
					{{ $t('Update') }}
				</b-button>
			</div>
		</div>

		<div class="columns">
			<div class="column has-text-right pt-0">
				<b-button
					icon="detail"
					type="is-link"
					:disabled="vulnerabilityScoreTouched || calculationLoading || !groups.length"
					@click="showTotalBeneficiaries"
				>
					{{ $t('Details') }}
				</b-button>

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
			</div>
		</div>

		<div class="subtitle is-4 mb-0 has-text-right">
			<strong>
				{{ countOf }}/{{ totalCount }}
			</strong>
			{{ $t(selectedTargetType) }}
		</div>
	</div>
</template>

<script>
import ExportControl from "@/components/Export";
import { EXPORT } from "@/consts";
import Modal from "@/components/Modal";
import SelectionCriteriaForm from "@/components/AddAssistance/SelectionTypes/SelectionCriteria/SelectionCriteriaForm";
import SelectionCriteriaGroup from "@/components/AddAssistance/SelectionTypes/SelectionCriteria/SelectionCriteriaGroup";
import BeneficiariesModalList from "@/components/AddAssistance/SelectionTypes/SelectionCriteria/BeneficiariesModalList";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import consts from "@/utils/assistanceConst";
import { normalizeExportDate } from "@/utils/datagrid";

export default {
	name: "SelectionCriteria",

	components: {
		BeneficiariesModalList,
		SelectionCriteriaGroup,
		Modal,
		SelectionCriteriaForm,
		ExportControl,
	},

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

	methods: {
		submit() {
			return !!this.groups.length;
		},

		async exportSelectedBeneficiaries(type, format) {
			if (type === EXPORT.VULNERABILITY_SCORES) {
				this.exportControl.loading = true;

				await AssistancesService.exportVulnerabilityScores(
					format, this.assistanceBody,
				)
					.then(({ data, status, message }) => {
						if (status === 200) {
							const blob = new Blob([data], { type: data.type });
							const link = document.createElement("a");
							link.href = window.URL.createObjectURL(blob);
							link.download = `Vulnerability scores ${normalizeExportDate()}.${format}`;
							link.click();
						} else {
							Notification(message, "is-warning");
						}
					})
					.catch((e) => {
						if (e.message) Notification(`${this.$t("Export Projects")} ${e}`, "is-danger");
					});

				this.exportControl.loading = false;
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

			if (value.code === false && dataType === consts.FIELD_TYPE.BOOLEAN) {
				newValue = false;
			}

			switch (dataType) {
				case consts.FIELD_TYPE.DATE:
					result = this.$moment(newValue).format("YYYY-MM-DD");
					break;
				case consts.FIELD_TYPE.LOCATION:
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
			this.calculationLoading = true;

			if (this.assistanceBodyIsValid(assistanceBody)) {
				await AssistancesService.calculationOfBeneficiaries(assistanceBody)
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

		async calculationOfAssistanceBeneficiariesScores({
			assistanceBody,
		}) {
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

			await AssistancesService.getScoringTypes()
				.then(({ data }) => { this.options.scoringTypes.push(...data); })
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

<style>
.selection-details {
	display: flex;
	justify-content: flex-end;
	align-items: center;
}

.vulnerability-number-input {
	border-bottom-right-radius: 4px;
	border-top-right-radius: 4px;
	width: 100%;
}

.vulnerability-number-input input, .vulnerability-update-button {
	height: 40px;
}

.vulnerability-update-button {
	margin-top: 2rem;
}

.scoring-actions {
	padding-top: 39px;
}
</style>
