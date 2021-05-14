<template>
	<div class="card">
		<div class="card-content">
			<div class="content">
				<b-progress size="is-large">
					<template #bar>
						<b-progress-bar type="is-success" show-value :value="90"  />
						<b-progress-bar type="is-danger" show-value :value="10" />
					</template>
				</b-progress>
				<table>
					<tbody>
						<tr>
							<td>Number of Records:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-light"
									size="is-medium"
								>
									100
								</b-tag>
							</td>
						</tr>
						<tr>
							<td>Integrity Errors:</td>
							<td class="has-text-right">
								<b-tag
									class="has-text-weight-bold"
									type="is-danger"
									size="is-medium"
								>
									10
								</b-tag>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="buttons mt-5 flex-end">
				<b-button
					type="is-light is-danger"
					icon-right="ban"
				>
					{{ $t('Cancel Import') }}
				</b-button>
				<b-button
					type="is-primary"
					icon-right="play-circle"
				>
					{{ $t('Start Duplicity Check') }}
				</b-button>
				<b-button
					type="is-primary"
					icon-right="file-download"
				>
					{{ $t('Download Affected Records') }}
				</b-button>
				<b-upload v-model="file">
					<span class="file-cta button is-primary">
						<span v-if="file" class="file-label">
							{{ file.name || "Upload Corrected Records"}}
						</span>
						<b-icon icon="file-upload" />
					</span>
				</b-upload>
				<b-button
					v-if="uploadedFile"
					type="is-primary"
					icon-right="play-circle"
				>
					{{ $t('Start Integrity Check Again') }}
				</b-button>
			</div>

		</div>
	</div>
</template>

<script>
export default {
	name: "IntegrityStep",

	data() {
		return {
			file: {},
		};
	},

	computed: {
		uploadedFile() {
			return this.file?.name;
		},
	},
};
</script>
