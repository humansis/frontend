<template>
	<router-view :key="key" />
	<VSonner position="top-center" :visibleToasts="4" expand />
</template>

<script>
import { VSonner } from "vuetify-sonner";

export default {
	name: "App",

	components: {
		VSonner,
	},

	data() {
		return {
			key: null,
		};
	},

	watch: {
		$route(newRoute, oldRoute) {
			if (oldRoute.name === newRoute.name
				&& oldRoute.params.countryCode !== newRoute.params.countryCode) {
				this.key = this.$route.fullPath;
			}
		},
	},
};
</script>
