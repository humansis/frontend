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
				@removeGroup="removeCriteriaGroup(key)"
				@updatedCriteria="onUpdatedCriteria"
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
				<b-field :label="$t('Minimum Vulnerability Score')">
					<b-numberinput
						v-model="minimumSelectionScore"
						expanded
						type="is-dark"
						:controls="false"
						:loading="vulnerabilityScoreLoading"
						@input="onVulnerabilityScoreChange"
					/>
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
							@click="showTotalBeneficiaries"
						>
							{{ $t('Details') }}
						</b-button>
					</div>
				</b-field>
			</div>
		</div>
	</div>
</template>

<script>
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
	},

	props: {
		targetType: String,
		assistanceBody: Object,
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
			vulnerabilityScoreLoading: false,
			vulnerabilityScoreTimer: null,
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
	},

	updated() {
		if (this.groups?.length) {
			this.$emit("updatedData", this.prepareCriteria(), this.minimumSelectionScore);
			this.$emit("beneficiariesCounted", this.countOf);
		}
	},

	methods: {
		submit() {
			return !!this.groups.length;
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

			this.groups.forEach((group, key) => {
				this.getCountOfBeneficiariesInGroup(key);
			});

			this.getCountOfBeneficiaries({ totalCount: true });
			this.getCountOfBeneficiaries({ totalCount: false });
		},

		onVulnerabilityScoreChange() {
			clearTimeout(this.vulnerabilityScoreTimer);
			this.vulnerabilityScoreLoading = true;

			this.vulnerabilityScoreTimer = setTimeout(() => {
				this.getCountOfBeneficiaries({ totalCount: false });
				this.vulnerabilityScoreLoading = false;
			}, 1000);
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
</style>
