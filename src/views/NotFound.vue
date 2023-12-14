<template>
	<div class="text-center has-redirect-message mt-16">
		<h1 class="has-redirect-code">404</h1>

		<h2 class="text-h4 text-grey-darken-2 my-10">{{ $t("Page Not Found") }}</h2>

		<div class="text-h5 text-grey-darken-2 my-10 text-left">
			<p>{{ $t('Possible reasons')}}:</p>

			<p class="pt-3">- {{ $t('There might be a mistake (typo) in the address')}}</p>

			<p>- {{ $t('The link might be outdated')}}</p>

			<p>- {{ $t('The page was removed')}}</p>

			<p class="pt-8">{{ $t('If you believe this is an error, contact Administrator at georgios.petrou@peopleinneed.net')}}</p>
		</div>

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
	name: "NotFound",
};
</script>
