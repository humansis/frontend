<template>
	<div class="text-center has-redirect-message">
		<h1 class="has-redirect-code">404</h1>

		<h2 class="text-h4 text-grey-darken-2 my-10">{{ $t("Page Not Found") }}</h2>

		<v-btn
			size="x-large"
			color="light-blue-lighten-4"
			prepend-icon="home"
			class="text-none"
			@click="$router.push({ name: 'root' })"
		>
			{{ $t('Go to Dashboard') }}
		</v-btn>
	</div>
</template>

<script>
export default {
	name: "NotFound",
};
</script>
