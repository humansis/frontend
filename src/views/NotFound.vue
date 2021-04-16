<template>
	<div class="is-center has-text-centered">
		<h1 class="title mb-4 has-text-weight-bold is-size-1-mobile">404</h1>
		<h2 class="subtitle is-size-4-mobile">{{ $t("Page Not Found") }}</h2>
		<b-button
			class="mt-4 is-size-5-mobile"
			icon-left="home"
			outlined
			type="is-info is-light is-large"
			@click="$router.push('/')"
		>
			<span class="button-text">{{ $t("Go to Dashboard") }}</span>
		</b-button>
	</div>
</template>

<script>
export default {
	name: "NotFound",
};
</script>

<style scoped>
h1 {
	font-size: 15rem;
	color: #0e2640;
}

h2 {
	font-size: 2rem;
}

.is-center {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -80%);
}
</style>
