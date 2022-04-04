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
							<td>{{ $t("Duplicities Found") }}:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-warning"
									size="is-medium"
								>
									{{ amountIdentityDuplicities }}
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>{{ $t("Duplicities Corrected/Merged") }}:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-success"
									size="is-medium"
								>
									{{ amountIdentityDuplicitiesResolved }}
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>{{ $t("Similarities Found") }}:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-warning"
									size="is-medium"
								>
									{{ amountSimilarityDuplicities }}
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>{{ $t("Similarities Corrected/Merged") }}:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-success"
									size="is-medium"
								>
									{{ amountSimilarityDuplicitiesResolved }}
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

			<div class="buttons mt-5 space-between">
				<b-button
					v-if="canCancelImport"
					type="is-light is-danger"
					icon-right="ban"
					@click="cancelImport"
				>
					{{ $t('Cancel Import') }}
				</b-button>
				<div>
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

		amountIdentityDuplicities() {
			return this.importStatistics?.amountIdentityDuplicities || 0;
		},

		amountIdentityDuplicitiesResolved() {
			return this.importStatistics?.amountIdentityDuplicitiesResolved || 0;
		},

		amountSimilarityDuplicities() {
			return this.importStatistics?.amountSimilarityDuplicities || 0;
		},

		amountSimilarityDuplicitiesResolved() {
			return this.importStatistics?.amountSimilarityDuplicitiesResolved || 0;
		},

		amountEntriesToImport() {
			return this.importStatistics?.amountEntriesToImport || 0;
		},

		finishedImport() {
			if (!this.importStatus) return false;

			return this.importStatus === consts.STATUS.FINISH
				|| this.importStatus === consts.STATUS.IMPORTING
				|| this.importStatus === consts.STATUS.CANCEL;
		},

		canCancelImport() {
			return this.importStatus
				&& this.importStatus !== consts.STATUS.FINISH
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
