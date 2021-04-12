<template>
	<div>
		<AssistanceSummary
			:beneficiaries="beneficiariesCount"
			:assistance="assistance"
			:project="project"
		/>
		<div class="m-6">
			<div class="has-text-centered mb-3">
				<div class="subtitle">
					{{ $t(typeOfAssistance) }} {{ $t('Progress') }}:
					<strong>{{ assistanceProgress }} %</strong>
				</div>
			</div>
			<b-progress v-model="assistanceProgress" type="is-success" />
			<div class="columns">
				<div class="column is-3">
					<div class="has-text-weight-bold">
						{{ $t('Total Amount') }}:
					</div>
					<span>{{ totalAmount }} </span>
					<span v-if="assistanceUnit">{{ assistanceUnit }}</span>
				</div>
				<div class="column is-3">
					<div class="has-text-weight-bold">
						{{ $t('Amount') }} {{ $t(distributedOrCompleted) }}:
					</div>
					<span>{{ amountCompleted }} </span>
					<span v-if="assistanceUnit">{{ assistanceUnit }}</span>
				</div>
			</div>
		</div>
		<BeneficiariesList
			ref="beneficiariesList"
			export-button
			add-button
			isAssistanceDetail
			:assistance="assistance"
			:project="project"
			@beneficiariesCounted="beneficiariesCount = $event"
			@rowsChecked="onRowsCheck"
		/>
		<br>
		<div class="columns">
			<div class="column buttons">
				<b-button
					v-if="isAssistanceValidated && !isAssistanceCompleted"
					class="flex-end ml-3"
					type="is-primary"
					icon-right="check"
					@click="closeAssistance"
				>
					{{ $t('Close Assistance') }}
				</b-button>
				<b-button
					v-if="setAtDistributedButtonVisible
						&& (isAssistanceValidated && !isAssistanceCompleted)"
					class="flex-end ml-3"
					type="is-primary"
					icon-right="parachute-box"
					:loading="setAtDistributedButtonLoading"
					@click="setGeneralReliefItemAsDistributed"
				>
					{{ $t(setAtDistributedButtonLabel) }}
				</b-button>
				<b-button
					v-if="startTransactionButtonVisible
						&& (isAssistanceValidated && !isAssistanceCompleted)"
					class="flex-end ml-3"
					type="is-primary"
					icon-right="parachute-box"
					:loading="startTransactionButtonLoading"
					@click="startTransaction"
				>
					{{ $t("Start Transaction") }} ({{ beneficiariesCount }})
				</b-button>
			</div>
		</div>
	</div>
</template>

<script>
import AssistanceSummary from "@/components/Assistance/AssistanceSummary";
import BeneficiariesList from "@/components/Assistance/BeneficiariesList";
import AssistancesService from "@/services/AssistancesService";
import { Notification, Toast } from "@/utils/UI";
import ProjectService from "@/services/ProjectService";
import consts from "@/utils/assistanceConst";

