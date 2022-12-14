<template>
	<div>
		<h1 class="title has-text-centered">
			{{ importTitle }}
		</h1>
		<p
			v-if="importDescription && !importDescriptionEditing"
			class="has-text-centered mt-3"
		>
			{{ importDescription }}
			<b-button
				class="ml-1 description-edit-button"
				size="is-small"
				icon-left="edit"
				@click="editDescription"
			/>
		</p>
		<div v-if="importDescriptionEditing">
			<b-input
				class="description-edit-area"
				v-model="importDescriptionCopy"
				type="textarea"
				maxlength="255"
			/>
			<div class="buttons mt-1 flex-end">
				<b-button
					@click="closeEditDescription"
				>
					{{ $t('Close') }}
				</b-button>
				<b-button
					class="is-primary"
					:loading="updateDescriptionLoading"
					@click="updateDescription"
				>
					{{ $t('Save') }}
				</b-button>
			</div>
		</div>
		<h2 class="subtitle is-5 has-text-centered has-text-weight-bold mt-3 mb-4">
			{{ importProject }}
		</h2>
		<div class="has-text-centered mb-5">
			<b-tag
				v-if="importStatus"
				class="has-text-weight-bold"
				size="is-small"
				:type="importStatusType"
			>
				{{ $t(importStatus) }}
			</b-tag>
		</div>

		<b-steps
			v-model="activeStep"
			ref="importSteps"
			animated
			rounded
			:has-navigation="false"
			@input="changeTab"
		>
			<b-step-item clickable step="1" :label="$t('Start')">
				<StartStep
					:status="importStatus"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
				/>
			</b-step-item>

			<b-step-item clickable step="2" :label="$t('Integrity Check')">
				<IntegrityStep
					:statistics="statistics"
					:status="importStatus"
					:loading-change-state-button="loadingChangeStateButton"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
				/>
			</b-step-item>

			<b-step-item clickable step="3" :label="$t('Identity Check')">
				<IdentityStep
					:statistics="statistics"
					:status="importStatus"
					:loading-change-state-button="loadingChangeStateButton"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
					@updated="fetchImportStatistics"
				/>
			</b-step-item>

			<b-step-item clickable step="4" :label="$t('Similarity Check')">
				<SimilarityStep
					:statistics="statistics"
					:status="importStatus"
					:loading-change-state-button="loadingChangeStateButton"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
					@goToFinalStep="changeTab(4)"
					@updated="fetchImportStatistics"
				/>
			</b-step-item>

			<b-step-item clickable step="5" :label="$t('Finalisation')">
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
import SimilarityStep from "@/components/Imports/SimilarityStep";
import FinalisationStep from "@/components/Imports/FinalisationStep";
import { Notification, Toast } from "@/utils/UI";
import ImportService from "@/services/ImportService";
import ProjectService from "@/services/ProjectService";
import consts from "@/utils/importConst";

export default {
	name: "Import",

	components: {
		StartStep,
		IntegrityStep,
		IdentityStep,
		SimilarityStep,
		FinalisationStep,
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
			return this.project?.name || "";
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
	},

	data() {
		return {
			importDetail: {},
			statistics: {},
			project: {},
			importDescriptionEditing: false,
			importDescriptionCopy: "",
			updateDescriptionLoading: false,
			loadingChangeStateButton: false,
			statisticsInterval: null,
			activeStep: 0,
			steps: [
				{ code: 0, slug: "start-import" },
				{ code: 1, slug: "integrity-check" },
				{ code: 2, slug: "identity-check" },
				{ code: 3, slug: "similarity-check" },
				{ code: 4, slug: "finalisation" },
			],
		};
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
		editDescription() {
			this.importDescriptionEditing = true;
			this.importDescriptionCopy = this.importDescription;
		},

		closeEditDescription() {
			this.updateDescriptionLoading = false;
			this.importDescriptionEditing = false;
			this.importDescriptionCopy = "";
		},

		updateDescription() {
			this.updateDescriptionLoading = true;
			const { importId } = this.$route.params;

			ImportService.changeImportState(importId, "description", this.importDescriptionCopy)
				.then(({ status }) => {
					if (status === 202) {
						this.importDetail.description = this.importDescriptionCopy;
					}
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Import")} ${e}`, "is-danger");
				}).finally(() => {
					this.closeEditDescription();
				});
		},

		changeTab(data) {
			const { slug, code } = this.steps.find((step) => step.code === data);

			this.$router.replace({
				name: "Import",
				params: { importId: this.$route.params.importId },
				query: { step: slug },
			});

			this.activeStep = code;
		},

		fetchData() {
			const { importId } = this.$route.params;

			if (importId) {
				this.fetchImport(importId);
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
				}, 30000);
			}
		},

		fetchImport(importId) {
			ImportService.getDetailOfImport(importId).then(({ data }) => {
				this.importDetail = data;
				this.fetchProject(data.projectId);
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

		fetchProject(projectId) {
			ProjectService.getDetailOfProject(projectId).then(({ data }) => {
				this.project = data;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Project")} ${e}`, "is-danger");
			});
		},

		onCancelImport() {
			this.$buefy.dialog.confirm({
				title: this.$t("Cancel Import"),
				message: this.$t("Are you sure you want to cancel this import?"),
				confirmText: this.$t("Confirm"),
				type: "is-danger",
				hasIcon: true,
				onConfirm: () => {
					this.cancelImport();
				},
			});
		},

		onChangeImportState({ state, successMessage, goNext }) {
			const { importId } = this.$route.params;

			this.loadingChangeStateButton = true;

			ImportService.changeImportState(importId, "status", state).then(({ status }) => {
				if (status === 202) {
					Toast(this.$t(successMessage), "is-success");

					if (state === consts.STATE.CANCELED) {
						this.$router.push({ name: "Imports" });
					}

					if (state !== consts.STATE.FINISHED
						&& state !== consts.STATE.IMPORTING
						&& state !== consts.STATE.CANCELED) {
						if (goNext) this.changeTab(this.activeStep + 1);
					}
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Import")} ${e}`, "is-danger");
			}).finally(() => {
				this.loadingChangeStateButton = false;
				this.fetchImportStatistics();
			});
		},

		async cancelImport() {
			await this.onChangeImportState({
				state: consts.STATE.CANCELED,
				successMessage: "Canceled Successfully",
				goNext: true,
			});
			await this.fetchData();
		},
	},
};
</script>

<style>
.description-edit-button {
	margin-top: -.2rem;
}

.description-edit-area textarea {
	text-align: center;
}
</style>
