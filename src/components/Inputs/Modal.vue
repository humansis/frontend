<template>
	<v-dialog
		v-model="$attrs.modelValue"
		width="960"
		scrollable
	>
		<v-card>
			<template v-if="!customHeader">
				<v-card-title class="text-h6 font-weight-bold">
					{{ $t(header) }}
				</v-card-title>

				<v-divider />
			</template>

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

		customHeader: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
