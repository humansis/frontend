<template>
	<div :class="customClass">
		<v-progress-circular indeterminate :size="computeSize" :color="color" />
	</div>
</template>

<script>

export default {
	name: "Loading",

	props: {
		isSmall: {
			type: Boolean,
			default: false,
		},

		isMedium: {
			type: Boolean,
			default: false,
		},

		isLarge: {
			type: Boolean,
			default: false,
		},

		color: {
			type: String,
			default: "primary",
		},

		customClass: {
			type: String,
			default: "text-center",
		},
	},

	computed: {
		computeSize() {
			if (this.isSmall) {
				return 30;
			}

			if (this.isMedium) {
				return 60;
			}

			if (this.isLarge) {
				return 70;
			}

			return 45;
		},
	},
};
</script>
