<template>
	<div>
		<div class="import-name mb-3">
			<h1 class="title">
				{{ importTitle }}
			</h1>
			<span class="title dot">•</span>
			<h2 class="subtitle has-text-weight-bold mt-3">
				{{ importProject }}
			</h2>
		</div>
		<p
			v-if="importDescription"
			class="has-text-centered mb-4"
		>
			{{ importDescription }}
		</p>
		<div class="has-text-centered mb-3">
			<b-tag
				v-if="importStatus"
				class="has-text-weight-bold"
				size="is-medium"
				:type="importStatusType"
			>
				<div class="import-status">
					<p>{{ $t(importStatus) }}</p>
					<Loading
						v-if="isBusyIndicator"
						type="bubbles"
						is-small
						class="subtitle"
						color="#fff"
					/>
				</div>
			</b-tag>
		</div>
		<b-field class="mb-5" grouped position="is-centered">
			<b-icon v-if="stateTips" icon="info-circle" />
			<p>{{ stateTips }}</p>
		</b-field>

		<b-steps
			v-model="activeStep"
			ref="importSteps"
			animated
			rounded
			:has-navigation="false"
		>
			<b-step-item step="1" :label="$t('Start')" :clickable="false">
				<StartStep
					:importFiles="importFiles"
					:status="importStatus"
					:loading-change-state-button="loadingChangeStateButton"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
					@moveStepForward="changeTab(1)"
					@fetchStatistics="fetchImportStatistics"
				/>
			</b-step-item>

			<b-step-item step="2" :label="$t('Integrity Check')" :clickable="false">
				<IntegrityStep
					:statistics="statistics"
					:status="importStatus"
					:importFiles="importFiles"
					:loading-change-state-button="loadingChangeStateButton"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
				/>
			</b-step-item>

			<b-step-item step="3" :label="$t('Identity Check')" :clickable="false">
				<IdentityStep
					:statistics="statistics"
					:status="importStatus"
					:loading-change-state-button="loadingChangeStateButton"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
					@updated="fetchImportStatistics"
					@goToFinalStep="goToFinalStep"
				/>
			</b-step-item>

			<!--
			<b-step-item step="4" :label="$t('Similarity Check')" :clickable="false">
				<SimilarityStep
					:statistics="statistics"
					:status="importStatus"
					:loading-change-state-button="loadingChangeStateButton"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
					@goToFinalStep="goToFinalStep"
					@updated="fetchImportStatistics"
				/>
			</b-step-item>
			-->

			<b-step-item step="4" :label="$t('Finalisation')" :clickable="false">
				<FinalisationStep
					:statistics="statistics"
					:status="importStatus"
					:loading-change-state-button="loadingChangeStateButton"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
				/>
			</b-step-item>
		</b-steps>
	</div>
</template>

<script>
import StartStep from "@/components/Imports/StartStep";
import IntegrityStep from "@/components/Imports/IntegrityStep";
import IdentityStep from "@/components/Imports/IdentityStep";
import FinalisationStep from "@/components/Imports/FinalisationStep";
import { Notification, Toast } from "@/utils/UI";
import ImportService from "@/services/ImportService";
import consts from "@/utils/importConst";
import Loading from "@/components/Loading";

