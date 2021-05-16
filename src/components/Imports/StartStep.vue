<template>
	<div class="card">
		<div class="card-content">
			<b-field>
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
							<p>Drop your files here or click to upload</p>
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
					type="is-light is-danger"
					icon-right="ban"
					@click="cancelImport"
				>
					{{ $t('Cancel Import') }}
				</b-button>
				<b-button
					type="is-primary"
					icon-right="play-circle"
					:disabled="!filesCount"
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
import { Toast } from "@/utils/UI";

export default {
	name: "StartStep",

	data() {
		return {
			dropFiles: [],
			startButtonLoading: false,
		};
	},

	computed: {
		filesCount() {
			return this.dropFiles?.length;
		},
	},

	methods: {
		deleteDropFile(index) {
			this.dropFiles.splice(index, 1);
		},

		startImport() {
			this.startButtonLoading = true;
			// TODO Start Import Service
			Toast("Import Started", "is-success");
		},

		cancelImport() {
			this.$emit("canceledImport");
		},
	},
};
</script>
