<template>
	<div class="card">
		<div class="card-content">
			<div class="content">
				<table>
					<tbody>
						<tr>
							<td>Number of Records:</td>
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
							<td>Corrected Errors:</td>
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
							<td>Integrity Errors:</td>
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
							<td>Similarities or Duplicities Found:</td>
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
							<td>Similarities or Duplicities Corrected/Merged:</td>
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
							<td>Final Records to Import</td>
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
					type="is-light is-danger"
					icon-right="ban"
					@click="cancelImport"
				>
					{{ $t('Cancel Import') }}
				</b-button>
				<b-button
					v-if="amountEntriesToImport"
					type="is-primary"
					icon-right="save"
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
		};
	},

	props: {
		activeStep: {
			type: Number,
			required: true,
		},
		statistics: {
			type: Object,
			required: true,
		},
	},

	watch: {
		activeStep(step) {
			if (step === 3) console.log("FinalisationStep");
		},
		statistics(value) {
			this.importStatistics = value;
		},
	},

	computed: {
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
	},

	methods: {
		approveAndSave() {
			this.$emit("changeImportState", {
				state: consts.STATE.FINISHED,
				successMessage: "Approved and Saved",
			});
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
