<template>
	<v-file-input show-size class="file-upload">
		<template v-slot:prepend-inner>
			<v-icon icon="upload" size="x-large" />

			<p class="pt-3">{{ $t('Add File Or Drag And Drop') }}</p>
		</template>

		<template v-slot:selection="{ fileNames }">
			<template v-for="fileName in fileNames" :key="fileName">
				<v-chip
					size="small"
					label
					color="primary"
					class="me-2"
				>
					{{ fileName }}
				</v-chip>
			</template>
		</template>
	</v-file-input>
</template>

<script>
export default {
	name: "FileUpload",
};
</script>

<style lang="scss">
.file-upload {
	border: .0625rem dashed black;

	.v-input__control > .v-field {
		display: flex;
		min-height: 8rem;
		flex-direction: column;

		.v-field__prepend-inner {
			width: 100%;
			flex-direction: column;
			justify-content: center;
			margin-top: 2.5rem;
		}

		.v-field__field {
			margin: auto auto;

			input {
				position: fixed;
				cursor: pointer;
			}
		}

		.v-field__clearable {
			margin: auto auto;
			padding-bottom: 1rem;
			z-index: 999;
		}
	}
}
</style>
