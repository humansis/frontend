import CONST from "@/const";

export default {
	updateCountry: ({ commit }, countries) => {
		const country = localStorage.getItem("country") || CONST.DEFAULT_COUNTRY;
		const countryObj = countries.find((item) => item.iso3 === country);
		if (countryObj) {
			commit("changeCountry", countryObj);
		}
	},
};
