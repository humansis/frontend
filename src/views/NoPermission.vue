<template>
	<div class="text-center has-redirect-message">
		<h1 class="has-redirect-code">403</h1>

		<h2 class="text-h4 text-grey-darken-2 my-10">{{ $t("Forbidden") }}</h2>

		<h2 class="text-h5 text-grey-darken-2 my-10">
			{{ $t("(You do not have permission to requested page.)") }}
		</h2>

		<v-btn
			:to="{ name: redirect.pageName, params: { countryCode: 'SYR' } }"
			size="x-large"
			color="light-blue-lighten-4"
			prepend-icon="home"
			class="text-none"
		>
			{{ $t(redirect.buttonName) }}
		</v-btn>
	</div>
</template>

<script>
import permissions from "@/mixins/permissions";
import { ROUTER } from "@/consts";

export default {
	name: "NotPermission",

	mixins: [permissions],

	data() {
		return {
			ROUTER,
			redirect: {
				buttonName: "",
				pageName: "",
			},
		};
	},

	created() {
		this.getRedirectPage();
	},

	methods: {
		getRedirectPage() {
			this.redirect = {
				buttonName: "Go to Profile page",
				pageName: ROUTER.ROUTE_NAME.HOME,
			};
		},
	},
};
</script>
