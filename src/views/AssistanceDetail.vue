<template>
	<div>
		<AssistanceSummary
			:assistance="assistance"
			:is-statistics-loading="isStatisticsLoading"
			:statistics="statistics"
			:is-assistance-loading="isAssistanceLoading"
			:commodities="commodities"
			:project="project"
			:is-project-loading="isProjectLoading"
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
		<Modal
			:header="$t('Input Distributed')"
			:active="inputDistributedModal.isOpened"
			:is-waiting="inputDistributedModal.isWaiting"
			@close="closeInputDistributedModal"
		>
			<InputDistributed
				close-button
				class="modal-card"
				@submit="fetchBeneficiariesAndStatistics"
				@close="closeInputDistributedModal"
			/>
		</Modal>

		<EditNote :assistance="assistance" />

		<div
			v-if="!isAssistanceLoading"
			class="m-6"
		>
			<div class="has-text-centered mb-3">
				<div class="subtitle">
					{{ $t(distributionOrActivity) }}:
					<strong>{{ assistanceProgress }} %</strong>
				</div>
			</div>
			<b-progress v-model="assistanceProgress" type="is-success" />
		</div>
		<BeneficiariesList
			ref="beneficiariesList"
			export-button
			assistance-detail
			:add-button="isAddButtonVisible"
			:commodities="commodities"
			:assistance="assistance"
			:project="project"
			@beneficiariesCounted="beneficiariesCount = $event"
			@rowsChecked="onRowsCheck"
			@assistanceUpdated="fetchAssistanceData"
		/>
		<br>
		<div class="columns">
			<div class="column buttons">
				<!-- Temporary hidden
				<b-button
					v-if="isAssistanceValidated && !amountDistributed"
					class="flex-end ml-3"
					type="is-primary"
					icon-right="check"
					@click="unvalidateAssistance"
				>
					{{ $t('Unvalidate Assistance') }}
				</b-button>
				-->
				<b-button
					v-if="isAssistanceValidated && !isAssistanceCompleted"
					class="flex-end ml-3"
					type="is-primary"
					icon-right="check"
					@click="closeAssistance"
				>
					{{ $t('Close and Approve') }}
				</b-button>
				<b-button
					v-if="isDistributedButtonVisible"
					class="flex-end ml-3"
					type="is-primary"
					icon-right="parachute-box"
					:loading="setAtDistributedButtonLoading"
					@click="setGeneralReliefItemAsDistributed"
				>
					{{ $t(setAtDistributedButtonLabel) }}
				</b-button>
				<b-button
					v-if="isInputDistributedButtonVisible"
					class="flex-end ml-3"
					type="is-primary"
					icon-right="parachute-box"
					@click="openInputDistributedModal"
				>
					{{ $t("Input Distributed") }}
				</b-button>
				<b-button
					v-if="isStartTransactionButtonVisible"
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
import AssistanceSummary from "@/components/Assistance/AssistanceSummary/index";
import BeneficiariesList from "@/components/Assistance/BeneficiariesList";
import AssistancesService from "@/services/AssistancesService";
import EditNote from "@/components/Assistance/EditNote";
import { Notification, Toast } from "@/utils/UI";
import ProjectService from "@/services/ProjectService";
import consts from "@/utils/assistanceConst";
import permissions from "@/mixins/permissions";
import Modal from "@/components/Modal";
import StartTransactionForm from "@/components/Assistance/BeneficiariesList/StartTransactionForm";
import InputDistributed from "@/components/Assistance/InputDistributed/index";

