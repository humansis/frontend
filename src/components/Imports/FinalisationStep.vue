<template>
	<div class="card">
		<div class="card-content">
			<div class="content">
				<b-progress size="is-large">
					<template #bar>
						<b-progress-bar type="is-success" show-value :value="90"  />
						<b-progress-bar type="is-danger" show-value :value="10" />
					</template>
				</b-progress>
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
									100
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
									10
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>Duplicities resolved:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-danger"
									size="is-medium"
								>
									10
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>Similarities resolved:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-danger"
									size="is-medium"
								>
									10
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>Records to Import:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-danger"
									size="is-medium"
								>
									10
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
export default {
	name: "FinalisationStep",

	props: {
		activeStep: {
			type: Number,
			required: true,
		},
	},

	watch: {
		activeStep(step) {
			if (step === 3) console.log("FinalisationStep");
		},
	},

	methods: {
		approveAndSave() {
			// TODO If no errors, I can emit
			this.$emit("changeImportState", {
				state: "",
				successMessage: "Approved and Saved",
			});
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
