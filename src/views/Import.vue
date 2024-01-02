<template>
	<v-container fluid>
		<ConfirmAction
			:is-dialog-opened="confirmModal.isOpen"
			:confirm-title="confirmModal.title"
			:confirm-message="confirmModal.message"
			prepend-icon="exclamation-circle"
			:prepend-icon-color="confirmModal.iconColor"
			:close-button-name="confirmModal.closeButtonName"
			:confirm-button-name="confirmModal.confirmButtonName"
			:confirm-button-color="confirmModal.confirmButtonColor"
			@modalClosed="confirmModal.isOpen = false"
			@actionConfirmed="confirmModal.onConfirm"
		/>

		<div class="d-flex justify-center align-center">
			<h1 class="text-h4 font-weight-bold">{{ importTitle }}</h1>

			<span class="text-h4 px-2">•</span>

			<h2 class="text-h6">{{ importProject }}</h2>
		</div>

		<p v-if="importDescription" class="text-center mt-4">
			{{ importDescription }}
		</p>

		<div v-if="importStatus" class="text-center mt-4">
			<v-chip
				variant="flat"
				:color="importStatusType"
			>
				<span>
					{{ $t(importStatus) }}

					<v-progress-linear
						v-if="isBusyIndicator"
						indeterminate
						rounded
						height="5"
					/>
				</span>
			</v-chip>
		</div>

		<div v-if="stateTips" class="d-flex justify-center align-center mt-4">
			<v-icon icon="info-circle" />

			<p class="text-body-2 pl-2">
				{{ stateTips }}
			</p>
		</div>

		<v-stepper
			v-model="activeStep"
			:items="stepsTitle"
			:alt-labels="!isMobile"
			:class="['mt-6 import-stepper', { 'mobile-stepper': isMobile }]"
			hide-actions
		>

			<template v-slot:title="{ title }">
				<p>{{ $t(title) }}</p>
			</template>

			<template v-slot:icon="{ step }">
				<v-icon :icon="`${step}`" />
			</template>

			<template v-slot:item.1>
				<StartStep
					:importFiles="importFiles"
					:status="importStatus"
					:loading-change-state-button="loadingChangeStateButton"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
					@moveStepForward="onChangeTab(2)"
					@fetchStatistics="onFetchImportStatistics"
				/>
			</template>

			<template v-slot:item.2>
				<IntegrityStep
					:statistics="statistics"
					:status="importStatus"
					:importFiles="importFiles"
					:loading-change-state-button="loadingChangeStateButton"
					:is-import-loaded="isImportLoaded"
					:is-bad-file-version="isBadVersionOfImportFile"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
				/>
			</template>

			<template v-slot:item.3>
				<IdentityStep
					:statistics="statistics"
					:status="importStatus"
					:loading-change-state-button="loadingChangeStateButton"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
					@updated="onFetchImportStatistics"
					@goToFinalStep="onGoToFinalStep"
				/>
			</template>

			<template v-slot:item.4>
				<FinalisationStep
					:statistics="statistics"
					:status="importStatus"
					:loading-change-state-button="loadingChangeStateButton"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
				/>
			</template>
		</v-stepper>
	</v-container>
</template>

<script>
import ImportService from "@/services/ImportService";
import ConfirmAction from "@/components/ConfirmAction";
import FinalisationStep from "@/components/Imports/FinalisationStep";
import IdentityStep from "@/components/Imports/IdentityStep";
import IntegrityStep from "@/components/Imports/IntegrityStep";
import StartStep from "@/components/Imports/StartStep";
import vuetifyHelper from "@/mixins/vuetifyHelper";
import { Notification } from "@/utils/UI";
import { IMPORT } from "@/consts";

