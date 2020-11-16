export default {
	updateCountry: ({ commit }, countries) => {
		const country = localStorage.getItem("country") || "KHM";
		const countryObj = countries.find((item) => item.iso3 === country);
		if (countryObj) {
			commit("changeCountry", countryObj);
		}
	},
};
