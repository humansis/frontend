<template>
	<!-- TODO Implement else -->
	<v-card v-if="integrityStepActive && importStatus" class="pa-5">
		<div>
			<Loading v-if="isCheckingIntegrity" is-large />

			<v-sheet
				v-if="totalEntries"
				color="grey-lighten-2"
				class="d-flex my-4 rounded-xl overflow-hidden import-progress-bar"
			>
				<v-sheet
					v-if="amountIntegrityFailed"
					color="error"
					:width="`${amountIntegrityFailedIncrement / totalEntries * 100}%`"
				>
					{{ amountIntegrityFailedIncrement }}
				</v-sheet>

				<v-sheet
					v-if="amountIntegrityCorrect"
					color="success"
					:width="`${amountIntegrityCorrectIncrement / totalEntries * 100}%`"
				>
					{{ amountIntegrityCorrectIncrement }}
				</v-sheet>
			</v-sheet>

			<table class="import-table">
				<tbody>
					<tr>
						<td>{{ $t('Number of Households') }}:</td>

						<td class="text-right">
							<v-chip
								variant="flat"
								color="blue-grey-lighten-4"
								class="font-weight-bold"
							>
								{{ totalEntries }}
							</v-chip>
						</td>
					</tr>
					<tr>
						<td>{{ $t('Correct Households') }}:</td>

						<td class="text-right">
							<v-chip
								variant="flat"
								color="success"
								class="font-weight-bold"
							>
								{{ amountIntegrityCorrect }}
							</v-chip>
						</td>
					</tr>
					<tr>
						<td>{{ $t('Households with Integrity Errors') }}:</td>

						<td class="text-right">
							<v-chip
								variant="flat"
								color="error"
								class="font-weight-bold"
							>
								{{ amountIntegrityFailed }}
							</v-chip>
						</td>
					</tr>
				</tbody>
			</table>

			<div class="d-flex flex-wrap ga-2 justify-space-between mt-4">
				<v-btn
					v-if="canCancelImport"
					color="error"
					prepend-icon="ban"
					class="text-none"
					@click="onCancelImport"
				>
					{{ $t('Cancel Import') }}
				</v-btn>

				<div class="d-flex flex-wrap ga-2">
					<v-btn
						v-if="canUploadAndDownloadAffectedRecords"
						color="primary"
						append-icon="file-upload"
						class="text-none"
						@click="isFileUploaded = !isFileUploaded"
					>
						{{ $t("Upload Corrected Records") }}
					</v-btn>

					<v-btn
						v-if="canStartIntegrityCheckAgain"
						:loading="startIntegrityCheckAgainLoading"
						color="primary"
						append-icon="play-circle"
						class="text-none"
						@click="onStartIntegrityCheckAgain"
					>
						{{ $t('Start Integrity Check Again') }}
					</v-btn>

					<v-btn
						v-if="canStartIdentityCheck"
						:disabled="!isImportLoaded || !isUserPermissionGranted(PERMISSIONS.IMPORT_MANAGE)"
						:loading="changeStateButtonLoading"
						color="primary"
						append-icon="play-circle"
						class="text-none"
						@click="onStartIdentityCheck"
					>
						{{ $t('Start Identity Check') }}
					</v-btn>
				</div>
			</div>

			<FileUpload
				v-if="isFileUploaded"
				v-model="dropFile"
				:accept="allowedFileExtensions"
				name="file"
				prepend-icon=""
				hide-details="auto"
				variant="outlined"
				density="compact"
				class="mt-5"
			/>
		</div>
	</v-card>

	<v-card v-if="importFiles.length" class="pa-5 my-10">
		<v-alert
			v-if="canUploadAndDownloadAffectedRecords && isImportLoaded"
			variant="outlined"
			type="info"
			border="start"
			class="mt-2"
		>
			{{ $t('Do not repair your original file.') }}
			{{ $t('Repair only the file with Affected Records.') }}
		</v-alert>

		<v-alert
			v-else-if="isBadFileVersion"
			variant="outlined"
			type="info"
			border="start"
			class="mt-2"
		>
			{{ $t('Please, upload a new file compatible with import template.') }}
		</v-alert>

		<v-alert
			v-else-if="!isViolationMessageHide"
			variant="outlined"
			type="info"
			border="start"
			class="mt-2"
		>
			{{ $t('Please, check Violation for missing columns and '
				+ 'upload a new file compatible with import template.') }}
		</v-alert>

		<div
			v-for="({
				id,
				expectedColumns,
				missingColumns,
				name,
				unexpectedColumns,
				uploadedDate,
				violations,
			}, index) of importFiles"
			:key="`import-file-${id}`"
		>
			<div v-if="invalidFiles.length">
				<table class="my-4 integrity-check-table">
					<tbody>
						<tr
							v-for="({ id, name: invalidFileName, uploadedDate }, key) of invalidFiles"
							v-show="key === 0"
							:key="key"
							:class="{ 'flex-column': isMobile }"
						>
							<td>
								<div class="mb-2">
									<h2 class="text-h6">
										<strong>{{name}}</strong>
									</h2>

									<small>Upload date:
										{{ $moment.utc(uploadedDate).format("YYYY-MM-DD HH:mm") }}
									</small>
								</div>
							</td>

							<td
								v-if="index === 0 && isIntegrityCheckFailed"
								:class="affectedRecordsClass"
							>
								<v-btn
									:disabled="!isImportLoaded"
									color="info"
									append-icon="file-download"
									class="text-none"
									@click="onDownloadAffectedFile(id, invalidFileName)"
								>
									{{ $t('Get Affected Records') }}
								</v-btn>

								<small class="d-block mt-2">{{invalidFileName}}</small>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div>
				<div>
					<v-chip
						color="warning"
						class="rounded-s-lg rounded-be-0 rounded-te-0"
					>
						{{ $t('Expected Columns') }}
					</v-chip>

					<v-chip
						color="grey-darken-1"
						class="rounded-e-lg rounded-bs-0 rounded-ts-0"
					>
						{{ expectedColumns.length }}
					</v-chip>
				</div>

				<div class="mt-2">
					<v-chip
						color="info"
						class="rounded-s-lg rounded-be-0 rounded-te-0"
					>
						{{ $t('Upload Date') }}
					</v-chip>

					<v-chip
						color="grey-darken-1"
						class="rounded-e-lg rounded-bs-0 rounded-ts-0"
					>
						{{ getDateAndTime(uploadedDate) }}
					</v-chip>
				</div>
			</div>

			<div class="content">
				<table class="import-table">
					<tbody>
						<tr>
							<td class="first-column">
								<strong>{{ $t('Violations') }}</strong>
							</td>

							<td>
								<div
									v-for="({
										columns,
										message,
									}, key) of getParsedArray(violations)"
									:key="`violations-${id}-${key}`"
									class="mb-3"
								>
									<v-chip
										v-for="(column, key) of columns"
										:key="`missing-column-${id}-${key}`"
										variant="flat"
										color="error"
										class="font-weight-bold mr-2 mb-2"
									>
										{{ $t(column) }}
									</v-chip>

									<br>

									<span class="text-body-2">
										{{ $t(message) }}
									</span>
								</div>
							</td>
						</tr>
						<tr>
							<td>
								<strong>{{ $t('Missing Columns') }}</strong>
							</td>

							<td>
								<v-chip
									v-for="(column, key) of missingColumns"
									:key="`missing-column-${id}-${key}`"
									variant="flat"
									color="warning"
									class="font-weight-bold mr-2 mb-2"
								>
									{{ column }}
								</v-chip>
							</td>
						</tr>
						<tr>
							<td>
								<strong>{{ $t('Unexpected Columns') }}</strong>
							</td>

							<td>
								<v-chip
									v-for="(column, key) of unexpectedColumns"
									:key="`missing-column-${id}-${key}`"
									variant="flat"
									color="grey-darken-1"
									class="font-weight-bold mr-2 mb-2"
								>
									{{ column }}
								</v-chip>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</v-card>
