<template>
	<b-tooltip :label="tooltip" :active="isActive" :type="type">
		<button class="button is-small table-action" :class="type">
			<b-icon :icon="icon" />
		</button>
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
