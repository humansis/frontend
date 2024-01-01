<template>
	<div class="text-center">
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
