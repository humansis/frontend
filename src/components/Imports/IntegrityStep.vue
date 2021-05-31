<template>
	<div class="card">
		<b-notification
			v-if="!integrityStepActive && status"
			class="is-light"
			type="is-info"
			has-icon
			:closable="false"
		>
			<div class="mt-3">
				{{ $t("This step is not currently in progress")}}
			</div>
		</b-notification>
		<div
			v-if="integrityStepActive && status"
			class="card-content"
		>
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
					v-if="canUploadAndDownloadAffectedRecords"
					type="is-primary"
					icon-right="file-download"
					:loading="downloadAffectedRecordsLoading"
					@click="getAffectedRecords"
				>
					{{ $t('Get Affected Records') }}
				</b-button>
				<b-button
					v-if="canUploadAndDownloadAffectedRecords"
					type="is-primary"
					icon-right="file-upload"
					@click="filesUpload = !filesUpload"
				>
					{{ $t("Upload Corrected Records") }}
				</b-button>
				<b-button
					v-if="canStartIntegrityCheckAgain"
					type="is-primary"
					icon-right="play-circle"
					:loading="startIntegrityCheckAgainLoading"
					@click="startIntegrityCheckAgain"
				>
					{{ $t('Start Integrity Check Again') }}
				</b-button>
				<b-button
					v-if="canStartIdentityCheck"
					type="is-primary"
					icon-right="play-circle"
					:loading="changeStateButtonLoading"
					@click="startIdentityCheck"
				>
					{{ $t('Start Identity Check') }}
				</b-button>
			</div>

			<b-field v-if="filesUpload">
				<b-upload
					v-model="dropFiles"
					multiple
					drag-drop
				>
					<section class="section">
						<div class="content has-text-centered">
							<p>
								<b-icon
									icon="file-upload"
									size="is-large"
								/>
							</p>
							<p>{{ $t("Drop your files here or click to upload") }}</p>
						</div>
					</section>
				</b-upload>
			</b-field>

			<div class="tags">
				<span v-for="(file, index) in dropFiles"
					:key="index"
					class="tag is-primary"
				>
					{{file.name}}
					<button class="delete is-small"
						type="button"
						@click="deleteDropFile(index)"
					/>
				</span>
			</div>

			<div v-if="invalidFiles.length" class="content">
				<table>
					<tbody>
						<tr
							v-for="({id, name}, key) of invalidFiles"
							:key="key"
						>
							<td>{{ name }}</td>
							<td class="has-text-right">
								<b-button
									type="is-info"
									icon-right="file-download"
									@click="downloadAffectedFile(id, name)"
								>
									{{ $t('Download') }}
								</b-button>
							</td>
						</tr>
					</tbody>
				</table>
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
			dropFiles: [],
			startIntegrityCheckAgainLoading: false,
			downloadAffectedRecordsLoading: false,
			changeStateButtonLoading: false,
			importStatus: "",
			invalidFiles: [],
			filesUpload: false,
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
		integrityStepActive() {
			return this.status === consts.STATUS.INTEGRITY_CHECK
				|| this.status === consts.STATUS.INTEGRITY_CHECK_CORRECT
				|| this.status === consts.STATUS.INTEGRITY_CHECK_FAILED;
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
			return this.importStatus === consts.STATUS.INTEGRITY_CHECK_FAILED
				&& this.dropFiles.length;
		},

		canStartIdentityCheck() {
			return this.importStatus === consts.STATUS.INTEGRITY_CHECK_CORRECT
				|| this.importStatus === consts.STATUS.INTEGRITY_CHECK_FAILED;
		},

		canUploadAndDownloadAffectedRecords() {
			return this.importStatus === consts.STATUS.INTEGRITY_CHECK_FAILED;
		},

		canCancelImport() {
			return this.importStatus !== consts.STATUS.FINISH;
		},
	},

	methods: {
		getAffectedRecords() {
			const { importId } = this.$route.params;

			this.downloadAffectedRecordsLoading = true;

			ImportService.getFilesWithInvalidEntriesFromImport(importId)
				.then(({ data: { data } }) => {
					this.invalidFiles = data;
				}).catch((e) => {
					if (e.message) {
						Notification(
							`${this.$t("Invalid Files")} ${e}`,
							"is-danger",
						);
					}
				}).finally(() => {
					this.downloadAffectedRecordsLoading = false;
				});
		},

		downloadAffectedFile(id, file) {
			ImportService.downloadFileWithInvalidEntriesFromImport(id)
				.then(({ data }) => {
					Toast(this.$t("Download Started"), "is-success");

					const blob = new Blob([data], { type: data.type });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = `${file}`;
					link.click();
				}).catch((e) => {
					if (e.message) {
						Notification(
							`${this.$t("Downloaded File")} ${e}`,
							"is-danger",
						);
					}
				});
		},

		startIdentityCheck() {
			this.$emit("changeImportState", {
				state: consts.STATE.IDENTITY_CHECKING,
				successMessage: "Identity Check Started Successfully",
				goNext: true,
			});
		},

		startIntegrityCheckAgain() {
			const { importId } = this.$route.params;

			if (this.dropFiles.length) {
				this.startIntegrityCheckAgainLoading = true;

				ImportService.uploadFilesIntoImport(importId, this.dropFiles).then(({ status }) => {
					if (status === 200) {
						Toast("Uploaded Successfully", "is-success");
						this.$emit("changeImportState", {
							state: consts.STATE.INTEGRITY_CHECKING,
							successMessage: "Integrity Check Started Successfully",
							goNext: false,
						});

						this.filesUpload = false;
						this.invalidFiles = [];
					}
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Upload")} ${e}`, "is-danger");
				}).finally(() => {
					this.startIntegrityCheckAgainLoading = false;
				});
			}
		},

		deleteDropFile(index) {
			this.dropFiles.splice(index, 1);
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
