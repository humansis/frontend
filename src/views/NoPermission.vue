<template>
	<div class="text-center has-redirect-message">
		<h1 class="has-redirect-code">403</h1>

		<h2 class="text-h4 text-grey-darken-2 my-10">{{ $t("Forbidden") }}</h2>

		<h2 class="text-h5 text-grey-darken-2 my-10">
			{{ $t("(You do not have permission to requested page.)") }}
		</h2>

		<v-btn
			size="x-large"
			color="light-blue-lighten-4"
			prepend-icon="home"
			class="text-none"
			@click="$router.push({ name: 'Dashboard' })"
		>
			{{ $t('Go to Dashboard') }}
		</v-btn>
	</div>
</template>

<script>
export default {
	name: "NotPermission",
};
</script>
