<template>
	<div>
		<h1 class="title has-text-centered mb-3">{{ importTitle }}</h1>
		<p class="has-text-centered mb-3">
			{{ importDescription }}
		</p>
		<h2 class="subtitle is-5 has-text-centered has-text-weight-bold mb-6">
			{{ importProject }}
		</h2>

		<b-steps
			v-model="activeStep"
			animated
			rounded
			:has-navigation="false"
		>
			<b-step-item clickable step="1" :label="$t('Start')">
				<StartStep
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
				/>
			</b-step-item>

			<b-step-item clickable step="2" :label="$t('Integrity Check')">
				<IntegrityStep
					:statistics="statistics"
					:active-step="activeStep"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
				/>
			</b-step-item>

			<b-step-item clickable step="3" :label="$t('Duplicity Check')">
				<DuplicityStep
					:statistics="statistics"
					:active-step="activeStep"
					@canceledImport="onCancelImport"
					@changeImportState="onChangeImportState"
				/>
			</b-step-item>

			<b-step-item clickable step="4" :label="$t('Finalisation')">
				<FinalisationStep
					:statistics="statistics"
					:active-step="activeStep"
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
import DuplicityStep from "@/components/Imports/DuplicityStep";
import FinalisationStep from "@/components/Imports/FinalisationStep";
import { Notification, Toast } from "@/utils/UI";
import ImportService from "@/services/ImportService";
import ProjectService from "@/services/ProjectService";

export default {
	name: "Import",

	components: {
		StartStep,
		IntegrityStep,
		DuplicityStep,
		FinalisationStep,
	},

	computed: {
		importTitle() {
			return this.importDetail?.title || "";
		},

		importDescription() {
			return this.importDetail?.description || "";
		},

		importProject() {
			return this.project?.name || "";
		},
	},

	data() {
		return {
			importDetail: {},
			statistics: {},
			project: {},
			activeStep: 0,
		};
	},

	async created() {
		this.fetchData();
	},

	methods: {
		fetchData() {
			const { importId } = this.$route.params;

			if (importId) {
				this.fetchImport(importId);
				this.fetchImportStatistics(importId);
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

		fetchImportStatistics(importId) {
			ImportService.getStatisticsInImport(importId).then(({ data }) => {
				this.statistics = data;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Import Statistics")} ${e}`, "is-danger");
			});
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

		onChangeImportState(state, successMessage) {
			const { importId } = this.$route.params;

			// TODO Start component loading

			ImportService.changeImportState(importId, state).then(({ status }) => {
				if (status === 202) {
					Toast(successMessage, "is-success");
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Import")} ${e}`, "is-danger");
			});
		},

		async cancelImport() {
			await this.onChangeImportState("Canceled", "Canceled Successfully");
			await this.fetchData();
		},
	},
};
</script>
