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
					:is-import-loaded="isImportLoaded"
					:is-bad-file-version="isBadVersionOfExportFile"
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
import Loading from "@/components/Loading";
import { EXPORT, IMPORT } from "@/consts";

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
		};
	},

	watch: {
		importStatus(value) {
			this.isImportAutomaticallyCanceled(value);
		},
	},

	mounted() {
		this.isImportAutomaticallyCanceled(this.importStatus);
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

		importFailReason() {
			return this.statistics?.failReason || "";
		},

		importStatusType() {
			let result = "";

			switch (this.importStatus) {
				case IMPORT.STATUS.CANCEL:
				case IMPORT.STATUS.IMPORTING:
				case IMPORT.STATUS.AUTOMATICALLY_CANCELED:
					result = "is-warning";
					break;
				case IMPORT.STATUS.FINISH:
				case IMPORT.STATUS.INTEGRITY_CHECK_CORRECT:
				case IMPORT.STATUS.IDENTITY_CHECK_CORRECT:
				case IMPORT.STATUS.SIMILARITY_CHECK_CORRECT:
					result = "is-success";
					break;
				case IMPORT.STATUS.INTEGRITY_CHECK_FAILED:
				case IMPORT.STATUS.IDENTITY_CHECK_FAILED:
				case IMPORT.STATUS.SIMILARITY_CHECK_FAILED:
					result = "is-danger";
					break;
				case IMPORT.STATUS.NEW:
				case IMPORT.STATUS.INTEGRITY_CHECK:
				case IMPORT.STATUS.IDENTITY_CHECK:
				case IMPORT.STATUS.SIMILARITY_CHECK:
				default:
					result = "is-info";
			}

			return result;
		},

		integrityStepHasError() {
			if (this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK_CORRECT
				&& this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK_FAILED
				&& this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK) {
				return this.statistics.amountIntegrityFailed;
			}

			return false;
		},

		identityStepHasError() {
			if (this.importStatus === IMPORT.STATUS.IDENTITY_CHECK_CORRECT
				&& this.importStatus === IMPORT.STATUS.IDENTITY_CHECK_FAILED
				&& this.importStatus === IMPORT.STATUS.IDENTITY_CHECK
				&& this.importStatus === IMPORT.STATUS.SIMILARITY_CHECK_CORRECT
				&& this.importStatus === IMPORT.STATUS.SIMILARITY_CHECK_FAILED
				&& this.importStatus === IMPORT.STATUS.SIMILARITY_CHECK) {
				return this.statistics.amountDuplicities || this.columnsError;
			}

			return false;
		},

		stateTips() {
			if (!this.isImportLoaded && this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK_FAILED) {
				if (this.isBadVersionOfExportFile) {
					return this.$t("Please, upload a new file compatible with import template.");
				}
				return this.$t("Please, check Violation for missing columns and upload a new file compatible with import template.");
			}

			switch (this.importStatus) {
				case IMPORT.STATUS.UPLOADING:
				case IMPORT.STATUS.INTEGRITY_CHECK:
				case IMPORT.STATUS.IDENTITY_CHECK:
				case IMPORT.STATUS.IMPORTING:
					return this.$t("You can leave import page, Humansis will notify You by email once ready.");
				case IMPORT.STATUS.INTEGRITY_CHECK_CORRECT:
					return this.$t("Please start identity check.");
				case IMPORT.STATUS.INTEGRITY_CHECK_FAILED:
					return this.$t("Please download affected records and upload corrected records back.");
				case IMPORT.STATUS.IDENTITY_CHECK_FAILED:
					return this.$t("Please manage duplicities, i.e. decide which data to use.");
				case IMPORT.STATUS.FINISH:
					return this.$t("Import is finished.");
				case IMPORT.STATUS.CANCEL:
					return this.$t("Import was canceled.");
				case IMPORT.STATUS.IDENTITY_CHECK_CORRECT:
					return this.activeStep === 3
						? this.$t("Please approve and start import")
						: this.$t("Please Go to finalization");
				case IMPORT.STATUS.AUTOMATICALLY_CANCELED:
					return `${this.$t("Import failed:")} ${this.importFailReason}`;
				default:
					return "";
			}
		},

		isBusyIndicator() {
			return this.importStatus === IMPORT.STATUS.UPLOADING
				|| this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK
				|| this.importStatus === IMPORT.STATUS.IDENTITY_CHECK
				|| this.importStatus === IMPORT.STATUS.IMPORTING;
		},

		isImportLoaded() {
			return this.importFiles[0]?.isLoaded;
		},

		isBadVersionOfExportFile() {
			return this.importFiles[0]?.failReason === EXPORT.FAIL_REASON.BAD_VERSION;
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
				this.importDetail?.status !== IMPORT.STATUS.NEW
				&& this.importDetail?.status !== IMPORT.STATUS.CANCEL
				&& this.importDetail?.status !== IMPORT.STATUS.FINISH
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
				case IMPORT.STATUS.CANCEL:
				case IMPORT.STATUS.AUTOMATICALLY_CANCELED:
				case IMPORT.STATUS.IMPORTING:
				case IMPORT.STATUS.FINISH:
					this.changeTab(3);
					break;

				case IMPORT.STATUS.SIMILARITY_CHECK_CORRECT:
				case IMPORT.STATUS.SIMILARITY_CHECK_FAILED:
				case IMPORT.STATUS.SIMILARITY_CHECK:
					this.changeTab(3);
					break;

				case IMPORT.STATUS.IDENTITY_CHECK_FAILED:
				case IMPORT.STATUS.IDENTITY_CHECK_CORRECT:
				case IMPORT.STATUS.IDENTITY_CHECK:
					this.changeTab(2);
					break;

				case IMPORT.STATUS.INTEGRITY_CHECK_CORRECT:
				case IMPORT.STATUS.INTEGRITY_CHECK_FAILED:
				case IMPORT.STATUS.INTEGRITY_CHECK:
					this.changeTab(1);
					break;

				case IMPORT.STATUS.NEW:
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
						if (state === IMPORT.STATE.CANCELED) {
							Toast(this.$t("Import Canceled"), "is-success");
							this.changeTab(3);
						}

						if (this.$route.name === "Import") {
							Toast(this.$t(successMessage), "is-success");

							if (state !== IMPORT.STATE.FINISHED
							&& state !== IMPORT.STATE.IMPORTING
							&& state !== IMPORT.STATE.CANCELED) {
								if (goNext) this.changeTab(this.activeStep + 1);
							}
						}
					} else if (status >= 400 && status <= 500) {
						Notification(message, "is-warning");
					}
				}).catch((e) => {
					if (e.message) {
						const type = state === IMPORT.STATE.IMPORTING ? "is-warning" : "is-danger";
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
				IMPORT.STATE.CANCELED,
				"Canceled Successfully",
				true,
			);

			await this.fetchData();
		},

		isImportAutomaticallyCanceled(importStatus) {
			if (importStatus === IMPORT.STATUS.AUTOMATICALLY_CANCELED) {
				this.stepsRedirect(importStatus);
			}
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
