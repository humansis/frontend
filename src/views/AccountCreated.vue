<template>
	<div class="text-center has-redirect-message mt-16">
		<h1 class="text-h4 text-grey-darken-2 my-10">{{ $t("Account created") }}</h1>

		<h2 class="text-h5 text-grey-darken-2 my-10">
			{{ $t(`Your account was created and login was successful,
			please contact support (georgios.petrou@peopleinneed.net) to assign a role in Humansis.`) }}
		</h2>

		<v-btn
			:to="{ name: ROUTER.ROUTE_NAME.LOGOUT }"
			size="x-large"
			color="light-blue-lighten-4"
			prepend-icon="home"
			class="text-none"
		>
			{{ $t('Go to Login page') }}
		</v-btn>
	</div>
</template>

<script>
import { ROUTER } from "@/consts";

export default {
	name: "AccountCreated",

	data() {
		return {
			ROUTER,
		};
	},
};
</script>
