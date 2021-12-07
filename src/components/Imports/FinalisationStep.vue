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
					:loading="changeStateButtonLoading"
					@click="approveAndSave"
				>
					{{ $t('Approve and Save') }}
				</b-button>
				<b-button
					v-if="finishedImport"
					type="is-primary"
					@click="$router.push({ name: 'Imports' })"
				>
					{{ $t('Back to Imports') }}
				</b-button>
				<b-button
					v-if="finishedImport"
					type="is-primary"
					@click="$router.push({ name: 'Households' })"
				>
					{{ $t('Go to Beneficiaries') }}
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
			changeStateButtonLoading: false,
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
		loadingChangeStateButton: {
			type: Boolean,
			required: true,
		},
	},

	watch: {
		statistics(value) {
			this.importStatistics = value;
		},

		loadingChangeStateButton(value) {
			this.changeStateButtonLoading = value;
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

		finishedImport() {
			return this.importStatus === consts.STATUS.FINISH
				|| this.importStatus === consts.STATUS.IMPORTING;
		},

		canCancelImport() {
			return this.importStatus !== consts.STATUS.FINISH
				&& this.importStatus !== consts.STATUS.CANCEL
				&& this.importStatus !== consts.STATUS.IMPORTING;
		},
	},

	methods: {
		approveAndSave() {
			this.$emit("changeImportState", {
				state: consts.STATE.IMPORTING,
				successMessage: "Approved and Saved",
				goNext: false,
			});
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
