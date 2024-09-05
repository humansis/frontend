<template>
	<v-container fluid>
		<Modal
			v-model="inputDistributedModal.isOpened"
			header="Input Distributed"
		>
			<InputDistributed
				close-button
				@submit="onFetchBeneficiariesAndStatistics"
				@close="onCloseInputDistributedModal"
			/>
		</Modal>

		<Modal
			v-model="transactionModal.isOpened"
			header="Start Transaction"
		>
			<StartTransactionForm
				close-button
				submit-button-label="Confirm"
				@formSubmitted="onConfirmTransaction"
				@formClosed="onCloseTransactionModal"
			/>
		</Modal>

		<AssistanceSummary
			:assistance="assistance"
			:is-statistics-loading="isStatisticsLoading"
			:statistics="statistics"
			:is-assistance-loading="isAssistanceLoading"
			:commodities="commodities"
			:project="project"
			:is-project-loading="isProjectLoading"
		/>

		<EditNote :assistance="assistance" />

		<v-tooltip
			v-if="!isAssistanceLoading"
			:text="progressTooltip"
			location="top"
			content-class="tooltip-top"
		>
			<template v-slot:activator="{ props }">
				<div v-bind="props" class="ma-6">
					<div class="text-center text-h6 mb-3">
						{{ $t(distributionOrActivity) }}:

						<strong>{{ assistanceProgress }} %</strong>
					</div>

					<v-progress-linear
						v-model="assistanceProgress"
						color="green"
						height="20"
						rounded
					>
						<template v-slot:default>
							<strong>{{ assistanceProgress }}%</strong>
						</template>
					</v-progress-linear>
				</div>
			</template>
		</v-tooltip>

		<BeneficiariesList
			ref="beneficiariesList"
			:add-button="isAddButtonVisible"
			:commodities="commodities"
			:assistance="assistance"
			:project="project"
			:is-not-distributed-available="isNotDistributedAvailable"
			export-button
			assistance-detail
			@beneficiariesCounted="beneficiariesCount = $event"
			@rowsChecked="onRowsCheck"
			@assistanceUpdated="onFetchAssistanceData"
			@fetchAssistanceStatistics="onFetchAssistanceStatistics"
		/>

		<div class="d-flex justify-end mt-5">
			<ButtonAction
				v-if="isAssistanceValidated && !isAssistanceCompleted"
				:is-only-icon="false"
				label="Close and Approve"
				icon="check"
				confirmButtonColor="primary"
				close-button-name="Cancel"
				confirm-button-name="Confirm"
				icon-color="red"
				confirm-title="Close Assistance"
				confirm-message="Are you sure you want to close this Assistance?"
				is-confirm-action
				default-button
				@actionConfirmed="onCloseAssistance"
			/>

			<v-btn
				v-if="isDistributedButtonVisible"
				:loading="setAtDistributedButtonLoading"
				color="primary"
				variant="elevated"
				prepend-icon="parachute-box"
				class="text-none ml-3"
				@click="onSetGeneralReliefItemAsDistributed"
			>
				{{ $t(setAtDistributedButtonLabel) }}
			</v-btn>

			<v-btn
				v-if="isInputDistributedButtonVisible"
				color="primary"
				variant="elevated"
				prepend-icon="parachute-box"
				class="text-none ml-3"
				@click="onOpenInputDistributedModal"
			>
				{{ $t("Input Distributed") }}
			</v-btn>

			<v-btn
				v-if="isStartTransactionButtonVisible"
				:loading="startTransactionButtonLoading"
				color="primary"
				variant="elevated"
				prepend-icon="parachute-box"
				class="text-none ml-3"
				@click="onStartTransaction"
			>
				{{ $t("Start Transaction") }} ({{ beneficiariesCount }})
			</v-btn>
		</div>
	</v-container>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import ProjectService from "@/services/ProjectService";
import AssistanceSummary from "@/components/Assistance/AssistanceSummary";
import BeneficiariesList from "@/components/Assistance/BeneficiariesList";
import StartTransactionForm from "@/components/Assistance/BeneficiariesList/StartTransactionForm";
import InputDistributed from "@/components/Assistance/InputDistributed";
import ButtonAction from "@/components/ButtonAction";
import EditNote from "@/components/Inputs/EditNote";
import Modal from "@/components/Inputs/Modal";
import permissions from "@/mixins/permissions";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";

