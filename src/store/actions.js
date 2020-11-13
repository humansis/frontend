import LocationsService from "@/services/LocationsService";

export default {
	updateCountry: ({ commit }) => {
		const country = localStorage.getItem("country") || "KHM";
		LocationsService.getListOfCountries()
			.then((response) => {
				const countryObj = response.data.find((item) => item.iso3 === country);
				if (countryObj) {
					commit("changeCountry", countryObj);
				}
			});
	},
};
