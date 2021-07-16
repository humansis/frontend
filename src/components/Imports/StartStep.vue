<template>
	<div class="card overflow-visible">
		<div class="card-content">
			<b-field>
				<b-upload
					v-model="dropFiles"
					multiple
					drag-drop
					:disabled="!canStartImport"
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

			<hr>

			<div class="buttons mt-3 flex-end">
				<b-button
					v-if="canCancelImport"
					type="is-light is-danger"
					icon-right="ban"
					@click="cancelImport"
				>
					{{ $t('Cancel Import') }}
				</b-button>
				<b-button
					v-if="canStartImport"
					type="is-primary"
					icon-right="play-circle"
					:disabled="!filesCount"
					:loading="startButtonLoading"
					@click="startImport"
				>
					{{ $t('Start Import') }}
				</b-button>
				<ExportButton
					space-between
					type="is-primary"
					position="is-top-right"
					label="Download Template"
					:loading="exportLoading"
					:formats="{ xlsx: true, csv: true, ods: true}"
					@onExport="downloadTemplate"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import ImportService from "@/services/ImportService";
import ExportButton from "@/components/ExportButton";
import { Notification, Toast } from "@/utils/UI";
import consts from "@/utils/importConst";

export default {
	name: "StartStep",

	components: {
		ExportButton,
	},

	data() {
		return {
			exportLoading: false,
			dropFiles: [],
			startButtonLoading: false,
			importStatus: "",
		};
	},

	props: {
		status: {
			type: String,
			required: false,
			default: "",
		},
	},

	watch: {
		status(value) {
			this.importStatus = value;
		},
	},

	computed: {
		filesCount() {
			return this.dropFiles?.length;
		},

		canStartImport() {
			return this.importStatus === consts.STATUS.NEW;
		},

		canCancelImport() {
			return this.importStatus !== consts.STATUS.FINISH
				&& this.importStatus !== consts.STATUS.CANCEL;
		},
	},

	methods: {
		deleteDropFile(index) {
			this.dropFiles.splice(index, 1);
		},

		startImport() {
			const { importId } = this.$route.params;

			this.startButtonLoading = true;

			ImportService.uploadFilesIntoImport(importId, this.dropFiles).then(({ status }) => {
				if (status === 200) {
					Toast(this.$t("Uploaded Successfully"), "is-success");
					this.$emit("changeImportState", {
						state: consts.STATE.INTEGRITY_CHECKING,
						successMessage: "Integrity Check Started Successfully",
						goNext: true,
					});
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Upload")} ${e}`, "is-danger");
			}).finally(() => {
				this.startButtonLoading = false;
			});
		},

		async downloadTemplate(format) {
			this.exportLoading = true;
			await ImportService.exportTemplate(format)
				.then(({ data }) => {
					const blob = new Blob([data], { type: data.type });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = `import-template.${format}`;
					link.click();
				})
				.catch((e) => {
					if (e.message) {
						Notification(`${this.$t("Downloading Template")} ${e}`, "is-danger");
					}
				});
			this.exportLoading = false;
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
