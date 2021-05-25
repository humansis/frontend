<template>
	<div class="card">
		<div class="card-content">
			<div class="content">
				<b-progress
					v-if="totalEntries"
					size="is-large"
					:max="totalEntries"
				>
					<template #bar>
						<b-progress-bar
							type="is-success"
							show-value
							:value="totalEntries - amountIntegrityFailed"
						/>
						<b-progress-bar
							v-if="amountIntegrityFailed"
							type="is-danger"
							show-value
							:value="amountIntegrityFailed"
						/>
					</template>
				</b-progress>
				<table>
					<tbody>
						<tr>
							<td>{{ $t('Number of Records') }}:</td>
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
							<td>{{ $t('Corrected Errors') }}:</td>
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
							<td>{{ $t('Integrity Errors') }}:</td>
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
					v-if="canStartDuplicityCheck"
					type="is-primary"
					icon-right="play-circle"
					:loading="changeStateButtonLoading"
					@click="startDuplicityCheck"
				>
					{{ $t('Start Duplicity Check') }}
				</b-button>
				<b-button
					v-if="canUploadAndDownloadAffectedRecords"
					type="is-primary"
					icon-right="file-download"
					:loading="downloadAffectedRecordsLoading"
					@click="downloadAffectedRecords"
				>
					{{ $t('Download Affected Records') }}
				</b-button>
				<b-upload
					v-if="canUploadAndDownloadAffectedRecords"
					v-model="file"
				>
					<span class="file-cta button is-primary">
						<span v-if="file" class="file-label">
							{{ file.name || $t("Upload Corrected Records") }}
						</span>
						<b-icon icon="file-upload" />
					</span>
				</b-upload>
				<b-button
					v-if="canStartIntegrityCheckAgain"
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
import consts from "@/utils/importConst";

export default {
	name: "IntegrityStep",

	data() {
		return {
			importStatistics: {},
			file: {},
			startIntegrityCheckAgainLoading: false,
			downloadAffectedRecordsLoading: false,
			changeStateButtonLoading: false,
			importStatus: "",
		};
	},

	props: {
		statistics: {
			type: Object,
			required: true,
		},

		loadingChangeStateButton: {
			type: Boolean,
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

		loadingChangeStateButton(value) {
			this.changeStateButtonLoading = value;
		},

		status(value) {
			this.importStatus = value;
		},
	},

	computed: {
		uploadedFile() {
			return this.file?.name;
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

		canStartIntegrityCheckAgain() {
			return this.importStatus === consts.STATUS.NEW && this.uploadedFile;
		},

		canStartDuplicityCheck() {
			return this.importStatus === consts.STATUS.INTEGRITY_CHECK_CORRECT;
		},

		canUploadAndDownloadAffectedRecords() {
			return this.importStatus === consts.STATUS.INTEGRITY_CHECK_FAILED
				&& this.amountIntegrityFailed;
		},

		canCancelImport() {
			return this.importStatus !== consts.STATUS.FINISH;
		},
	},

	methods: {
		downloadAffectedRecords() {
			this.downloadAffectedRecordsLoading = true;

			ImportService.getFileWithInvalidEntriesFromImport().then(({ data }) => {
				const blob = new Blob([data], { type: data.type });
				const link = document.createElement("a");
				link.href = window.URL.createObjectURL(blob);
				link.download = "affectedImportRecords.xls";
				link.click();
			}).catch((e) => {
				if (e.message) {
					Notification(
						`${this.$t("Downloaded File")} ${e}`,
						"is-danger",
					);
				}
			}).finally(() => {
				this.downloadAffectedRecordsLoading = false;
			});
		},

		startDuplicityCheck() {
			this.$emit("changeImportState", {
				state: consts.STATE.IDENTITY_CHECKING,
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
						state: consts.STATE.INTEGRITY_CHECKING,
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
