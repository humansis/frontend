<template>
	<router-view />
</template>

<script>
import { mapActions } from "vuex";

export default {
	name: "ProjectView",

	methods: {
		...mapActions(["removeAssistanceFromState", "removeProjectFromState"]),
	},

	beforeDestroy() {
		this.removeAssistanceFromState();
		this.removeProjectFromState();
	},
};
</script>
