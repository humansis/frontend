function parseStorageValue(value) {
	const state = JSON.parse(localStorage.getItem("vuex"));
	if (state) {
		return state[value];
	}
	return null;
}

export default {
	getCountryFromLocalStorage: () => parseStorageValue("country"),
	getLanguageFromLocalStorage: () => parseStorageValue("language"),
};