export default {
	name: "Import",

	components: {
		StartStep,
		IntegrityStep,
		IdentityStep,
		FinalisationStep,
		Loading,
	},

	data() {
		return {
			importDetail: {},
			statistics: {},
			projects: [],
			loadingChangeStateButton: false,
			statisticsInterval: null,
			importFiles: [],
			activeStep: 0,
			columnsError: 0,
			steps: [
				{ code: 0, slug: "start-import" },
				{ code: 1, slug: "integrity-check" },
				{ code: 2, slug: "identity-check" },
				{ code: 3, slug: "finalisation" },
			],
			tips: [
				{
					status: consts.STATUS.UPLOADING,
					message: "You can leave import page, Humansis will notify You by email once ready.",
				},
				{
					status: consts.STATUS.INTEGRITY_CHECK,
					message: "You can leave import page, Humansis will notify You by email once ready.",
				},
				{
					status: consts.STATUS.INTEGRITY_CHECK_CORRECT,
					message: "Please start identity check.",
				},
				{
					status: consts.STATUS.INTEGRITY_CHECK_FAILED,
					message: "Please download affected records and upload corrected records back.",
				},
				{
					status: consts.STATUS.IDENTITY_CHECK,
					message: "You can leave import page, Humansis will notify You by email once ready.",
				},
				{
					status: consts.STATUS.IDENTITY_CHECK_CORRECT,
					message: ["Please Go to finalization", "Please approve and start import"],
				},
				{
					status: consts.STATUS.IDENTITY_CHECK_FAILED,
					message: "Please manage duplicities, i.e. decide which data to use.",
				},
				{
					status: consts.STATUS.IMPORTING,
					message: "You can leave import page, Humansis will notify You by email once ready.",
				},
				{
					status: consts.STATUS.FINISH,
					message: "Import is finished.",
				},
				{
					status: consts.STATUS.CANCEL,
					message: "Import was canceled.",
				},
			],
		};
	},

	computed: {
		importTitle() {
			return this.importDetail?.title || "";
		},

		importStatus() {
			return this.statistics?.status || "";
		},

		importDescription() {
			return this.importDetail?.description || "";
		},

		importProject() {
			return this.importDetail.projects?.map(({ name }) => name).join(", ") || [];
		},

		importStatusType() {
			let result = "";

			switch (this.importStatus) {
				case consts.STATUS.CANCEL:
				case consts.STATUS.IMPORTING:
					result = "is-warning";
					break;
				case consts.STATUS.FINISH:
				case consts.STATUS.INTEGRITY_CHECK_CORRECT:
				case consts.STATUS.IDENTITY_CHECK_CORRECT:
				case consts.STATUS.SIMILARITY_CHECK_CORRECT:
					result = "is-success";
					break;
				case consts.STATUS.INTEGRITY_CHECK_FAILED:
				case consts.STATUS.IDENTITY_CHECK_FAILED:
				case consts.STATUS.SIMILARITY_CHECK_FAILED:
					result = "is-danger";
					break;
				case consts.STATUS.NEW:
				case consts.STATUS.INTEGRITY_CHECK:
				case consts.STATUS.IDENTITY_CHECK:
				case consts.STATUS.SIMILARITY_CHECK:
				default:
					result = "is-info";
			}

			return result;
		},

		integrityStepHasError() {
			if (this.importStatus === consts.STATUS.INTEGRITY_CHECK_CORRECT
				&& this.importStatus === consts.STATUS.INTEGRITY_CHECK_FAILED
				&& this.importStatus === consts.STATUS.INTEGRITY_CHECK) {
				return this.statistics.amountIntegrityFailed;
			}

			return false;
		},

		identityStepHasError() {
			if (this.importStatus === consts.STATUS.IDENTITY_CHECK_CORRECT
				&& this.importStatus === consts.STATUS.IDENTITY_CHECK_FAILED
				&& this.importStatus === consts.STATUS.IDENTITY_CHECK
				&& this.importStatus === consts.STATUS.SIMILARITY_CHECK_CORRECT
				&& this.importStatus === consts.STATUS.SIMILARITY_CHECK_FAILED
				&& this.importStatus === consts.STATUS.SIMILARITY_CHECK) {
				return this.statistics.amountDuplicities || this.columnsError;
			}

			return false;
		},

		stateTips() {
			console.log(this.importStatus);
			const stateTip = this.tips.find((tip) => tip.status === this.importStatus);

			if (stateTip && stateTip.status === consts.STATUS.IDENTITY_CHECK_CORRECT) {
				return this.activeStep === 3 ? stateTip.message[1] : stateTip.message[0];
			}

			return stateTip ? this.$t(stateTip.message) : "";
		},

		isBusyIndicator() {
			return this.importStatus === consts.STATUS.UPLOADING
				|| this.importStatus === consts.STATUS.INTEGRITY_CHECK
				|| this.importStatus === consts.STATUS.IDENTITY_CHECK
				|| this.importStatus === consts.STATUS.IMPORTING;
		},
	},

	async created() {
		this.fetchData();
		const currentStep = this.steps.find((step) => this.$route.query?.step === step?.slug);
		this.activeStep = currentStep?.code || 0;
	},

	beforeDestroy() {
		clearInterval(this.statisticsInterval);
	},

	methods: {
		changeTab(data) {
			const { slug, code } = this.steps.find((step) => step.code === data);

			if (this.$route.query.step !== slug) {
				this.$router.replace({
					name: "Import",
					params: { importId: this.$route.params.importId },
					query: { step: slug },
				});
			}

			this.activeStep = code;
		},

		fetchData() {
			const { importId } = this.$route.params;

			if (importId) {
				this.fetchImport(importId);
				this.fetchImportFiles(importId);
				this.fetchImportStatistics();
				this.setCheckingInterval();
			} else {
				clearInterval(this.statisticsInterval);
			}
		},

		setCheckingInterval() {
			if (
				this.importDetail?.status !== consts.STATUS.NEW
				&& this.importDetail?.status !== consts.STATUS.CANCEL
				&& this.importDetail?.status !== consts.STATUS.FINISH
			) {
				this.statisticsInterval = setInterval(() => {
					this.fetchImportStatistics();
					this.fetchImportFiles();
				}, 5000);
			}
		},

		fetchImportFiles() {
			const { importId } = this.$route.params;

			if (importId) {
				ImportService.getFilesInImport(importId)
					.then(({ data: { data } }) => {
						this.importFiles = data;
						this.checkImportFiles(data);
					}).catch((e) => {
						if (e.message) {
							Notification(
								`${this.$t("Import Files")} ${e}`,
								"is-danger",
							);
						}
					});
			}
		},

		checkImportFiles(data) {
			let columnsError = 0;

			data.forEach((file) => {
				const { missingColumns = [], violations = [] } = file || {};
				columnsError += missingColumns?.length ?? 0;
				columnsError += violations?.length ?? 0;
			});

			this.columnsError = columnsError;
		},

		fetchImport(importId) {
			ImportService.getDetailOfImport(importId).then(({ data }) => {
				this.importDetail = data;
				this.stepsRedirect(data.status);
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Import")} ${e}`, "is-danger");
			});
		},

		fetchImportStatistics() {
			const { importId } = this.$route.params;

			if (importId) {
				ImportService.getStatisticsInImport(importId).then(({ data }) => {
					this.statistics = data;
				});
			}
		},

		stepsRedirect(status) {
			switch (status) {
				case consts.STATUS.CANCEL:
				case consts.STATUS.IMPORTING:
				case consts.STATUS.FINISH:
					this.changeTab(3);
					break;

				case consts.STATUS.SIMILARITY_CHECK_CORRECT:
				case consts.STATUS.SIMILARITY_CHECK_FAILED:
				case consts.STATUS.SIMILARITY_CHECK:
					this.changeTab(3);
					break;

				case consts.STATUS.IDENTITY_CHECK_FAILED:
				case consts.STATUS.IDENTITY_CHECK_CORRECT:
				case consts.STATUS.IDENTITY_CHECK:
					this.changeTab(2);
					break;

				case consts.STATUS.INTEGRITY_CHECK_CORRECT:
				case consts.STATUS.INTEGRITY_CHECK_FAILED:
				case consts.STATUS.INTEGRITY_CHECK:
					this.changeTab(1);
					break;

				case consts.STATUS.NEW:
				default:
					this.changeTab(0);
			}
		},

		onCancelImport() {
			this.$buefy.dialog.confirm({
				title: this.$t("Cancel Import"),
				message: this.$t("Are you sure you want to cancel this import?"),
				confirmText: this.$t("Confirm"),
				cancelText: this.$t("Cancel"),
				type: "is-danger",
				hasIcon: true,
				onConfirm: () => {
					this.cancelImport();
				},
			});
		},

		onChangeImportState({
			state,
			successMessage,
			goNext,
			withConfirm = true,
		}) {
			if ((this.integrityStepHasError || this.identityStepHasError) && withConfirm) {
				this.$buefy.dialog.confirm({
					title: this.$t("Continue"),
					message: this.$t("Are you sure you want to ignore errors and proceed?"),
					confirmText: this.$t("Confirm"),
					cancelText: this.$t("Cancel"),
					type: "is-warning",
					hasIcon: true,
					onConfirm: () => {
						this.changeImportState(state, successMessage, goNext);
						this.columnsError = 0;
					},
				});
			} else {
				this.changeImportState(state, successMessage, goNext);
			}
		},

		changeImportState(state, successMessage, goNext) {
			const { importId } = this.$route.params;
			this.loadingChangeStateButton = true;

			ImportService.changeImportState(importId, { status: state })
				.then(({ status, message }) => {
					if (status === 202) {
						if (state === consts.STATE.CANCELED) {
							Toast(this.$t("Import Canceled"), "is-success");
							this.changeTab(3);
						}

						if (this.$route.name === "Import") {
							Toast(this.$t(successMessage), "is-success");

							if (state !== consts.STATE.FINISHED
							&& state !== consts.STATE.IMPORTING
							&& state !== consts.STATE.CANCELED) {
								if (goNext) this.changeTab(this.activeStep + 1);
							}
						}
					} else if (status >= 400 && status <= 500) {
						Notification(message, "is-warning");
					}
				}).catch((e) => {
					if (e.message) {
						const type = state === consts.STATE.IMPORTING ? "is-warning" : "is-danger";
						Notification(`${this.$t("Import")} ${e}`, type);
					}
				}).finally(() => {
					this.loadingChangeStateButton = false;
					this.fetchImportStatistics();
					this.fetchImportFiles();
				});
		},

		goToFinalStep() {
			if (this.statistics.amountDuplicities) {
				this.$buefy.dialog.confirm({
					title: this.$t("Continue"),
					message: this.$t("Are you sure you want to ignore errors and proceed?"),
					confirmText: this.$t("Confirm"),
					cancelText: this.$t("Cancel"),
					type: "is-warning",
					hasIcon: true,
					onConfirm: () => {
						this.changeTab(3);
					},
				});
			} else {
				this.changeTab(3);
			}
		},

		async cancelImport() {
			await this.changeImportState(
				consts.STATE.CANCELED,
				"Canceled Successfully",
				true,
			);

			await this.fetchData();
		},
	},
};
</script>

<style lang="scss" scoped>
.description-edit-button {
	margin-top: -.2rem;
}

.description-edit-area textarea {
	text-align: center;
}

.import-status {
	display: flex;
	align-items: center;
}

.import-name {
	display: flex;
	justify-content: center;
	gap: 0.5rem;

	.dot {
		display: flex;
		align-items: center;
	}
}
</style>
