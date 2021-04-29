<template>
	<div>
		<AssistanceSummary
			:assistance="assistance"
			:project="project"
		/>
		<Modal
			:header="$t('Start Transaction')"
			:active="transactionModal.isOpened"
			:is-waiting="transactionModal.isWaiting"
			@close="closeTransactionModal"
		>
			<StartTransactionForm
				close-button
				:submit-button-label="$t('Confirm')"
				class="modal-card"
				@formSubmitted="confirmTransaction"
				@formClosed="closeTransactionModal"
			/>
		</Modal>
		<div class="m-6">
			<div class="has-text-centered mb-3">
				<div class="subtitle">
					{{ $t(distributionOrActivity) }} {{ $t('Progress') }}:
					<strong>{{ assistanceProgress }} %</strong>
				</div>
			</div>
			<b-progress v-model="assistanceProgress" type="is-success" />
			<div class="columns">
				<div class="column is-3">
					<div class="has-text-weight-bold">
						{{ $t('Total Amount') }}:
					</div>
					<span>{{ amountTotal }} </span>
					<span v-if="assistanceUnit">{{ assistanceUnit }}</span>
				</div>

				<div
					v-if="modalityType !== consts.COMMODITY.MOBILE_MONEY"
					class="column is-3"
				>
					<div class="has-text-weight-bold">
						{{ $t('Amount') }} {{ $t(distributedOrCompleted) }}:
					</div>
					<span>{{ amountDistributed }} </span>
					<span v-if="assistanceUnit">{{ assistanceUnit }}</span>
				</div>

				<div
					v-if="modalityType === consts.COMMODITY.QR_CODE_VOUCHER"
					class="column is-3"
				>
					<div class="has-text-weight-bold">
						{{ $t('Amount Used') }}:
					</div>
					<span>{{ amountUsed }} </span>
					<span v-if="assistanceUnit">{{ assistanceUnit }}</span>
				</div>

				<div
					v-if="modalityType === consts.COMMODITY.MOBILE_MONEY"
					class="column is-3"
				>
					<div class="has-text-weight-bold">
						{{ $t('Amount Sent') }}:
					</div>
					<span>{{ amountSent }} </span>
					<span v-if="assistanceUnit">{{ assistanceUnit }}</span>
				</div>

				<div
					v-if="modalityType === consts.COMMODITY.MOBILE_MONEY"
					class="column is-3"
				>
					<div class="has-text-weight-bold">
						{{ $t('Amount Picked Up') }}:
					</div>
					<span>{{ amountPickedUp }} </span>
					<span v-if="assistanceUnit">{{ assistanceUnit }}</span>
				</div>
			</div>
		</div>
		<BeneficiariesList
			ref="beneficiariesList"
			export-button
			is-assistance-detail
			:add-button="isAddButtonVisible"
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
						&& (isAssistanceValidated && !isAssistanceCompleted)
						&& userCan.assignDistributionItems"
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
						&& (isAssistanceValidated && !isAssistanceCompleted)
						&& userCan.authoriseElectronicCashTransfer
					"
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
import permissions from "@/mixins/permissions";
import Modal from "@/components/Modal";
import StartTransactionForm from "@/components/Assistance/BeneficiariesList/StartTransactionForm";

