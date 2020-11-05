export default {
	updateCountry: ({ commit }) => {
		const country = localStorage.getItem("country");
		commit("changeCountry", country === null ? "KHM" : country);
	},
};
