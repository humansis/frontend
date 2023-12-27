<template>
	<v-dialog
		v-model="$attrs.modelValue"
		width="960"
		scrollable
	>
		<v-card>
			<v-card-title class="text-h6 font-weight-bold">
				{{ $t(header) }}
			</v-card-title>

			<v-divider />

			<slot />
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: "Modal",

	props: {
		header: {
			type: String,
			default: "",
		},
	},
};
</script>
