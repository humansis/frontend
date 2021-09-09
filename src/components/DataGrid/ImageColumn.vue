<template>
	<b-image
		v-if="image"
		style="height: 35px; width: 35px; padding: 1%;"
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
