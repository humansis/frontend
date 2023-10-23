<template>
	<div class="has-text-centered has-redirect-message">
		<h1 class="title mb-4 has-text-weight-bold is-size-1-mobile has-redirect-code">404</h1>
		<h2 class="subtitle is-size-4-mobile is-size-3">{{ $t("Page Not Found") }}</h2>
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
