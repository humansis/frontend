<template>
	<div>
		<p class="mb-4 mt-5 has-text-centered">
			<strong>
				Import the file that contains the modified distribution.
				The database will be updated with the new list of beneficiaries for this
				distribution when you will click on "update" after importing.
			</strong>
		</p>
		<b-field class="file">
			<b-upload v-model="file" expanded>
				<a class="button is-primary is-fullwidth">
					<b-icon icon="upload" />
					<span>Click to upload</span>
				</a>
			</b-upload>
		</b-field>
		<b-field>
			<b-upload v-model="dropFiles" multiple drag-drop expanded>
				<section class="section">
					<div class="content has-text-centered">
						<p>
							<b-icon icon="upload" size="is-large" />
						</p>
						<p>Add File Or Drag And Drop</p>
					</div>
				</section>
			</b-upload>
		</b-field>

		<b-taglist v-for="(file, index) in dropFiles" attached :key="index">
			<b-tag  size="is-large" type="is-dark">
				<b-icon icon="file-alt" size="is-medium" />
			</b-tag>
			<b-tag size="is-large" type="is-info">
				{{file.name}}
				<button
					class="delete is-medium"
					type="button"
					@click="deleteDropFile(index)"
				/>
			</b-tag>
		</b-taglist>
		<b-button
			v-if="dropFiles.length"
			icon-left="file-import"
			type="is-danger"
		>
			Import
		</b-button>
	</div>
</template>

<script>
export default {
	name: "ImportAndCompare",

	data() {
		return {
			file: {},
			dropFiles: [],
		};
	},

	methods: {
		deleteDropFile(index) {
			this.dropFiles.splice(index, 1);
		},
	},
};
</script>
