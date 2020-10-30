<template>
	<button class="button is-light">
		<b-icon
			:icon="icon"
			:type="type"
			size="is-medium"
		/>
	</button>
</template>

<script>
export default {
	name: "ActionButton",
	props: {
		icon: String,
		type: String,
	},
};
</script>

<style scoped>

</style>