export default {
	name: "AssistanceDetail",

	components: {
		StartTransactionForm,
		BeneficiariesList,
		AssistanceSummary,
		Modal,
	},

	mixins: [permissions],

	data() {
		return {
			consts,
			assistance: null,
			statistics: null,
			project: null,
			beneficiariesCount: 0,
			countOfCompleted: 0,
			commodities: [],
			setAtDistributedButtonVisible: false,
			setAtDistributedButtonLoading: false,
			startTransactionButtonLoading: false,
			transactionModal: {
				isOpened: false,
				isEditing: false,
				isWaiting: false,
			},
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

		distributionOrActivity() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) return "Distribution";
			if (this.assistance?.type === consts.TYPE.ACTIVITY) return "Activity";
			return "";
		},

		distributedOrCompleted() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) return "Distributed";
			if (this.assistance?.type === consts.TYPE.ACTIVITY) return "Completed";
			return "";
		},

		isAddButtonVisible() {
			return !this.isAssistanceCompleted;
		},

		isAssistanceValidated() {
			return this.assistance?.validated;
		},

		isAssistanceCompleted() {
			return this.assistance?.completed;
		},

		modalityType() {
			return this.commodities?.[0]?.modalityType;
		},

		assistanceProgress() {
			let result = 0;

			if (this.modalityType) {
				switch (this.modalityType) {
					case consts.COMMODITY.MOBILE_MONEY:
						if (this.amountTotal && this.amountPickedUp) {
							result = (100 / this.amountTotal) * this.amountPickedUp;
						}
						break;
					case consts.COMMODITY.QR_CODE_VOUCHER:
						if (this.amountTotal && this.amountUsed) {
							result = (100 / this.amountTotal) * this.amountUsed;
						}
						break;
					case consts.COMMODITY.SMARTCARD:
					default:
						if (this.amountTotal && this.amountDistributed) {
							result = (100 / this.amountTotal) * this.amountDistributed;
						}
				}
			}

			return (result !== Infinity) ? Math.round(result) : 0;
		},

		amountTotal() {
			return this.statistics?.amountTotal || 0;
		},

		amountSent() {
			return this.statistics?.amountSent || 0;
		},

		amountPickedUp() {
			return this.statistics?.amountPickedUp || 0;
		},

		amountUsed() {
			return this.statistics?.amountUsed || 0;
		},

		amountDistributed() {
			return this.statistics?.amountDistributed || 0;
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
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Assistance")} ${e}`, "is-danger");
				if (e.message === "Not Found") this.$router.push({ name: "NotFound" });
			});
		},

		async fetchAssistanceStatistics() {
			AssistancesService.getAssistanceStatistics(
				this.$route.params.assistanceId,
			).then((data) => {
				this.statistics = data;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Assistance Statistics")} ${e}`, "is-danger");
			});
		},

		async fetchProject() {
			await ProjectService.getDetailOfProject(
				this.$route.params.projectId,
			).then(({ data }) => {
				this.project = data;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Assistance")} ${e}`, "is-danger");
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
						beneficiary.generalReliefItemIds[0],
						true,
						dateOfDistribution,
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

		closeTransactionModal() {
			this.transactionModal.isOpened = false;
		},

		async startTransaction() {
			const now = new Date().toISOString();
			const dateOfDistribution = this.assistance.dateDistribution;
			const isAfter = this.$moment(now).isAfter(dateOfDistribution);

			if (isAfter) {
				this.startTransactionButtonLoading = true;

				await AssistancesService
					.sendVerificationEmailForTransactions(this.$route.params.assistanceId)
					.then((response) => {
						if (response.status === 204) this.transactionModal.isOpened = true;
					})
					.catch((e) => {
						if (e.message) Notification(`${this.$t("Start Transaction")} ${e}`, "is-danger");
					});

				this.startTransactionButtonLoading = false;
			} else {
				Notification(
					`${this.$t("Date of the distribution is in the future")}.`,
					"is-danger",
				);
			}
		},

		async confirmTransaction(code) {
			this.transactionModal.isWaiting = true;

			const body = {
				code,
			};

			await AssistancesService.createTransactionsForBeneficiaries(
				this.$route.params.assistanceId,
				body,
			).then(({ status }) => {
				if (status === 204) {
					Toast(this.$t("Successful Transaction"), "is-success");

					this.$refs.beneficiariesList.fetchData();
					this.fetchAssistanceStatistics();
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Transactions")} ${e}`, "is-danger");
			});

			this.transactionModal.isWaiting = false;
			this.closeTransactionModal();
		},

		async fetchCommodity() {
			await AssistancesService.getAssistanceCommodities(this.$route.params.assistanceId)
				.then(({ data }) => {
					this.commodities = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Commodities")} ${e}`, "is-danger");
				});
		},

		closeAssistance() {
			this.$buefy.dialog.confirm({
				title: this.$t("Close Assistance"),
				message: this.$t("Are you sure you want to close this Assistance?"),
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
