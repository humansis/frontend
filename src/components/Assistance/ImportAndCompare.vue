<template>
	<div>
		<p class="mb-4 mt-5 has-text-centered">
			<strong>
				{{ $t(`
				Import the file that contains the modified distribution.
				The database will be updated with the new list of beneficiaries for this
				distribution when you will click on "update" after importing.
				`) }}
			</strong>
		</p>
		<b-field class="file">
			<b-upload v-model="file" expanded>
				<a class="button is-primary is-fullwidth">
					<b-icon icon="upload" />
					<span>{{ $t('Click to Upload') }}</span>
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
						<p>{{ $t('Add File Or Drag And Drop') }}</p>
					</div>
				</section>
			</b-upload>
		</b-field>

		<b-taglist v-for="(file, index) in dropFiles" attached :key="index">
			<b-tag
				size="is-medium"
				type="is-dark"
				close-type='is-danger'
				closable
				attached
				@close="deleteDropFile(index)"
			>
				<b-icon icon="file-alt" />
				{{ file.name }}
			</b-tag>
		</b-taglist>
		<b-button
			v-if="dropFiles.length"
			icon-left="file-import"
			type="is-danger"
		>
			{{ $t('Import') }}
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