export default {
	name: "AssistanceDetail",

	components: {
		StartTransactionForm,
		InputDistributed,
		BeneficiariesList,
		AssistanceSummary,
		EditNote,
		Modal,
	},

	mixins: [permissions],

	data() {
		return {
			consts,
			assistance: null,
			statistics: null,
			isStatisticsLoading: false,
			isAssistanceLoading: false,
			isProjectLoading: false,
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
			inputDistributedModal: {
				isOpened: false,
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

		isCommoditySmartcard() {
			return this.commodities[0]?.modalityType === consts.COMMODITY.SMARTCARD;
		},

		inputDistributedButtonVisible() {
			const modality = this.commodities[0]?.modalityType;

			return !this.isCommoditySmartcard
				&& modality !== consts.COMMODITY.QR_CODE_VOUCHER
				&& modality !== consts.COMMODITY.MOBILE_MONEY;
		},

		setAtDistributedButtonLabel() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) return "Set As Distributed";
			if (this.assistance?.type === consts.TYPE.ACTIVITY) return "Set As Completed";
			return "";
		},

		distributionOrActivity() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) return "Distribution Progress";
			if (this.assistance?.type === consts.TYPE.ACTIVITY) return "Activity Progress";
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
			return Math.trunc(this.statistics?.progress * 100);
		},

		amountDistributed() {
			return this.statistics?.amountDistributed || 0;
		},

		isAssistanceStateValidated() {
			return this.isAssistanceValidated && !this.isAssistanceCompleted;
		},

		isDistributedButtonVisible() {
			return this.isAssistanceStateValidated
				&& this.userCan.assignDistributionItems
				&& !this.isCommoditySmartcard
				&& this.setAtDistributedButtonVisible;
		},

		isInputDistributedButtonVisible() {
			return this.isAssistanceStateValidated
				&& this.userCan.assignDistributionItems
				&& this.inputDistributedButtonVisible;
		},

		isStartTransactionButtonVisible() {
			return this.isAssistanceStateValidated
				&& this.userCan.authoriseElectronicCashTransfer
				&& this.startTransactionButtonVisible;
		},
	},

	mounted() {
		this.fetchAssistance();
		this.fetchAssistanceStatistics();
		this.fetchProject();
	},

	methods: {
		fetchAssistanceData() {
			this.fetchAssistance();
			this.fetchAssistanceStatistics();
		},

		fetchBeneficiariesAndStatistics() {
			this.$refs.beneficiariesList.fetchData();
			this.fetchAssistanceStatistics();
		},

		async fetchAssistance() {
			this.isAssistanceLoading = true;

			try {
				const { data } = await AssistancesService.getDetailOfAssistance(
					this.$route.params.assistanceId,
				);

				this.assistance = data;

				if (this.assistance.type === consts.TYPE.DISTRIBUTION) {
					this.commodities = data.commodities;
				}
			} catch (e) {
				if (e.message) Notification(`${this.$t("Assistance")} ${e}`, "is-danger");
			} finally {
				this.isAssistanceLoading = false;
			}
		},

		async fetchAssistanceStatistics() {
			this.isStatisticsLoading = true;

			try {
				const { data } = await AssistancesService.getAssistanceStatistics(
					this.$route.params.assistanceId,
				);

				this.statistics = data;
			} catch (e) {
				if (e.message) Notification(`${this.$t("Assistance Statistics")} ${e}`, "is-danger");
			} finally {
				this.isStatisticsLoading = false;
			}
		},

		async fetchProject() {
			this.isProjectLoading = true;

			await ProjectService.getDetailOfProject(
				this.$route.params.projectId,
			).then(({ data }) => {
				this.project = data;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Assistance")} ${e}`, "is-danger");
			}).finally(() => {
				this.isProjectLoading = false;
			});
		},

		onRowsCheck(rows) {
			this.setAtDistributedButtonVisible = !!rows?.length;
			this.selectedBeneficiaries = rows;
		},

		async setGeneralReliefItemAsDistributed() {
			let error = "";
			let success = "";

			if (this.selectedBeneficiaries?.length) {
				this.setAtDistributedButtonLoading = true;

				await Promise.all(this.selectedBeneficiaries.map(async (beneficiary) => {
					const body = beneficiary.reliefPackageIds?.map((id) => ({
						id, dateDistributed: new Date().toISOString(),
					}));

					try {
						const { status } = await AssistancesService.updateReliefPackage(body);

						if (status === 200) {
							success += `${this.$t("Success for Beneficiary")} ${beneficiary.id}. `;
						}
					} catch (e) {
						error += `${this.$t("Error for Beneficiary")} ${beneficiary.id} ${e}. `;
					}
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

		openInputDistributedModal() {
			this.inputDistributedModal.isOpened = true;
		},

		closeInputDistributedModal() {
			this.inputDistributedModal.isOpened = false;
		},

		async startTransaction() {
			const now = new Date().toISOString();
			const dateOfDistribution = this.assistance.dateDistribution;
			const isAfter = this.$moment(now).isAfter(dateOfDistribution);

			if (isAfter) {
				this.startTransactionButtonLoading = true;

				try {
					const { status } = await AssistancesService.sendVerificationEmailForTransactions(
						this.$route.params.assistanceId,
					);

					if (status === 204) {
						this.transactionModal.isOpened = true;
					}
				} catch (e) {
					if (e.message) Notification(`${this.$t("Start Transaction")} ${e}`, "is-danger");
				}
				this.startTransactionButtonLoading = false;
			} else {
				Notification(`${this.$t("Date of the assistance is in the future")}.`, "is-danger");
			}
		},

		async confirmTransaction(code) {
			this.transactionModal.isWaiting = true;

			const body = {
				code,
			};

			try {
				const { status } = await AssistancesService.createTransactionsForBeneficiaries(
					this.$route.params.assistanceId,
					body,
				);

				if (status === 204) {
					Toast(this.$t("Successful Transaction"), "is-success");

					await this.$refs.beneficiariesList.fetchData();
					await this.fetchAssistanceStatistics();
				}
			} catch (e) {
				if (e.message) Notification(`${this.$t("Transactions")} ${e}`, "is-danger");
			}

			this.transactionModal.isWaiting = false;
			this.closeTransactionModal();
		},

		unvalidateAssistance() {
			this.$buefy.dialog.confirm({
				title: this.$t("Unvalidate Assistance"),
				message: this.$t("Please be sure that no field activity has been started. Do you really want to unvalidate assistance?"),
				confirmText: this.$t("Confirm"),
				cancelText: this.$t("Cancel"),
				type: "is-primary",
				onConfirm: async () => {
					const { assistanceId, projectId } = this.$route.params;

					try {
						const { status } = await AssistancesService.updateAssistanceStatusValidated(
							{ assistanceId, validated: false },
						);

						if (status === 200) {
							Toast(this.$t("Assistance Successfully Unvalidated"), "is-success");

							await this.$router.push({
								name: "AssistanceEdit",
								params: { assistanceId, projectId },
							});
						}
					} catch (e) {
						if (e.message) Toast(`${this.$t("Assistance")} ${e}`, "is-danger");
					}
				},
			});
		},

		closeAssistance() {
			this.$buefy.dialog.confirm({
				title: this.$t("Close Assistance"),
				message: this.$t("Are you sure you want to close this Assistance?"),
				confirmText: this.$t("Confirm"),
				cancelText: this.$t("Cancel"),
				type: "is-primary",
				onConfirm: async () => {
					const assistanceId = Number(this.$route.params.assistanceId);

					try {
						const { status } = await AssistancesService.updateAssistanceToStatusCompleted(
							{ assistanceId, completed: true },
						);

						if (status === 200) {
							Toast(this.$t("Assistance Successfully Closed"), "is-success");
							await this.$router.push({
								name: "Project",
								params: { projectId: this.$route.params.projectId },
							});
						}
					} catch (e) {
						if (e.message) Toast(`${this.$t("Assistance")} ${e}`, "is-danger");
					}
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
