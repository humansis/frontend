<template>
	<div>
		<div class="card">
			<div
				v-if="integrityStepActive && status"
				class="card-content"
			>
				<div class="content loading-ref">
					<Loading v-if="isCheckingIntegrity" b-loading />
					<b-progress
						v-if="totalEntries"
						size="is-large"
						:max="totalEntries"
					>
						<template #bar>
							<b-progress-bar
								type="is-light"
								show-value
								:value="entriesLeft"
							/>
							<b-progress-bar
								v-if="amountIntegrityFailed"
								type="is-danger"
								show-value
								:value="amountIntegrityFailedIncrement"
							/>
							<b-progress-bar
								v-if="amountIntegrityCorrect"
								type="is-success"
								show-value
								:value="amountIntegrityCorrectIncrement"
							/>
						</template>
					</b-progress>
					<table>
						<tbody>
							<tr>
								<td>{{ $t('Number of Households') }}:</td>
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
								<td>{{ $t('Correct Households') }}:</td>
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
								<td>{{ $t('Households with Integrity Errors') }}:</td>
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

				<div class="buttons mt-5 space-between">
					<b-button
						v-if="canCancelImport"
						type="is-light is-danger"
						icon-left="ban"
						@click="cancelImport"
					>
						{{ $t('Cancel Import') }}
					</b-button>
					<div>
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
							:disabled="!isImportLoaded"
							@click="startIdentityCheck"
						>
							{{ $t('Start Identity Check') }}
						</b-button>
					</div>
				</div>

				<b-field v-if="filesUpload">
					<b-upload
						v-model="dropFiles"
						multiple
						drag-drop
						:accept="allowedFileExtensions"
					>
						<section class="section">
							<div class="content has-text-centered">
								<p>
									<b-icon
										icon="file-upload"
										size="is-large"
									/>
								</p>
								<p>{{ $t("Drop file here or click to upload.") }}</p>
							</div>
						</section>
					</b-upload>
				</b-field>

				<b-message v-if="dropFiles.length > 1" type="is-warning">
					{{ $t('You can upload only one file')}}
				</b-message>

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
			</div>
		</div>

		<div class="card" v-if="importFiles.length">
			<div>
				<div class="card-content">
					<b-message v-if="canUploadAndDownloadAffectedRecords && isImportLoaded" type="is-info">
						{{ $t('Do not repair your original file.') }}
						{{ $t('Repair only the file with Affected Records.') }}
					</b-message>
					<b-message v-else-if="isBadFileVersion" type="is-info">
						{{ $t('Please, upload a new file compatible with import template.') }}
					</b-message>
					<b-message v-else-if="!isViolationMessageHide" type="is-info">
						{{ $t('Please, check Violation for missing columns and ' +
							'upload a new file compatible with import template.') }}
					</b-message>
				</div>
				<div v-for="({
						id,
						expectedColumns,
						missingColumns,
						name,
						unexpectedColumns,
						uploadedDate,
						violations
					}, index) of importFiles"
					:key="`import-file-${id}`"
					class="card-content"
				>
					<div v-if="invalidFiles.length">
						<table class="mb-4">
							<tbody>
								<tr
									v-for="({id, name: invalidFileName, uploadedDate}, key) of invalidFiles"
									:key="key"
									v-show="key === 0"
								>
									<td>
										<div>
											<h2 class="subtitle mb-0"><strong>{{name}}</strong></h2>
											<small>Upload date:
												{{ $moment(uploadedDate).format("YYYY-MM-DD hh:mm") }}
											</small>
										</div>
									</td>
									<td v-if="index === 0 && isIntegrityCheckFailed"
										class="has-text-right"
									>
										<b-button
											type="is-info"
											icon-right="file-download"
											:disabled="!isImportLoaded"
											@click="downloadAffectedFile(id, invalidFileName)"
										>
											{{ $t('Get Affected Records') }}
										</b-button>
										<small class="mt-2 is-block">{{invalidFileName}}</small>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<h2 class="subtitle is-5">
						<b-taglist class="mt-3 mb-1" attached>
							<b-tag size="is-medium" type="is-warning is-light">
								{{ $t('Expected Columns') }}
							</b-tag>
							<b-tag size="is-medium" type="is-light">
								{{ expectedColumns.length }}
							</b-tag>
						</b-taglist>

						<b-taglist attached>
							<b-tag size="is-medium" type="is-info is-light">
								{{ $t('Upload Date') }}
							</b-tag>
							<b-tag size="is-medium" type="is-light">
								{{ getDate(uploadedDate) }}
							</b-tag>
						</b-taglist>
					</h2>
					<div class="content">
						<table>
							<tbody>
								<tr>
									<td><strong>{{ $t('Violations') }}</strong></td>
									<td>
										<span
											v-for="({
												columns,
												message
											}, key) of getParsedArray(violations)"
											:key="`violations-${id}-${key}`"
											class="mb-3 is-block"
										>
											<b-tag
												v-for="(column, key) of columns"
												:key="`missing-column-${id}-${key}`"
												class="has-text-weight-bold mr-2 mb-2"
												type="is-danger is-light"
												size="is-medium"
											>
												{{ column }}
											</b-tag>
											<br>
											{{ message }}
										</span>
									</td>
								</tr>
								<tr>
									<td>
										<strong>{{ $t('Missing Columns') }}</strong>
									</td>
									<td>
										<b-tag
											v-for="(column, key) of missingColumns"
											:key="`missing-column-${id}-${key}`"
											class="has-text-weight-bold mr-2 mb-2"
											type="is-warning is-light"
											size="is-medium"
										>
											{{ column }}
										</b-tag>
									</td>
								</tr>
								<tr>
									<td style="width: 200px"><strong>{{ $t('Unexpected Columns') }}</strong></td>
									<td class="td-width-30">
										<b-tag
											v-for="(column, key) of unexpectedColumns"
											:key="`missing-column-${id}-${key}`"
											class="has-text-weight-bold mr-2 mb-2"
											type="is-light"
											size="is-medium"
										>
											{{ column }}
										</b-tag>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<hr>
				</div>
			</div>
		</div>

	</div>
