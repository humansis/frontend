<template>
	<router-view />

	<VSonner position="bottom-left" />
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
