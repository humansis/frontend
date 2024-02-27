import { mapState } from "vuex";

export default {
	computed: {
		...mapState(["country"]),
	},

	methods: {
		isCountryMatching(secondCountryIso) {
			return this.country.iso3 === secondCountryIso;
		},
	},
};
