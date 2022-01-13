<template>
	<div>
		<div class="card">
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
								type="is-light"
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
								<td>{{ $t('Correct Records / Valid Records') }}:</td>
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

		<div v-if="importFiles.length" class="card">
			<div v-for="({
					id,
					expectedColumns,
					missingColumns,
					name,
					unexpectedColumns,
					uploadedDate,
					violations}) of importFiles"
				:key="`import-file-${id}`"
				class="card-content"
			>
				<h2 class="subtitle is-5">
					{{ name }}
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
					<div>
						<table>
							<thead>
								<tr>
									<th>{{ $t('Missing Columns') }}</th>
									<th>{{ $t('Unexpected Columns') }}</th>
									<th>{{ $t('Violations') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td class="td-width-30">
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
									<td class="td-width-30">
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
							</tbody>
						</table>
					</div>
				</div>
				<hr>
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

		importFiles: {
			type: Array,
			default: () => [],
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

		allowedFileExtensions() {
			return ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";
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
			return this.importStatus !== consts.STATUS.FINISH
				&& this.importStatus !== consts.STATUS.CANCEL
				&& this.importStatus !== consts.STATUS.IMPORTING;
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
							withConfirm: false,
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
