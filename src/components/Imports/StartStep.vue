<template>
	<v-card class="pa-5">
		<FileUpload
			v-if="isUploadBoxVisible"
			v-model="dropFile"
			:accept="allowedFileExtensions"
			name="file"
			prepend-icon=""
			hide-details="auto"
			variant="outlined"
			density="compact"
			class="mt-4"
			@update:modelValue="onFileUploadChange"
		/>

		<v-divider />

		<div class="d-flex justify-space-between mt-4">
			<v-btn
				v-if="canCancelImport"
				color="warning"
				class="text-none"
				variant="elevated"
				prepend-icon="ban"
				@click="onCancelImport"
			>
				{{ $t('Cancel Import') }}
			</v-btn>

			<v-btn
				v-if="canStartImport"
				:disabled="isStartImportDisabled || !isUserPermissionGranted(PERMISSIONS.IMPORT_MANAGE)"
				:loading="loadingChangeStateButton || startLoading"
				color="primary"
				class="text-none"
				variant="elevated"
				append-icon="play-circle"
				@click="onStartImport"
			>
				{{ $t('Start Import') }}
			</v-btn>
		</div>
	</v-card>
</template>

<script>
import ImportService from "@/services/ImportService";
import FileUpload from "@/components/Inputs/FileUpload";
import permissions from "@/mixins/permissions";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { IMPORT } from "@/consts";

export default {
	name: "StartStep",

	emits: [
		"moveStepForward",
		"fetchStatistics",
		"changeImportState",
		"canceledImport",
	],

	components: {
		FileUpload,
	},

	mixins: [permissions],

	props: {
		importStatus: {
			type: String,
			default: "",
		},

		importFiles: {
			type: Array,
			default: () => [],
		},

		loadingChangeStateButton: {
			type: Boolean,
			required: true,
		},
	},

	data() {
		return {
			dropFile: [],
			isFileValid: false,
			changeStateButtonLoading: false,
			startLoading: false,
			allowedFileExtensions: IMPORT.SUPPORT_CSV_XLSX_XLS_FILES,
		};
	},

	computed: {
		isStartImportDisabled() {
			return this.importStatus !== IMPORT.STATUS.NEW
				|| (!this.dropFile.name && !this.importFiles.length)
				|| !this.isFileValid;
		},

		isStatusNew() {
			return this.importStatus === IMPORT.STATUS.NEW;
		},

		canStartImport() {
			return this.importStatus === IMPORT.STATUS.NEW || this.importFiles.length;
		},

		canCancelImport() {
			return this.importStatus !== IMPORT.STATUS.FINISH
				&& this.importStatus !== IMPORT.STATUS.CANCEL
				&& this.importStatus !== IMPORT.STATUS.IMPORTING;
		},

		isUploadStarted() {
			return this.startLoading
				|| this.importStatus === IMPORT.STATUS.UPLOADING;
		},

		isUploadBoxVisible() {
			return this.importStatus === IMPORT.STATUS.NEW
				|| this.importStatus === IMPORT.STATUS.UPLOADING;
		},
	},

	watch: {
		importStatus(value) {
			if (value === IMPORT.STATUS.INTEGRITY_CHECK
				|| value === IMPORT.STATUS.INTEGRITY_CHECK_FAILED) {
				this.$emit("moveStepForward");
			}
		},

		loadingChangeStateButton(value) {
			this.changeStateButtonLoading = value;
		},
	},

	methods: {
		async onStartImport() {
			const { importId } = this.$route.params;
			this.startLoading = true;

			if (this.dropFile.name) {
				try {
					const {
						status,
						message,
					} = await ImportService.uploadFileIntoImport({
						file: this.dropFile,
						importId,
					});

					checkResponseStatus(status, message);

					Notification(this.$t("Uploaded Successfully"), "success");
					this.dropFile = [];
					this.startLoading = false;
					this.$emit("fetchStatistics");
				} catch (e) {
					Notification(`${this.$t("Upload")}: ${e.message || e}`, "error");
				} finally {
					this.startLoading = false;
				}
			} else if (this.importFiles.length) {
				this.$emit("changeImportState", {
					state: IMPORT.STATUS.INTEGRITY_CHECK,
					successMessage: "Integrity Check Started Successfully",
					goNext: true,
				});
			}

			this.startLoading = false;
		},

		onCancelImport() {
			this.$emit("canceledImport");
		},

		onFileUploadChange() {
			const file = this.dropFile;

			this.isFileValid = file instanceof File
				&& this.allowedFileExtensions.includes(file.type);
		},
	},
};
</script>
