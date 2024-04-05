<template>
	<span>{{ $t(label) }}
		<i v-if="isOptional" class="optional-text">- {{ $t('Optional') }}</i>

		<v-tooltip
			v-if="tooltipText?.length"
			:text="$t(tooltipText)"
			location="top"
			content-class="tooltip-top"
		>
			<template v-slot:activator="{ props }">
				<v-icon v-bind="props" :icon="icon" class="label-icon" />
			</template>
		</v-tooltip>
	</span>
</template>

<script>
export default {
	name: "ExtendedLabel",

	props: {
		label: {
			type: String,
			required: true,
		},

		isOptional: {
			type: Boolean,
			default: false,
		},

		icon: {
			type: String,
			default: "circle-info",
		},

		tooltipText: {
			type: String,
			required: true,
		},
	},
};
</script>
