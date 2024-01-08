<template>
	<v-textarea
		:placeholder="$t(placeholder)"
		variant="outlined"
		density="compact"
		hide-details="auto"
	>
		<template v-slot:label>
			<span>{{ $t(label) }}
				<i v-if="isOptional" class="optional-text">- {{ $t('Optional') }}</i>
			</span>
		</template>

		<template v-if="hasCopyButton" v-slot:append-inner>
			<v-tooltip
				:text="$t('Copy')"
				location="top"
			>
				<template v-slot:activator="{ props }">
					<v-btn
						v-bind="props"
						icon="copy"
						@click="$emit('copy')"
					/>
				</template>
			</v-tooltip>
		</template>
	</v-textarea>
</template>

<script>
export default {
	name: "DataTextarea",

	props: {
		label: {
			type: String,
			default: "",
		},

		placeholder: {
			type: String,
			default: "",
		},

		hasCopyButton: {
			type: Boolean,
			default: false,
		},

		isOptional: {
			type: Boolean,
			default: false,
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
