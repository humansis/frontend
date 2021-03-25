<template>
	<b-tooltip :label="tooltip" :active="isActive" :type="type">
		<b-button size="is-small" :class="type">
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
