<template>
	<div class="card">
		<div class="card-content">
			<div class="content">
				<table>
					<tbody>
						<tr>
							<td>{{ $t("Number of Records") }}:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-light"
									size="is-medium"
								>
									{{ totalEntries }}
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>{{ $t("Corrected Errors") }}:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-success"
									size="is-medium"
								>
									{{ amountIntegrityCorrect }}
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>{{ $t("Integrity Errors") }}:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-danger"
									size="is-medium"
								>
									{{ amountIntegrityFailed }}
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>{{ $t("Similarities or Duplicities Found") }}:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-warning"
									size="is-medium"
								>
									{{ amountDuplicities }}
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>{{ $t("Similarities or Duplicities Corrected/Merged") }}:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-success"
									size="is-medium"
								>
									{{ amountDuplicitiesResolved }}
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>{{ $t("Final Records to Import") }}:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-success"
									size="is-medium"
								>
									{{ amountEntriesToImport }}
								</b-tag>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<hr>

			<div class="buttons mt-5 flex-end">
				<b-button
					v-if="canCancelImport"
					type="is-light is-danger"
					icon-right="ban"
					@click="cancelImport"
				>
					{{ $t('Cancel Import') }}
				</b-button>
				<b-button
					v-if="finalisationStepActive"
					type="is-primary"
					icon-right="save"
					:loading="approveAndSaveButtonLoading"
					@click="approveAndSave"
				>
					{{ $t('Approve and Save') }}
				</b-button>
			</div>
		</div>
	</div>
</template>

<script>
import consts from "@/utils/importConst";

export default {
	name: "FinalisationStep",

	data() {
		return {
			importStatistics: {},
			importStatus: "",
			approveAndSaveButtonLoading: false,
		};
	},

	props: {
		statistics: {
			type: Object,
			required: true,
		},

		status: {
			type: String,
			required: false,
			default: "",
		},
	},

	watch: {
		statistics(value) {
			this.importStatistics = value;
		},

		status(value) {
			this.importStatus = value;
		},
	},

	computed: {
		finalisationStepActive() {
			return this.status === consts.STATUS.SIMILARITY_CHECK_CORRECT;
		},

		totalEntries() {
			return this.importStatistics?.totalEntries || 0;
		},

		amountIntegrityCorrect() {
			return this.importStatistics?.amountIntegrityCorrect || 0;
		},

		amountIntegrityFailed() {
			return this.importStatistics?.amountIntegrityFailed || 0;
		},

		amountDuplicities() {
			return this.importStatistics?.amountDuplicities || 0;
		},

		amountDuplicitiesResolved() {
			return this.importStatistics?.amountDuplicitiesResolved || 0;
		},

		amountEntriesToImport() {
			return this.importStatistics?.amountEntriesToImport || 0;
		},

		canCancelImport() {
			return this.importStatus !== consts.STATUS.FINISH
				&& this.importStatus !== consts.STATUS.CANCEL;
		},
	},

	methods: {
		approveAndSave() {
			this.approveAndSaveButtonLoading = true;

			this.$emit("changeImportState", {
				state: consts.STATE.IMPORTING,
				successMessage: "Approved and Saved",
				goNext: false,
			});

			this.approveAndSaveButtonLoading = false;
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
