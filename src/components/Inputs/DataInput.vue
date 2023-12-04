<template>
	<v-text-field
		v-bind="$attrs"
	>
		<template v-slot:label>
			<span>{{ $t(label) }}</span>
		</template>
	</v-text-field>
</template>

<script>
export default {
	inheritAttrs: false,

	props: {
		label: {
			type: String,
			default: "",
		},
	},
};
</script>

<style lang="scss">
.v-label {
	opacity: 0.6;

	> span {
		font-size: 14px;
	}
}

.v-field--disabled {
	opacity: .8;
	background-color: #f5f5f5;
}

.v-field--disabled, .v-input--disabled {
	pointer-events: unset;

	input {
		cursor: not-allowed !important;
	}
}
</style>
