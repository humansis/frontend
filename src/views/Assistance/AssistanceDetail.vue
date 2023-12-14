<template>
	<v-container fluid>
		<Modal
			v-model="inputDistributedModal.isOpened"
			header="Input Distributed"
		>
			<InputDistributed
				close-button
				class="modal-card"
				@submit="fetchBeneficiariesAndStatistics"
				@close="closeInputDistributedModal"
			/>
		</Modal>

		<Modal
			v-model="transactionModal.isOpened"
			header="Start Transaction"
		>
			<StartTransactionForm
				close-button
				submit-button-label="Confirm"
				class="modal-card"
				@formSubmitted="confirmTransaction"
				@formClosed="closeTransactionModal"
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

		<div
			v-if="!isAssistanceLoading"
			class="ma-6"
		>
			<div class="text-center mb-3">
				<div class="text-h6">
					{{ $t(distributionOrActivity) }}:
					<strong>{{ assistanceProgress }} %</strong>
				</div>
			</div>

			<v-progress-linear
				v-model="assistanceProgress"
				color="green"
				height="20"
				rounded
			>
				<template v-slot:default="{ value }">
					<strong>{{ value }}%</strong>
				</template>
			</v-progress-linear>
		</div>

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
			@assistanceUpdated="fetchAssistanceData"
			@fetchAssistanceStatistics="fetchAssistanceStatistics"
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
				@actionConfirmed="closeAssistance"
			/>

			<v-btn
				v-if="isDistributedButtonVisible"
				:loading="setAtDistributedButtonLoading"
				color="primary"
				size="small"
				variant="elevated"
				prepend-icon="parachute-box"
				class="text-none ml-3"
				@click="setGeneralReliefItemAsDistributed"
			>
				{{ $t(setAtDistributedButtonLabel) }}
			</v-btn>

			<v-btn
				v-if="isInputDistributedButtonVisible"
				color="primary"
				size="small"
				variant="elevated"
				prepend-icon="parachute-box"
				class="text-none ml-3"
				@click="openInputDistributedModal"
			>
				{{ $t("Input Distributed") }}
			</v-btn>

			<v-btn
				v-if="isStartTransactionButtonVisible"
				:loading="startTransactionButtonLoading"
				color="primary"
				size="small"
				variant="elevated"
				prepend-icon="parachute-box"
				class="text-none ml-3"
				@click="startTransaction"
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

			AssistancesService.getDetailOfAssistance(
				this.$route.params.assistanceId,
			).then((data) => {
				this.assistance = data;

				if (this.assistance.type === ASSISTANCE.TYPE.DISTRIBUTION) {
					this.commodities = data.commodities;
				}
			}).catch((e) => {
				Notification(`${this.$t("Assistance")} ${e.message || e}`, "error");
			}).finally(() => {
				this.isAssistanceLoading = false;
			});
		},

		async fetchAssistanceStatistics() {
			this.isStatisticsLoading = true;

			AssistancesService.getAssistanceStatistics(
				this.$route.params.assistanceId,
			).then((data) => {
				this.statistics = data;
			}).catch((e) => {
				Notification(`${this.$t("Assistance Statistics")} ${e.message || e}`, "error");
			}).finally(() => {
				this.isStatisticsLoading = false;
			});
		},

		async fetchProject() {
			this.isProjectLoading = true;

			await ProjectService.getDetailOfProject(
				this.$route.params.projectId,
			).then(({ data }) => {
				this.project = data;
			}).catch((e) => {
				Notification(`${this.$t("Assistance")} ${e.message || e}`, "error");
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
					const body = beneficiary.reliefPackages?.map(({ id }) => ({
						id, dateDistributed: new Date().toISOString(),
					}));

					await AssistancesService.updateReliefPackage(body).then(({ status }) => {
						if (status === 200) {
							success += `${this.$t("Success for Beneficiary")} ${beneficiary.id}. `;
						}
					}).catch((e) => {
						error += `${this.$t("Error for Beneficiary")} ${beneficiary.id} ${e.message || e}. `;
					});
				}));

				if (error) Notification(error, "error");
				if (success) Notification(success, "success");

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

				await AssistancesService
					.sendVerificationEmailForTransactions(this.$route.params.assistanceId)
					.then((response) => {
						if (response.status === 204) this.transactionModal.isOpened = true;
					})
					.catch((e) => {
						Notification(`${this.$t("Start Transaction")} ${e.message || e}`, "error");
					});

				this.startTransactionButtonLoading = false;
			} else {
				Notification(
					`${this.$t("Date of the assistance is in the future")}.`,
					"error",
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
					Notification(this.$t("Successful Transaction"), "success");

					this.$refs.beneficiariesList.fetchData();
					this.fetchAssistanceStatistics();
				}
			}).catch((e) => {
				Notification(`${this.$t("Transactions")} ${e.message || e}`, "error");
			});

			this.transactionModal.isWaiting = false;
			this.closeTransactionModal();
		},

		unvalidateAssistance() {
			// FIXME
			this.$buefy.dialog.confirm({
				title: this.$t("Unvalidate Assistance"),
				message: this.$t("Please be sure that no field activity has been started. Do you really want to unvalidate assistance?"),
				confirmText: this.$t("Confirm"),
				cancelText: this.$t("Cancel"),
				type: "is-primary",
				onConfirm: async () => {
					const { assistanceId, projectId } = this.$route.params;

					await AssistancesService.updateAssistanceStatusValidated(
						{ assistanceId, validated: false },
					).then(({ status }) => {
						if (status === 200) {
							Notification(this.$t("Assistance Successfully Unvalidated"), "success");

							this.$router.push({
								name: "AssistanceEdit",
								params: { assistanceId, projectId },
							});
						}
					}).catch((e) => {
						Notification(`${this.$t("Assistance")} ${e.message || e}`, "error");
					});
				},
			});
		},

		async closeAssistance() {
			const assistanceId = Number(this.$route.params.assistanceId);

			await AssistancesService.updateAssistanceToStatusCompleted(
				{ assistanceId, completed: true },
			).then(({ status }) => {
				if (status === 200) {
					Notification(this.$t("Assistance Successfully Closed"), "success");
					this.$router.push({ name: "Project",
						params: { projectId: this.$route.params.projectId },
					});
				}
			}).catch((e) => {
				Notification(`${this.$t("Assistance")} ${e.message || e}`, "error");
			});
		},
	},
};
</script>
