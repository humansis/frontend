<template>
	<div>
		<div>Hello</div>

		<b-button @click="clickMe">Click Me</b-button>
	</div>
</template>

<script>
export default {
	name: "Home",

	methods: {
		clickMe() {
			this.$buefy.notification.open("Clicked!!");
		},
	},
};
</script>
