<template>
	<div class="has-text-centered has-redirect-message">
		<h1 class="title mb-4 has-text-weight-bold is-size-1-mobile has-redirect-code">403</h1>
		<h2 class="subtitle is-size-4-mobile is-size-3">{{ $t("Forbidden") }}</h2>
		<h2 class="subtitle is-size-4-mobile is-size-3">
			{{ $t("(You do not have permission to requested page.)") }}
		</h2>
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
	name: "NotPermission",
};
</script>