</template>

<script>
import ImportService from "@/services/ImportService";
import { Notification, Toast } from "@/utils/UI";
import { IMPORT } from "@/consts";
import Loading from "@/components/Loading";
import graduallyIncrement from "@/mixins/graduallyIncrement";

export default {
	name: "IntegrityStep",

	mixins: [graduallyIncrement],

	components: {
		Loading,
	},

	data() {
		return {
			amountIntegrityCorrectIncrement: 0,
			amountIntegrityFailedIncrement: 0,
			importStatistics: {},
			dropFiles: [],
			startIntegrityCheckAgainLoading: false,
			downloadAffectedRecordsLoading: false,
			changeStateButtonLoading: false,
			importStatus: "",
			invalidFiles: [],
			filesUpload: false,
			allowedFileExtensions: IMPORT.SUPPORT_CSV_XLSX_XLS_FILES,
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

		importFiles: {
			type: Array,
			default: () => [],
		},

		isImportLoaded: {
			type: Boolean,
			default: true,
		},

		isBadFileVersion: {
			type: Boolean,
			default: false,
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
			this.getAffectedRecords();
			this.importStatus = value;
		},

		amountIntegrityCorrect(newValue) {
			if (this.isCheckingIntegrity) {
				this.graduallyIncrement("amountIntegrityCorrectIncrement", newValue, this.totalEntries, 60);
			} else {
				this.amountIntegrityCorrectIncrement = newValue;
			}
		},

		amountIntegrityFailed(newValue) {
			if (this.isCheckingIntegrity) {
				this.graduallyIncrement("amountIntegrityFailedIncrement", newValue, this.totalEntries, 120);
			} else {
				this.amountIntegrityFailedIncrement = newValue;
			}
		},
	},

	mounted() {
		this.getAffectedRecords();
	},

	computed: {
		integrityStepActive() {
			return this.status === IMPORT.STATUS.INTEGRITY_CHECK
				|| this.status === IMPORT.STATUS.INTEGRITY_CHECK_CORRECT
				|| this.status === IMPORT.STATUS.INTEGRITY_CHECK_FAILED;
		},

		isCheckingIntegrity() {
			return this.status === IMPORT.STATUS.INTEGRITY_CHECK;
		},

		totalEntries() {
			return this.importStatistics?.totalEntries || 0;
		},

		entriesLeft() {
			if (this.amountIntegrityFailed) {
				return this.totalEntries - this.amountIntegrityFailedIncrement
					- this.amountIntegrityCorrectIncrement;
			}
			return this.totalEntries - this.amountIntegrityCorrectIncrement;
		},

		amountIntegrityCorrect() {
			return this.importStatistics?.amountIntegrityCorrect || 0;
		},

		amountIntegrityFailed() {
			return this.importStatistics?.amountIntegrityFailed || 0;
		},

		canStartIntegrityCheckAgain() {
			return this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK_FAILED
				&& this.dropFiles.length === 1;
		},

		canStartIdentityCheck() {
			return this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK_CORRECT
				|| this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK_FAILED;
		},

		canUploadAndDownloadAffectedRecords() {
			return this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK_FAILED;
		},

		canCancelImport() {
			return this.importStatus !== IMPORT.STATUS.FINISH
				&& this.importStatus !== IMPORT.STATUS.CANCEL
				&& this.importStatus !== IMPORT.STATUS.IMPORTING;
		},

		isIntegrityCheckFailed() {
			return this.statistics.status === IMPORT.STATUS.INTEGRITY_CHECK_FAILED;
		},

		isViolationMessageHide() {
			return this.statistics.status === IMPORT.STATUS.INTEGRITY_CHECK_CORRECT
				|| this.statistics.status === IMPORT.STATUS.INTEGRITY_CHECK;
		},
	},

	methods: {
		getAffectedRecords() {
			const { importId } = this.$route.params;

			this.downloadAffectedRecordsLoading = true;
			this.dropFiles = [];

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
				.then(({ data, status, message }) => {
					if (status === 200) {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `${file}`;
						link.click();
					} else {
						Notification(message, "is-warning");
					}
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
				state: IMPORT.STATUS.IDENTITY_CHECK,
				successMessage: "Identity Check Started Successfully",
				goNext: true,
			});
		},

		startIntegrityCheckAgain() {
			const { importId } = this.$route.params;

			if (this.dropFiles.length === 1) {
				this.startIntegrityCheckAgainLoading = true;

				ImportService.uploadFilesIntoImport(importId, this.dropFiles)
					.then(({ status, message }) => {
						if (status === 200) {
							Toast(this.$t("Uploaded Successfully"), "is-success");

							this.filesUpload = false;
							this.invalidFiles = [];
						} else {
							Notification(message, "is-warning");
						}
					}).catch((e) => {
						if (e.message) Notification(`${this.$t("Upload")} ${e}`, "is-danger");
					}).finally(() => {
						this.startIntegrityCheckAgainLoading = false;
						setTimeout(() => {
							this.getAffectedRecords();
						}, 1500);
					});
			}
		},

		deleteDropFile(index) {
			this.dropFiles.splice(index, 1);
		},

		getDate(date) {
			return this.$moment(date).format("YYYY-MM-DD hh:mm");
		},

		getParsedArray(violations) {
			return violations || [];
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>

<style scoped>
table {
	width: 100%;
}
</style>
