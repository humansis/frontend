<template>
	<div>
		<b-button
			class="add-button"
			size="is-medium"
			type="is-warning is-light"
			icon-left="arrow-left"
			@click="goBack"
		>
			Go back
		</b-button>
	</div>
</template>

<script lang="ts">
export default {
	name: "GoBackButton",

	methods: {
		goBack() {
			this.$router.go(-1);
		},
	},
};
</script>
