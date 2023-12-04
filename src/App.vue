<template>
	<router-view />
	<VSonner position="top-center" visibleToasts="4" />
</template>

<script>
import { VSonner } from "vuetify-sonner";

export default {
	name: "App",

	components: {
		VSonner,
	},
};
</script>
