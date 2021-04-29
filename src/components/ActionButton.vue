<template>
	<b-tooltip :label="tooltip" :active="isActive" :type="type">
		<b-button size="is-small" :class="type" :disabled="disabled" @click="$emit('click')">
			<b-icon :icon="icon" />
		</b-button>
	</b-tooltip>
</template>

<script>
export default {
	name: "ActionButton",

	props: {
		icon: {
			type: String,
			required: true,
		},
		disabled: {
			type: Boolean,
			required: false,
			default: false,
		},
		type: String,
		tooltip: String,
	},

	computed: {
		isActive() {
			return !!this.tooltip?.length;
		},
	},
};
</script>
