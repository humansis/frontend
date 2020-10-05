<template>
	<div>
		<div>Hello</div>
		<b-button @click="clickMe">Click Me</b-button>
		<DistributionMap />
	</div>
</template>

<script>
import DistributionMap from "../components/Home/DistributionMap.vue";

export default {
	name: "Home",
	components: {
		DistributionMap,
	},
	methods: {
		clickMe() {
			this.$buefy.notification.open("Clicked!!");
		},
	},
};
</script>
