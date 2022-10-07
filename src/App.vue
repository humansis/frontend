<template>
	<router-view />
</template>

<script>
import { mapActions, mapState } from "vuex";
import { Notification } from "@/utils/UI";
import LocationsService from "@/services/LocationsService";

export default {
	name: "App",

	computed: {
		...mapState([
			"country",
			"countries",
		]),
	},

	watch: {
		$route: "setCountry",
	},

	methods: {
		...mapActions([
			"storeCountry",
			"storeAdmNames",
			"storeTranslations",
		]),

		async setCountry() {
			const { country } = this.$route.params;
			if (country && country !== this.country?.iso3?.toLowerCase()) {
				const foundCountry = this.countries?.find((item) => item.iso3.toLowerCase() === country);
				if (foundCountry) {
					await this.storeCountry(foundCountry);
					await this.fetchAdmNames();
				}
			}
		},

		async fetchAdmNames() {
			await LocationsService.getAdmNames()
				.then(({ data }) => {
					this.storeAdmNames(data);
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Location Names")} ${e}`, "is-danger");
				});
		},
	},
};
</script>
