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

			<div v-if="isStatusNew" class="tags">
				<span v-for="({name}, index) in importFiles"
					:key="index"
					class="tag is-info"
				>
					{{ name }}
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
					:disabled="!disabledStartImport"
					:loading="startButtonLoading"
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
import consts from "@/utils/importConst";

export default {
	name: "StartStep",

	data() {
		return {
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

		importFiles: {
			type: Array,
			default: () => [],
		},
	},

	watch: {
		status(value) {
			this.importStatus = value;
		},
	},

	computed: {
		disabledStartImport() {
			return this.importStatus === consts.STATUS.NEW
				&& (this.dropFiles.length || this.importFiles.length);
		},

		isStatusNew() {
			return this.importStatus === consts.STATUS.NEW;
		},

		canStartImport() {
			return this.importStatus === consts.STATUS.NEW || this.importFiles.length;
		},

		canCancelImport() {
			return this.importStatus !== consts.STATUS.FINISH
				&& this.importStatus !== consts.STATUS.CANCEL
				&& this.importStatus !== consts.STATUS.IMPORTING;
		},
	},

	methods: {
		deleteDropFile(index) {
			this.dropFiles.splice(index, 1);
		},

		startImport() {
			const { importId } = this.$route.params;

			this.startButtonLoading = true;

			if (this.dropFiles.length) {
				ImportService.uploadFilesIntoImport(importId, this.dropFiles).then(({ status }) => {
					if (status === 200) {
						Toast(this.$t("Uploaded Successfully"), "is-success");
						this.dropFiles = [];

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
			} else if (this.importFiles.length) {
				this.$emit("changeImportState", {
					state: consts.STATE.INTEGRITY_CHECKING,
					successMessage: "Integrity Check Started Successfully",
					goNext: true,
				});
			}
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
