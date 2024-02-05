<template>
	<v-card class="pa-5">
		<FileUpload
			v-if="isUploadBoxVisible"
			v-model="dropFiles"
			:accept="allowedFileExtensions"
			prepend-icon=""
			hide-details="auto"
			variant="outlined"
			density="compact"
			class="mt-4"
			@update:modelValue="onFileUploadChange"
		/>

		<v-alert
			v-if="dropFiles.length > 1"
			variant="outlined"
			type="warning"
			border="top"
			class="mt-4"
		>
			{{ $t('You can upload only one file.') }}
		</v-alert>

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
				:disabled="!disabledStartImport"
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

	props: {
		status: {
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
			dropFiles: [],
			isFileValid: false,
			changeStateButtonLoading: false,
			startLoading: false,
			importStatus: "",
			allowedFileExtensions: IMPORT.SUPPORT_CSV_XLSX_XLS_FILES,
		};
	},

	computed: {
		disabledStartImport() {
			return this.importStatus === IMPORT.STATUS.NEW
				&& (this.dropFiles.length === 1 || this.importFiles.length)
				&& this.isFileValid;
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
		status(value) {
			this.importStatus = value;

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
		deleteDropFile(index) {
			this.dropFiles.splice(index, 1);
		},

		async onStartImport() {
			const { importId } = this.$route.params;
			this.startLoading = true;

			if (this.dropFiles.length) {
				await ImportService.uploadFilesIntoImport(importId, this.dropFiles)
					.then(({ status, message }) => {
						if (status === 200) {
							Notification(this.$t("Uploaded Successfully"), "success");
							this.dropFiles = [];
							this.startLoading = false;
							this.$emit("fetchStatistics");
						} else {
							Notification(message, "warning");
						}
					}).catch((e) => {
						this.startLoading = false;
						Notification(`${this.$t("Upload")} ${e.message || e}`, "error");
					});
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
			const file = this.dropFiles[0];

			this.isFileValid = file instanceof File
				&& this.allowedFileExtensions.includes(file.type);
		},
	},
};
</script>
