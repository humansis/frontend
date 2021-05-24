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
					icon-right="play-circle"
					@click="startDuplicityCheck"
				>
					{{ $t('Start Duplicity Check') }}
				</b-button>
				<b-button
					type="is-primary"
					icon-right="file-download"
					@click="downloadAffectedRecords"
				>
					{{ $t('Download Affected Records') }}
				</b-button>
				<b-upload v-model="file">
					<span class="file-cta button is-primary">
						<span v-if="file" class="file-label">
							{{ file.name || "Upload Corrected Records"}}
						</span>
						<b-icon icon="file-upload" />
					</span>
				</b-upload>
				<b-button
					v-if="uploadedFile"
					type="is-primary"
					icon-right="play-circle"
					:loading="startIntegrityCheckAgainLoading"
					@click="startIntegrityCheckAgain"
				>
					{{ $t('Start Integrity Check Again') }}
				</b-button>
			</div>

		</div>
	</div>
</template>

<script>
import ImportService from "@/services/ImportService";
import { Notification, Toast } from "@/utils/UI";

export default {
	name: "IntegrityStep",

	data() {
		return {
			file: {},
			startIntegrityCheckAgainLoading: false,
		};
	},

	props: {
		activeStep: {
			type: Number,
			required: true,
		},
	},

	watch: {
		activeStep(step) {
			if (step === 1) console.log("IntegrityStep");
		},
	},

	computed: {
		uploadedFile() {
			return this.file?.name;
		},
	},

	methods: {
		downloadAffectedRecords() {
			// TODO
		},

		startDuplicityCheck() {
			// TODO If no errors, I can emit
			this.$emit("changeImportState", {
				state: "",
				successMessage: "Duplicity Check Started Successfully",
			});
		},

		startIntegrityCheckAgain() {
			const { importId } = this.$route.params;

			this.startIntegrityCheckAgainLoading = true;

			ImportService.uploadFilesIntoImport(importId, [this.file]).then(({ status }) => {
				if (status === 200) {
					Toast("Uploaded Successfully", "is-success");
					this.$emit("changeImportState", {
						state: "Integrity Checking",
						successMessage: "Integrity Check Started Successfully",
					});
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Upload")} ${e}`, "is-danger");
			}).finally(() => {
				this.startIntegrityCheckAgainLoading = false;
			});
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
