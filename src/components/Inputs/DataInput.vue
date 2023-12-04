<template>
	<v-text-field>
		<template v-slot:label>
			<span>{{ $t(label) }}
				<i v-if="optional" class="test">- {{ $t('Optional') }}</i>
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
	},
};
</script>

<style lang="scss">
.v-label {
	opacity: .65;

	> span {
		font-size: .9rem;

		> i {
			font-size: 13px;
		}
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
