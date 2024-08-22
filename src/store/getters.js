function parseVuexStorageValue(value) {
	const state = JSON.parse(localStorage.getItem("vuex"));
	if (state) {
		return state[value];
	}
	return null;
}

export default {
	getUserFromVuexStorage: () => parseVuexStorageValue("user"),
	getCountriesFromVuexStorage: () => parseVuexStorageValue("countries"),
	getCountryFromVuexStorage: () => parseVuexStorageValue("country"),
	getLanguageFromVuexStorage: () => parseVuexStorageValue("language"),
	getTranslationsFromVuexStorage: () => parseVuexStorageValue("translations"),
	getUserPermissionsFromVuexStorage: () => parseVuexStorageValue("userPermissions"),
	getAdmNamesFromVuexStorage: () => parseVuexStorageValue("admNames"),
	getInstitutionIdNamesVuexStorage: () => parseVuexStorageValue("institutionIdNames"),
};
