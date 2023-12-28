<template>
	<v-textarea
		:variant="variant"
		:density="density"
		:hide-details="hideDetails"
	>
		<template v-slot:label>
			<span>{{ $t(label) }}
				<i v-if="optional" class="optional-text">- {{ $t('Optional') }}</i>
			</span>
		</template>
	</v-textarea>
</template>

<script>
export default {
	props: {
		label: {
			type: String,
			default: "",
		},

		optional: {
			type: Boolean,
			default: false,
		},

		variant: {
			type: String,
			default: "outlined",
		},

		density: {
			type: String,
			default: "compact",
		},

		hideDetails: {
			type: String,
			default: "auto",
		},
	},
};
</script>
