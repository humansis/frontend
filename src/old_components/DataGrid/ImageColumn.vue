<template>
	<b-image
		v-if="image"
		class="image-column"
		alt="Image"
		:src="image"
	/>
	<p v-else>{{ $t("None") }}</p>
</template>

<script>
export default {
	name: "ImageColumn",

	props: {
		image: String,
	},
};
</script>

<style scoped>
.image-column {
	height: 35px !important;
	width: 35px !important;
	overflow: hidden;
}
</style>
