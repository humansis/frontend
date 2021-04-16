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
		...mapActions(["storeCountry", "storeLanguage"]),

		setCountryAndLanguage() {
			if (!localStorage.getItem("vuex")) {
				this.storeCountry(CONST.DEFAULT_COUNTRY);
				this.storeLanguage(this.defaultLanguage);
			}
		},
	},
};
</script>