export default {
	name: "AssistanceDetail",

	components: {
		BeneficiariesList,
		AssistanceSummary,
	},

	data() {
		return {
			assistance: null,
			statistics: null,
			project: null,
			beneficiariesCount: 0,
			countOfCompleted: 0,
			commodities: [],
			setAtDistributedButtonVisible: false,
			setAtDistributedButtonLoading: false,
			startTransactionButtonLoading: false,
		};
	},

	computed: {
		assistanceUnit() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) {
				return this.commodities?.[0]?.unit || "";
			}

			if (this.assistance?.type === consts.TYPE.ACTIVITY) return "Activity";

			return "";
		},

		startTransactionButtonVisible() {
			return this.commodities[0]?.modalityType === consts.COMMODITY.MOBILE_MONEY;
		},

		setAtDistributedButtonLabel() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) return "Set As Distributed";
			if (this.assistance?.type === consts.TYPE.ACTIVITY) return "Set As Completed";
			return "";
		},

		typeOfAssistance() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) return "Distribution";
			if (this.assistance?.type === consts.TYPE.ACTIVITY) return "Activity";
			return "";
		},

		distributedOrCompleted() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) return "Distributed";
			if (this.assistance?.type === consts.TYPE.ACTIVITY) return "Completed";
			return "";
		},

		isAssistanceValidated() {
			return this.assistance?.validated;
		},

		isAssistanceCompleted() {
			return this.assistance?.completed;
		},

		assistanceProgress() {
			if (!this.totalAmount || !this.amountCompleted) return 0;
			const result = (100 / this.totalAmount) * this.amountCompleted;
			if (result === Infinity) return 0;
			return (result > 100) ? 100 : Math.round(result);
		},

		amountCompleted() {
			// TODO Resolve this when logic of behaviour will be explained
			/*
			const result = 0;

			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) {
				result = (this.commodities?.[0]?.value && this.statistics?.summaryOfUsedItems)
					? this.commodities.[0].value * this.statistics.summaryOfUsedItems : 0;
			}
			if (this.assistance?.type === consts.TYPE.ACTIVITY) {
				result = this.statistics?.summaryOfUsedItems || 0;
			}
			 */

			return this.statistics?.summaryOfDistributedItems || 0;
		},

		totalAmount() {
			let result = 0;

			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) {
				if (this.$refs.beneficiariesList?.table.total && this.commodities?.[0]?.value) {
					result = this.$refs.beneficiariesList.table.total * this.commodities[0].value;
				}
			}
			if (this.assistance?.type === consts.TYPE.ACTIVITY) {
				return this.$refs.beneficiariesList.table.total;
			}

			return result;
		},
	},

	mounted() {
		this.fetchAssistance();
		this.fetchAssistanceStatistics();
		this.fetchProject();
	},

	methods: {
		async fetchAssistance() {
			AssistancesService.getDetailOfAssistance(
				this.$route.params.assistanceId,
			).then((data) => {
				this.assistance = data;

				if (this.assistance.type === consts.TYPE.DISTRIBUTION) {
					this.fetchCommodity();
				}
			});
		},

		async fetchAssistanceStatistics() {
			AssistancesService.getAssistanceStatistics(
				this.$route.params.assistanceId,
			).then((data) => {
				this.statistics = data;
			});
		},

		async fetchProject() {
			await ProjectService.getDetailOfProject(
				this.$route.params.projectId,
			).then(({ data }) => {
				this.project = data;
			});
		},

		onRowsCheck(rows) {
			this.setAtDistributedButtonVisible = !!rows?.length;
			this.selectedBeneficiaries = rows;
		},

		async setGeneralReliefItemAsDistributed() {
			const dateOfDistribution = new Date().toISOString();
			let error = "";
			let success = "";

			if (this.selectedBeneficiaries?.length) {
				this.setAtDistributedButtonLoading = true;

				await Promise.all(this.selectedBeneficiaries.map(async (beneficiary) => {
					await AssistancesService.updateGeneralReliefItem(
						beneficiary.generalReliefItem.id, true, dateOfDistribution,
					).then(({ status }) => {
						if (status === 200) {
							success += `${this.$t("Success for Beneficiary")} ${beneficiary.id}. `;
						}
					}).catch((e) => {
						error += `${this.$t("Error for Beneficiary")} ${beneficiary.id} ${e}. `;
					});
				}));

				if (error) Toast(error, "is-danger");
				if (success) Toast(success, "is-success");

				this.setAtDistributedButtonVisible = false;
				this.$refs.beneficiariesList.fetchData();
				this.fetchAssistanceStatistics();

				this.setAtDistributedButtonLoading = false;
			}
		},

		async startTransaction() {
			this.startTransactionButtonLoading = true;

			// TODO Call endpoint for Start Transaction in this assistance
			// TODO Hide button if transaction was already done

			this.startTransactionButtonLoading = false;
		},

		async fetchCommodity() {
			await AssistancesService.getAssistanceCommodities(this.$route.params.assistanceId)
				.then(({ data }) => {
					this.commodities = data;
				})
				.catch((e) => {
					Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
				});
		},

		closeAssistance() {
			this.$buefy.dialog.confirm({
				title: this.$t("Close Assistance"),
				message: this.$t("Are You Sure You Want To Close This Assistance?"),
				confirmText: this.$t("Confirm"),
				type: "is-primary",
				onConfirm: async () => {
					const assistanceId = Number(this.$route.params.assistanceId);

					await AssistancesService.updateAssistanceToStatusCompleted(
						{ assistanceId, completed: true },
					).then(({ status }) => {
						if (status === 200) {
							Toast(this.$t("Assistance Successfully Closed"), "is-success");
							this.$router.push({ name: "Project",
								params: { projectId: this.$route.params.projectId },
							});
						}
					}).catch((e) => {
						Toast(`${this.$t("Assistance")} ${e}`, "is-danger");
					});
				},
			});
		},
	},
};

</script>

<style scoped>
.buttons {
	text-align: right;
}
</style>
