<template>
	<b-tooltip :label="tooltip" :active="isActive">
		<button class="button is-light table-action">
			<b-icon
				:icon="icon"
				:type="type"
				size="is-medium"
			/>
		</button>
	</b-tooltip>
</template>

<script>
export default {
	name: "ActionButton",

	props: {
		icon: String,
		type: String,
		tooltip: String,
	},

	computed: {
		isActive() {
			return !!(this.tooltip && this.tooltip.length !== 0);
		},
	},
};
</script>
