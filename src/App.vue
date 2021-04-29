<template>
	<router-view />
</template>

<script>
import { mapActions } from "vuex";
import CONST from "@/const";

export default {
	created() {
		this.setCountryAndLanguage();
	},

	methods: {
		...mapActions(["storeCountry"]),

		setCountryAndLanguage() {
			if (!localStorage.getItem("vuex")) {
				this.storeCountry(CONST.DEFAULT_COUNTRY);
			}
		},
	},
};
</script>
