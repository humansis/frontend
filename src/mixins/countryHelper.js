import { mapState } from "vuex";
import { GENERAL } from "@/consts";

export default {
	computed: {
		...mapState(["country"]),

		isCountrySYR() {
			return this.isCountryMatching(GENERAL.COUNTRIES_ISO3.SYR);
		},

		isCountryCOD() {
			return this.isCountryMatching(GENERAL.COUNTRIES_ISO3.COD);
		},
	},

	methods: {
		isCountryMatching(secondCountryIso) {
			return this.country.iso3 === secondCountryIso;
		},
	},
};
