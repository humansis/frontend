<template>
	<router-view />
</template>

<script>
import { mapActions } from "vuex";
import CONST from "@/const";

export default {
	data() {
		return {
			defaultLanguage: {
				name: CONST.DEFAULT_LANGUAGE,
				key: CONST.DEFAULT_LANGUAGE,
			},
		};
	},

	created() {
		this.setCountryAndLanguage();
	},

	methods: {
		...mapActions(["updateCountry", "updateLanguage"]),

		setCountryAndLanguage() {
			if (!localStorage.getItem("vuex")) {
				this.updateCountry({
					iso3: CONST.DEFAULT_COUNTRY,
				});

				this.updateLanguage(this.defaultLanguage);
			}
		},
	},
};
</script>
