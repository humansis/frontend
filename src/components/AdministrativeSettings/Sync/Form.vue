<template>
	<v-card-text>
		<div class="mb-3">
			<p class="font-weight-bold text-body-2 mb-2">{{ $t('Raw Data') }}</p>

			<pre><code>{{ formModel.rawData }}</code></pre>
		</div>

		<div class="mb-6">
			<p class="font-weight-bold text-body-2 mb-2">{{ $t('Validation Error Messages') }}</p>

			<pre><code>{{ formModel.violations }}</code></pre>
		</div>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			v-if="closeButton"
			class="text-none"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>
	</v-card-actions>
</template>

<script>
export default {
	name: "SyncForm",

	emits: ["formClosed"],

	props: {
		formModel: {
			type: Object,
			required: true,
		},

		closeButton: Boolean,
		formDisabled: Boolean,
	},

	methods: {
		onCloseForm() {
			this.$emit("formClosed");
		},
	},
};
</script>

<style scoped>
pre {
	background-color: #f5f5f5;
	padding: 1.25rem 1.5rem;
	white-space: pre;
	word-wrap: normal;
}
</style>
