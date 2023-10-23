<template>
	<div class="card overflow-visible">
		<div class="card-content">
			<b-field v-if="isUploadBoxVisible">
				<b-upload
					v-model="dropFiles"
					multiple
					drag-drop
					:accept="allowedFileExtensions"
					:loading="isUploadStarted"
					:disabled="isUploadStarted"
				>
					<section class="section">
						<div class="content has-text-centered">
							<p>
								<b-icon
									icon="file-upload"
									size="is-large"
								/>
							</p>
							<p>{{ $t("Drop your file here or click to upload") }}</p>
						</div>
					</section>
				</b-upload>
			</b-field>

			<b-message v-if="dropFiles.length > 1" type="is-warning">
				{{ $t('You can upload only one file.') }}
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

			<div v-if="isStatusNew" class="tags">
				<span v-for="({name}, index) in importFiles"
					:key="index"
					class="tag is-info"
				>
					{{ name }}
				</span>
			</div>

			<hr>

			<div class="buttons mt-3 space-between">
				<b-button
					v-if="canCancelImport"
					type="is-light is-danger"
					icon-left="ban"
					@click="cancelImport"
				>
					{{ $t('Cancel Import') }}
				</b-button>
				<b-button
					v-if="canStartImport"
					type="is-primary"
					icon-right="play-circle"
					:disabled="!disabledStartImport"
					:loading="loadingChangeStateButton || startLoading"
					@click="startImport"
				>
					{{ $t('Start Import') }}
				</b-button>
			</div>
		</div>
	</div>
</template>

<script>
import ImportService from "@/services/ImportService";
import { Notification, Toast } from "@/utils/UI";
import { IMPORT } from "@/consts";

export default {
	name: "StartStep",

	props: {
		status: {
			type: String,
			required: false,
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
			changeStateButtonLoading: false,
			startLoading: false,
			importStatus: "",
			allowedFileExtensions: IMPORT.SUPPORT_CSV_XLSX_XLS_FILES,
		};
	},

	computed: {
		disabledStartImport() {
			return this.importStatus === IMPORT.STATUS.NEW
				&& (this.dropFiles.length === 1 || this.importFiles.length);
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

		async startImport() {
			const { importId } = this.$route.params;
			this.startLoading = true;

			if (this.dropFiles.length) {
				await ImportService.uploadFilesIntoImport(importId, this.dropFiles)
					.then(({ status, message }) => {
						if (status === 200) {
							Toast(this.$t("Uploaded Successfully"), "is-success");
							this.dropFiles = [];
							this.startLoading = false;
							this.$emit("fetchStatistics");
						} else {
							Notification(message, "is-warning");
						}
					}).catch((e) => {
						this.startLoading = false;
						if (e.message) Notification(`${this.$t("Upload")} ${e}`, "is-danger");
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

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