</template>

<script>
import ImportService from "@/services/ImportService";
import FileUpload from "@/components/Inputs/FileUpload";
import Loading from "@/components/Loading";
import permissions from "@/mixins/permissions";
import vuetifyHelper from "@/mixins/vuetifyHelper";
import { checkResponseStatus } from "@/utils/fetcher";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { IMPORT } from "@/consts";

export default {
	name: "IntegrityStep",

	emits: ["canceledImport", "changeImportState"],

	components: {
		Loading,
		FileUpload,
	},

	mixins: [vuetifyHelper, permissions],

	props: {
		statistics: {
			type: Object,
			required: true,
		},

		loadingChangeStateButton: {
			type: Boolean,
			required: true,
		},

		importStatus: {
			type: String,
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

	data() {
		return {
			amountIntegrityCorrectIncrement: 0,
			amountIntegrityFailedIncrement: 0,
			importStatistics: {},
			dropFile: [],
			startIntegrityCheckAgainLoading: false,
			downloadAffectedRecordsLoading: false,
			changeStateButtonLoading: false,
			invalidFiles: [],
			isFileUploaded: false,
			allowedFileExtensions: IMPORT.SUPPORT_CSV_XLSX_XLS_FILES,
		};
	},

	computed: {
		integrityStepActive() {
			return this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK
				|| this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK_CORRECT
				|| this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK_FAILED;
		},

		isCheckingIntegrity() {
			return this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK;
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
				&& this.dropFile.name;
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
			return this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK_FAILED;
		},

		isViolationMessageHide() {
			return this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK_CORRECT
				|| this.importStatus === IMPORT.STATUS.INTEGRITY_CHECK;
		},

		affectedRecordsClass() {
			return this.isMobile ? "text-left" : "text-right";
		},
	},

	watch: {
		statistics(value) {
			this.importStatistics = value;
		},

		loadingChangeStateButton(value) {
			this.changeStateButtonLoading = value;
		},

		importStatus() {
			this.getAffectedRecords();
		},

		amountIntegrityCorrect(newValue) {
			this.amountIntegrityCorrectIncrement = newValue;
		},

		amountIntegrityFailed(newValue) {
			this.amountIntegrityFailedIncrement = newValue;
		},
	},

	mounted() {
		this.getAffectedRecords();
	},

	methods: {
		async getAffectedRecords() {
			try {
				this.downloadAffectedRecordsLoading = true;
				this.dropFile = [];

				const { importId } = this.$route.params;

				const {
					data: { data },
					status,
					message,
				} = await ImportService.getFilesWithInvalidEntriesFromImport(importId);

				checkResponseStatus(status, message);

				this.invalidFiles = data;
			} catch (e) {
				Notification(`${this.$t("Invalid Files")}: ${e.message || e}`, "error");
			} finally {
				this.downloadAffectedRecordsLoading = false;
			}
		},

		async onDownloadAffectedFile(id, file) {
			try {
				const {
					data,
					status,
					message,
				} = await ImportService.downloadFileWithInvalidEntriesFromImport(id);

				downloadFile(data, file, status, "", message);
			} catch (e) {
				Notification(`${this.$t("Downloaded File")}: ${e.message || e}`, "error");
			}
		},

		onStartIdentityCheck() {
			this.$emit("changeImportState", {
				state: IMPORT.STATUS.IDENTITY_CHECK,
				successMessage: "Identity Check Started Successfully",
				goNext: true,
			});
		},

		async onStartIntegrityCheckAgain() {
			if (!this.dropFile.name) return;

			const { importId } = this.$route.params;

			try {
				this.startIntegrityCheckAgainLoading = true;

				const {
					status,
					message,
				} = await ImportService.uploadFileIntoImport({
					file: this.dropFile,
					importId,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("Uploaded Successfully"), "success");

				this.isFileUploaded = false;
				this.invalidFiles = [];
			} catch (e) {
				Notification(`${this.$t("Upload")}: ${e.message}`, "error");
			} finally {
				this.startIntegrityCheckAgainLoading = false;
				setTimeout(() => {
					this.getAffectedRecords();
				}, 1500);
			}
		},

		getDateAndTime(date) {
			return this.$moment.utc(date).format("YYYY-MM-DD HH:mm");
		},

		getParsedArray(violations) {
			return violations || [];
		},

		onCancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>

<style lang="scss">
.import-progress-bar {
	width: 100%;
	height: 1.4rem;

	> div {
		text-align: center;
	}
}

.integrity-check-table {
	width: 100%;

	tr {
		display: flex;
		justify-content: space-between;
	}
}
</style>
