<template>
	<div>
		<b-loading v-if="bLoading" active :is-full-page="false" :canCancel="true" />
		<vue-loading v-else :type="type" :size="computeSize" :color="color" />
	</div>
</template>

<script>

export default {
	name: "Loading",

	props: {
		type: String,
		bLoading: Boolean,
		isSmall: Boolean,
		isNormal: Boolean,
		isMedium: Boolean,
		isLarge: Boolean,
		size: Object,

		color: {
			type: String,
			default: "#5ac1dd",
		},
	},

	computed: {
		computeSize() {
			if (this.size) {
				return this.size;
			}
			if (this.isSmall) {
				return { width: "30px", height: "30px" };
			}
			if (this.isNormal) {
				return { width: "40px", height: "40px" };
			}
			if (this.isMedium) {
				return { width: "50px", height: "50px" };
			}
			if (this.isLarge) {
				return { width: "70px", height: "70px" };
			}
			return { width: "40px", height: "40px" };
		},
	},
};
</script>