export default {
	name: "Import",

	components: {
		StartStep,
		IntegrityStep,
		IdentityStep,
		FinalisationStep,
		ConfirmAction,
	},

	mixins: [vuetifyHelper],

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
			stepsTitle: [
				"Start",
				"Integrity Check",
				"Identity Check",
				"Finalisation",
			],
			steps: [
				{ code: 1, slug: "start-import" },
				{ code: 2, slug: "integrity-check" },
				{ code: 3, slug: "identity-check" },
				{ code: 4, slug: "finalisation" },
			],
			confirmModal: {
				isOpen: false,
				title: "",
				message: "",
				iconColor: "",
				closeButtonName: "",
				confirmButtonName: "",
				confirmButtonColor: "",
				onConfirm: null,
			},
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

		importFailReason() {
			return this.statistics?.failReason || "";
		},

		importStatusType() {
			let result = "";

			switch (this.importStatus) {
				case IMPORT.STATUS.CANCEL:
				case IMPORT.STATUS.IMPORTING:
				case IMPORT.STATUS.AUTOMATICALLY_CANCELED:
					result = "warning";
					break;
				case IMPORT.STATUS.FINISH:
				case IMPORT.STATUS.INTEGRITY_CHECK_CORRECT:
				case IMPORT.STATUS.IDENTITY_CHECK_CORRECT:
				case IMPORT.STATUS.SIMILARITY_CHECK_CORRECT:
					result = "success";
					break;
				case IMPORT.STATUS.INTEGRITY_CHECK_FAILED:
				case IMPORT.STATUS.IDENTITY_CHECK_FAILED:
				case IMPORT.STATUS.SIMILARITY_CHECK_FAILED:
					result = "error";
					break;
				case IMPORT.STATUS.NEW:
				case IMPORT.STATUS.INTEGRITY_CHECK:
				case IMPORT.STATUS.IDENTITY_CHECK:
				case IMPORT.STATUS.SIMILARITY_CHECK:
				default:
					result = "info";
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
				if (this.isBadVersionOfImportFile) {
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

		isBadVersionOfImportFile() {
			return this.importFiles[0]?.failReason === IMPORT.FAIL_REASON.BAD_VERSION;
		},
	},

	watch: {
		importStatus(value) {
			this.isImportAutomaticallyCanceled(value);
		},
	},

	async created() {
		this.fetchData();
		const currentStep = this.steps.find((step) => this.$route.query?.step === step?.slug);
		this.activeStep = currentStep?.code || 1;
	},

	mounted() {
		this.isImportAutomaticallyCanceled(this.importStatus);
	},

	beforeUnmount() {
		clearInterval(this.statisticsInterval);
	},

	methods: {
		onChangeTab(data) {
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
				this.onFetchImportStatistics();
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
					this.onFetchImportStatistics();
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
						Notification(`${this.$t("Import Files")} ${e.message || e}`, "error");
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
				Notification(`${this.$t("Import")} ${e.message || e}`, "error");
			});
		},

		onFetchImportStatistics() {
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
					this.onChangeTab(4);
					break;

				case IMPORT.STATUS.SIMILARITY_CHECK_CORRECT:
				case IMPORT.STATUS.SIMILARITY_CHECK_FAILED:
				case IMPORT.STATUS.SIMILARITY_CHECK:
					this.onChangeTab(4);
					break;

				case IMPORT.STATUS.IDENTITY_CHECK_FAILED:
				case IMPORT.STATUS.IDENTITY_CHECK_CORRECT:
				case IMPORT.STATUS.IDENTITY_CHECK:
					this.onChangeTab(3);
					break;

				case IMPORT.STATUS.INTEGRITY_CHECK_CORRECT:
				case IMPORT.STATUS.INTEGRITY_CHECK_FAILED:
				case IMPORT.STATUS.INTEGRITY_CHECK:
					this.onChangeTab(2);
					break;

				case IMPORT.STATUS.NEW:
				default:
					this.onChangeTab(1);
			}
		},

		onCancelImport() {
			this.confirmModal = {
				isOpen: true,
				title: "Cancel Import",
				message: "Are you sure you want to cancel this import?",
				iconColor: "warning",
				closeButtonName: "Cancel",
				confirmButtonName: "Confirm",
				confirmButtonColor: "warning",
				onConfirm: this.cancelImport,
			};
		},

		onChangeImportState({
			state,
			successMessage,
			goNext,
			withConfirm = true,
		}) {
			if ((this.integrityStepHasError || this.identityStepHasError) && withConfirm) {
				this.confirmModal = {
					isOpen: true,
					title: "Continue",
					message: "Are you sure you want to ignore errors and proceed?",
					iconColor: "warning",
					closeButtonName: "Cancel",
					confirmButtonName: "Confirm",
					confirmButtonColor: "warning",
					onConfirm: () => this.confirmedChangeImportState(state, successMessage, goNext),
				};
			} else {
				this.changeImportState(state, successMessage, goNext);
			}
		},

		confirmedChangeImportState(state, successMessage, goNext) {
			this.changeImportState(state, successMessage, goNext);
			this.columnsError = 0;
		},

		changeImportState(state, successMessage, goNext) {
			const { importId } = this.$route.params;
			this.loadingChangeStateButton = true;

			ImportService.changeImportState(importId, { status: state })
				.then(({ status, message }) => {
					if (status === 202) {
						if (state === IMPORT.STATUS.CANCEL) {
							Notification(this.$t("Import Canceled"), "success");
							this.onChangeTab(4);
						}

						if (this.$route.name === "Import") {
							Notification(this.$t(successMessage), "success");

							if (state !== IMPORT.STATUS.FINISH
								&& state !== IMPORT.STATUS.IMPORTING
								&& state !== IMPORT.STATUS.CANCEL) {
								if (goNext) this.onChangeTab(this.activeStep + 1);
							}
						}
					} else if (status >= 400 && status <= 500) {
						Notification(message, "warning");
					}
				}).catch((e) => {
					const type = state === IMPORT.STATUS.IMPORTING ? "warning" : "error";
					Notification(`${this.$t("Import")} ${e.message || e}`, type);
				}).finally(() => {
					this.loadingChangeStateButton = false;
					this.onFetchImportStatistics();
					this.fetchImportFiles();
				});
		},

		onGoToFinalStep() {
			if (this.statistics.amountDuplicities) {
				this.confirmModal = {
					isOpen: true,
					title: "Continue",
					message: "Are you sure you want to ignore errors and proceed?",
					iconColor: "warning",
					closeButtonName: "Cancel",
					confirmButtonName: "Confirm",
					confirmButtonColor: "warning",
					onConfirm: () => this.onChangeTab(4),
				};
			} else {
				this.onChangeTab(4);
			}
		},

		async cancelImport() {
			await this.changeImportState(
				IMPORT.STATUS.CANCEL,
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
