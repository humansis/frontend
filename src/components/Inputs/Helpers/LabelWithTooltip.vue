<template>
	<span>{{ $t(label) }}
		<i v-if="isOptional" class="optional-text">- {{ $t('Optional') }}</i>

		<v-tooltip
			v-if="labelAppendIconTooltip?.length"
			:text="$t(labelAppendIconTooltip)"
			location="top"
			content-class="tooltip-top"
		>
			<template v-slot:activator="{ props }">
				<v-icon v-bind="props" :icon="labelAppendIcon" class="label-append-icon" />
			</template>
		</v-tooltip>
	</span>
</template>

<script>
export default {
	name: "LabelWithTooltip",

	props: {
		label: {
			type: String,
			required: true,
		},

		isOptional: {
			type: Boolean,
			required: true,
		},

		labelAppendIcon: {
			type: String,
			default: "",
		},

		labelAppendIconTooltip: {
			type: String,
			default: "",
		},
	},
};
</script>
