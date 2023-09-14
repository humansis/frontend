<template>
	<b-tooltip :label="tooltip" :active="isActive" :type="type">
		<b-button :size="iconSize" :class="type" :disabled="disabled" @click="$emit('click')">
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
		iconSize: {
			type: String,
			default: "is-small",
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
