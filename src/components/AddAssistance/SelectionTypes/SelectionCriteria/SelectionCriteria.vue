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
				:data="group.data"
				:count="group.tableData.length"
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
		<div class="level is-align-items-flex-end">
			<div class="level-left">
				<b-field :label="vulnerabilityScoreLabel">
					<div>
						<b-numberinput
							v-model.number="minimumSelectionScore"
							expanded
							class="vulnerability-number-input"
							type="is-dark"
							:min="minimumVulnerabilityScore"
							:max="maximumVulnerabilityScore"
							:controls="false"
							:disabled="calculationLoading || !groups.length"
							@input="onVulnerabilityScoreInput"
						/>
					</div>

					<b-button
						class="ml-2"
						type="is-primary"
						:disabled="calculationLoading || !isMinimumSelectionScoreValid || !groups.length"
						@click="updateVulnerabilityScores"
					>
						{{ $t('Update') }}
					</b-button>
				</b-field>
			</div>
			<div class="level-right" ref="groupsCalculation">
				<b-field>
					<div class="selection-details">
						<p class="subtitle is-4 mb-0 mr-3 ml-3">
							<strong>
								{{ countOf }}/{{ totalCount }}
							</strong>
							{{ $t(selectedTargetType) }}
						</p>
						<b-button
							class="is-pulled-right"
							icon="detail"
							type="is-link"
							:disabled="vulnerabilityScoreTouched || calculationLoading || !groups.length"
							@click="showTotalBeneficiaries"
						>
							{{ $t('Details') }}
						</b-button>
						<ExportButton
							type="is-primary"
							class="ml-2"
							:label="$t('Export Details')"
							:loading="exportLoading"
							:formats="{ xlsx: true }"
							:disabled="vulnerabilityScoreTouched || calculationLoading || !groups.length"
							@onExport="exportSelectedBeneficiaries"
						/>
					</div>
				</b-field>
			</div>
		</div>
	</div>
</template>

<script>
import ExportButton from "@/components/ExportButton";
import Modal from "@/components/Modal";
import SelectionCriteriaForm from "@/components/AddAssistance/SelectionTypes/SelectionCriteria/SelectionCriteriaForm";
import SelectionCriteriaGroup from "@/components/AddAssistance/SelectionTypes/SelectionCriteria/SelectionCriteriaGroup";
import BeneficiariesModalList from "@/components/AddAssistance/SelectionTypes/SelectionCriteria/BeneficiariesModalList";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import consts from "@/utils/assistanceConst";

export default {
	name: "SelectionCriteria",

	components: {
		BeneficiariesModalList,
		SelectionCriteriaGroup,
		Modal,
		SelectionCriteriaForm,
		ExportButton,
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
			beneficiariesData: [],
			beneficiariesScores: [],
			totalBeneficiariesData: [],
			countOf: 0,
			totalCount: 0,
			minimumSelectionScore: 0,
			calculationLoading: false,
			vulnerabilityScoreTouched: false,
			exportLoading: false,
			minimumVulnerabilityScore: 0,
			maximumVulnerabilityScore: 0,
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
			return `${this.$t("Minimum Vulnerability Score")} (${this.minimumVulnerabilityScore} - ${this.maximumVulnerabilityScore})`;
		},

		isMinimumSelectionScoreValid() {
			return this.minimumSelectionScore <= this.maximumVulnerabilityScore
				&& this.minimumSelectionScore >= this.minimumVulnerabilityScore;
		},
	},

	updated() {
		this.$emit(
			"updatedData",
			this.prepareCriteria(),
			this.minimumSelectionScore,
			this.vulnerabilityScoreTouched || this.calculationLoading,
		);

		this.$emit("beneficiariesCounted", this.countOf);
	},

	watch: {
		groups() {
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

		async exportSelectedBeneficiaries(format) {
			this.exportLoading = true;

			await AssistancesService.exportVulnerabilityScores(
				format, this.assistanceBody,
			)
				.then(({ data, status, message }) => {
					if (status === 200) {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `vulnerability-scores.${format}`;
						link.click();
					} else {
						Notification(message, "is-warning");
					}
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Export Projects")} ${e}`, "is-danger");
				});

			this.exportLoading = false;
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
					result = new Date(newValue.toString()).toISOString();
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

			this.groups = [...this.groups.map((group) => ({
				...group,
				tableData: [],
			}))];

			this.totalCount = 0;
			this.countOf = 0;
		},

		async updateVulnerabilityScores() {
			await this.fetchCriteriaInfo();

			this.vulnerabilityScoreTouched = false;
		},

		async getCountOfBeneficiariesInGroup(groupKey) {
			const assistanceBody = { ...this.assistanceBody };
			const preparedCriteria = this.prepareCriteria();

			assistanceBody.selectionCriteria = preparedCriteria
				.filter(({ group }) => group === groupKey);
			assistanceBody.threshold = 0;

			if (assistanceBody.selectionCriteria?.length) {
				await this.calculationOfAssistanceBeneficiaries({
					assistanceBody, totalCount: false, groupKey,
				});
			}
		},

		getCountOfBeneficiaries({ totalCount = false }) {
			const threshold = this.minimumSelectionScore || 0;
			const assistanceBody = { ...this.assistanceBody };

			assistanceBody.selectionCriteria = [...this.prepareCriteria()];
			assistanceBody.threshold = totalCount ? 0 : threshold;

			if (assistanceBody.selectionCriteria?.length) {
				this.calculationOfAssistanceBeneficiaries({ assistanceBody, totalCount });
				this.calculationOfAssistanceBeneficiariesScores({ assistanceBody });
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

		async calculationOfAssistanceBeneficiariesScores({ assistanceBody }) {
			if (this.assistanceBodyIsValid(assistanceBody)) {
				await AssistancesService.calculationOfBeneficiariesScores(assistanceBody)
					.then(({ data, status }) => {
						if (status === 200) {
							this.beneficiariesScores = data.data;
						}
					}).catch((e) => {
						if (e.message) Notification(`${this.$t("Calculation")} ${e}`, "is-danger");
					}).finally(() => {
						const scores = this.beneficiariesScores.map(({ totalScore }) => totalScore);

						this.minimumVulnerabilityScore = Math.min.apply(null, scores);
						this.maximumVulnerabilityScore = Math.max.apply(null, scores);

						if (this.minimumSelectionScore === 0) {
							this.minimumSelectionScore = this.minimumVulnerabilityScore;
						}
					});
			}
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
			this.minimumVulnerabilityScore = 0;
			this.maximumVulnerabilityScore = 0;
		},

	},
};
</script>

<style scoped>
.selection-details {
	display: flex;
	justify-content: flex-end;
	align-items: center;
}

.vulnerability-number-input {
	border-bottom-right-radius: 4px !important;
	border-top-right-radius: 4px !important;
	width: 100px;
}
</style>
