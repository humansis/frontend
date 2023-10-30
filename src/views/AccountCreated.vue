<template>
	<div class="has-text-centered has-redirect-message">
		<h1 class="subtitle is-size-4-mobile is-size-1 pb-5">{{ $t("Account created") }}</h1>

		<h2 class="subtitle is-size-4-mobile is-size-3">
			{{ $t(`Your account was created and login was successful,
			please contact support (georgios.petrou@peopleinneed.net) to assign a role in Humansis.`) }}
		</h2>

		<b-button
			class="mt-4 is-size-5-mobile"
			icon-left="home"
			outlined
			type="is-info is-light is-large"
			@click="$router.push({ name: 'Logout' })"
		>
			<span class="button-text">{{ $t("Go to Login page") }}</span>
		</b-button>
	</div>
</template>

<script>
export default {
	name: "AccountCreated",
};
</script>