export default {
	name: "AssistanceDetail",

	components: {
		StartTransactionForm,
		InputDistributed,
		BeneficiariesList,
		AssistanceSummary,
		EditNote,
		ButtonAction,
		Modal,
	},

	mixins: [permissions],

	data() {
		return {
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
			if (this.assistance?.type === ASSISTANCE.TYPE.DISTRIBUTION) {
				return this.commodities?.[0]?.unit || "";
			}

			if (this.assistance?.type === ASSISTANCE.TYPE.ACTIVITY) return "Activity";

			return "";
		},

		startTransactionButtonVisible() {
			return this.commodities[0]?.modalityType === ASSISTANCE.COMMODITY.MOBILE_MONEY;
		},

		isCommoditySmartcard() {
			return this.commodities[0]?.modalityType === ASSISTANCE.COMMODITY.SMARTCARD;
		},

		inputDistributedButtonVisible() {
			const modality = this.commodities[0]?.modalityType;

			return !this.isCommoditySmartcard
				&& modality !== ASSISTANCE.COMMODITY.QR_CODE_VOUCHER
				&& modality !== ASSISTANCE.COMMODITY.MOBILE_MONEY;
		},

		setAtDistributedButtonLabel() {
			if (this.assistance?.type === ASSISTANCE.TYPE.DISTRIBUTION) return "Set As Distributed";
			if (this.assistance?.type === ASSISTANCE.TYPE.ACTIVITY) return "Set As Completed";
			return "";
		},

		distributionOrActivity() {
			if (this.assistance?.type === ASSISTANCE.TYPE.DISTRIBUTION) return "Distribution Progress";
			if (this.assistance?.type === ASSISTANCE.TYPE.ACTIVITY) return "Activity Progress";
			return "";
		},

		distributedOrCompleted() {
			if (this.assistance?.type === ASSISTANCE.TYPE.DISTRIBUTION) return "Distributed";
			if (this.assistance?.type === ASSISTANCE.TYPE.ACTIVITY) return "Completed";
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

		isAssistanceTargetHousehold() {
			return this.assistance.target === ASSISTANCE.TARGET.HOUSEHOLD;
		},

		isAssistanceTargetIndividual() {
			return this.assistance.target === ASSISTANCE.TARGET.INDIVIDUAL;
		},

		isAssistanceTargetInstitution() {
			return this.assistance.target === ASSISTANCE.TARGET.INSTITUTION;
		},

		modalityType() {
			return this.commodities?.[0]?.modalityType;
		},

		beneficiariesReached() {
			return this.statistics?.beneficiariesReached;
		},

		beneficiariesTotal() {
			return this.statistics?.beneficiariesTotal || 0;
		},

		beneficiariesDeleted() {
			return this.statistics?.beneficiariesDeleted || 0;
		},

		assistanceProgress() {
			const progress = this.statistics?.progress || 0;

			return parseFloat((progress * 100).toFixed(2));
		},

		progressTooltip() {
			return this.$t(
				`Distribution progress: {progress} % based on {beneficiariesReached} / {beneficiariesTotal} BNFs reached.`,
				{
					progress: this.assistanceProgress,
					beneficiariesReached: this.beneficiariesReached,
					beneficiariesTotal: this.beneficiariesTotal - this.beneficiariesDeleted,
				},
			);
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

		isNotDistributedAvailable() {
			return (this.isAssistanceValidated || this.isAssistanceCompleted)
				&& (this.isAssistanceTargetHousehold || this.isAssistanceTargetIndividual)
				&& this.userCan.assignDistributionItems
				&& !this.isCommoditySmartcard;
		},

		isInputDistributedButtonVisible() {
			return this.isAssistanceStateValidated
				&& this.userCan.assignDistributionItems
				&& this.inputDistributedButtonVisible
				&& !this.isAssistanceTargetInstitution;
		},

		isStartTransactionButtonVisible() {
			return this.isAssistanceStateValidated
				&& this.userCan.authoriseElectronicCashTransfer
				&& this.startTransactionButtonVisible;
		},
	},

	mounted() {
		this.fetchAssistance();
		this.onFetchAssistanceStatistics();
		this.fetchProject();
	},

	methods: {
		onFetchAssistanceData() {
			this.fetchAssistance();
			this.onFetchAssistanceStatistics();
		},

		onFetchBeneficiariesAndStatistics() {
			this.$refs.beneficiariesList.fetchData();
			this.onFetchAssistanceStatistics();
		},

		async fetchAssistance() {
			try {
				this.isAssistanceLoading = true;

				const {
					data,
					status,
					message,
				} = await AssistancesService.getDetailOfAssistance(
					this.$route.params.assistanceId,
				);

				checkResponseStatus(status, message);

				this.assistance = data;

				if (this.assistance.type === ASSISTANCE.TYPE.DISTRIBUTION) {
					this.commodities = data.commodities;
				}
			} catch (e) {
				Notification(`${this.$t("Assistance")}: ${e.message || e}`, "error");
			} finally {
				this.isAssistanceLoading = false;
			}
		},

		async onFetchAssistanceStatistics() {
			try {
				this.isStatisticsLoading = true;

				const {
					data,
					status,
					message,
				} = await AssistancesService.getAssistanceStatistics(
					this.$route.params.assistanceId,
				);

				checkResponseStatus(status, message);

				this.statistics = data;
			} catch (e) {
				Notification(`${this.$t("Assistance Statistics")}: ${e.message || e}`, "error");
			} finally {
				this.isStatisticsLoading = false;
			}
		},

		async fetchProject() {
			try {
				this.isProjectLoading = true;

				const {
					data,
					status,
					message,
				} = await ProjectService.getDetailOfProject(
					this.$route.params.projectId,
				);

				checkResponseStatus(status, message);

				this.project = data;
			} catch (e) {
				Notification(`${this.$t("Assistance")}: ${e.message || e}`, "error");
			} finally {
				this.isProjectLoading = false;
			}
		},

		onRowsCheck(rows) {
			this.setAtDistributedButtonVisible = !!rows?.length;
			this.selectedBeneficiaries = rows;
		},

		async onSetGeneralReliefItemAsDistributed() {
			if (this.selectedBeneficiaries?.length) {
				try {
					this.setAtDistributedButtonLoading = true;

					const distributedBeneficiaries = this.selectedBeneficiaries.flatMap(
						(beneficiary) => beneficiary.reliefPackages?.map(({ id }) => (
							{
								id,
								dateDistributed: new Date().toISOString(),
							}
						)) || [],
					);

					const { data, status, message } = await AssistancesService.updateReliefPackage(
						distributedBeneficiaries,
					);

					checkResponseStatus(status, message);

					this.prepareDistributedNotification(data);
				} catch (e) {
					Notification(`${this.$t("Distribution")}: ${e.message || e}`, "error");
				} finally {
					this.setAtDistributedButtonVisible = false;

					await this.$refs.beneficiariesList.fetchData();
					await this.onFetchAssistanceStatistics();

					this.setAtDistributedButtonLoading = false;
				}
			}
		},

		async prepareDistributedNotification(distributionResponse) {
			const {
				successfullyDistributed,
				alreadyDistributed,
				partiallyDistributed,
				conflicts,
				notFound,
				failed,
			} = distributionResponse;

			if (successfullyDistributed.length || alreadyDistributed.length) {
				const successMessage = [];

				if (successfullyDistributed.length) {
					successMessage.push(`${successfullyDistributed.length} beneficiaries were marked as distributed`);
				}

				if (alreadyDistributed.length) {
					successMessage.push(`${alreadyDistributed.length} beneficiaries were already marked as distributed`);
				}

				await this.$nextTick();
				Notification(`${this.$t("Distribution")}: ${this.$t(successMessage.join(" and "))}`, "success");
			}

			if (partiallyDistributed.length || conflicts.length || notFound.length) {
				const warningMessage = [];

				if (partiallyDistributed.length) {
					warningMessage.push(`${partiallyDistributed.length} beneficiaries were partially distributed`);
				}

				if (conflicts.length) {
					warningMessage.push(`${conflicts.length} beneficiaries were with conflict`);
				}

				if (notFound.length) {
					warningMessage.push(`${notFound.length} beneficiaries were not found`);
				}

				await this.$nextTick();
				Notification(`${this.$t("Distribution")}: ${this.$t(warningMessage.join(" and "))}`, "warning");
			}

			if (failed.length) {
				const errorMessage = `${failed.length} beneficiaries were failed`;

				await this.$nextTick();
				Notification(`${this.$t("Distribution")}: ${this.$t(errorMessage)}`, "error");
			}
		},

		onCloseTransactionModal() {
			this.transactionModal.isOpened = false;
		},

		onOpenInputDistributedModal() {
			this.inputDistributedModal.isOpened = true;
		},

		onCloseInputDistributedModal() {
			this.inputDistributedModal.isOpened = false;
		},

		async onStartTransaction() {
			const now = new Date().toISOString();
			const dateOfDistribution = this.assistance.dateDistribution;
			const isAfter = this.$moment(now).isAfter(dateOfDistribution);

			if (!isAfter) return;

			try {
				this.startTransactionButtonLoading = true;

				const { status, message } = await AssistancesService
					.sendVerificationEmailForTransactions(this.$route.params.assistanceId);

				checkResponseStatus(status, message, 204);

				this.transactionModal.isOpened = true;
			} catch (e) {
				Notification(`${this.$t("Start Transaction")}: ${e.message || e}`, "error");
			} finally {
				this.startTransactionButtonLoading = false;
			}
		},

		async onConfirmTransaction(code) {
			try {
				this.transactionModal.isWaiting = true;

				const {
					status,
					message,
				} = await AssistancesService.createTransactionsForBeneficiaries(
					this.$route.params.assistanceId,
					{ code },
				);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Successful Transaction"), "success");

				await this.$refs.beneficiariesList.fetchData();
				await this.onFetchAssistanceStatistics();
			} catch (e) {
				Notification(`${this.$t("Transactions")}: ${e.message || e}`, "error");
			} finally {
				this.transactionModal.isWaiting = false;
				this.onCloseTransactionModal();
			}
		},

		async onCloseAssistance() {
			const assistanceId = Number(this.$route.params.assistanceId);

			try {
				const {
					status,
					message,
				} = await AssistancesService.updateAssistanceToStatusCompleted({
					assistanceId,
					completed: true,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("Assistance Successfully Closed"), "success");
				this.$router.push({ name: "Project",
					params: { projectId: this.$route.params.projectId },
				});
			} catch (e) {
				Notification(`${this.$t("Assistance")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
