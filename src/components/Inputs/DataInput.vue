<template>
	<v-text-field
		:variant="variant"
		:density="density"
		:hide-details="hideDetails"
		:placeholder="$t(placeHolder)"
	>
		<template v-slot:label>
			<span>{{ $t(label) }}
				<i v-if="optional" class="optional-text">- {{ $t('Optional') }}</i>
			</span>
		</template>
	</v-text-field>
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

		placeHolder: {
			type: String,
			default: "",
		},
	},
};
</script>

<style lang="scss">
.v-label {
	opacity: .65;

	> span {
		font-size: .9rem;
	}
}

.v-field--disabled {
	opacity: .8;
	background-color: #f5f5f5;
}

.v-field--disabled,
.v-input--disabled {
	pointer-events: unset;

	.v-field__input,
	.v-field__append-inner,
	.v-chip__content > span {
		cursor: not-allowed !important;
	}
}
</style>
