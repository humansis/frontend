import { mapState } from "vuex";
import LocationsService from "@/services/LocationsService";
import { copyObject } from "@/utils/helpers";

export default {
	computed: {
		...mapState(["admNames"]),
	},

	methods: {
		setLocationNames() {
			this.filtersOptions.adm1.name = this.admNames.adm1;
			this.filtersOptions.adm1.placeholder = `${this.$t("Select")} ${this.admNames.adm1}`;

			this.filtersOptions.adm2.name = this.admNames.adm2;
			this.filtersOptions.adm2.placeholder = `${this.$t("Select")} ${this.admNames.adm2}`;

			this.filtersOptions.adm3.name = this.admNames.adm3;
			this.filtersOptions.adm3.placeholder = `${this.$t("Select")} ${this.admNames.adm3}`;

			this.filtersOptions.adm4.name = this.admNames.adm4;
			this.filtersOptions.adm4.placeholder = `${this.$t("Select")} ${this.admNames.adm4}`;
		},

		async fetchProvinces() {
			await LocationsService.getListOfAdm1()
				.then(({ data }) => {
					this.filtersOptions.adm1.data = data;
					this.filtersOptions.adm1.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm1)} ${e}`, "is-danger");
				});
		},

		fillParentProvinces() {
			this.filtersOptions.adm2.data.forEach((item, index) => {
				if (item.hasDuplicity) {
					const parentLocation = this.filtersOptions.adm1.data
						.filter((item2) => item2.id === item.parentId)[0];

					this.filtersOptions.adm2.data[index].parentLocationName = parentLocation.name;
				}
			});
		},

		async fetchDistricts() {
			this.filtersOptions.adm2.loading = true;
			await LocationsService.getListOfAdm2()
				.then(({ data }) => {
					this.filtersOptions.adm2.data = data;
					this.filtersOptions.adm2.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm2)} ${e}`, "is-danger");
				});
		},

		fillParentDistricts() {
			this.filtersOptions.adm3.data.forEach((item, index) => {
				if (item.hasDuplicity) {
					const parentLocation = this.filtersOptions.adm2.data
						.filter((item2) => item2.id === item.parentId)[0];

					this.filtersOptions.adm3.data[index].parentLocationName = parentLocation.name;
				}
			});
		},

		async fetchCommunes() {
			this.filtersOptions.adm3.loading = true;
			await LocationsService.getListOfAdm3()
				.then(({ data }) => {
					this.filtersOptions.adm3.data = data;
					this.filtersOptions.adm3.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm3)} ${e}`, "is-danger");
				});
		},

		fillParentCommunes() {
			this.filtersOptions.adm4.data.forEach((item, index) => {
				if (item.hasDuplicity) {
					const parentLocation = this.filtersOptions.adm3.data
						.filter((item2) => item2.id === item.parentId)[0];

					this.filtersOptions.adm4.data[index].parentLocationName = parentLocation.name;
				}
			});
		},

		async fetchVillages() {
			this.filtersOptions.adm4.loading = true;
			await LocationsService.getListOfAdm4()
				.then(({ data }) => {
					this.filtersOptions.adm4.data = data;
					this.filtersOptions.adm4.loading = false;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t(this.admNames.adm4)} ${e}`, "is-danger");
				});
		},

		async setDefaultLocationsFilter() {
			if (this.defaultFilters.adm1?.length) {
				this.selectedFiltersOptions.adm1 = this.filtersOptions
					.adm1.data
					.find((item) => item.locationId === this.defaultFilters.adm1[0]);
				this.filterAdmChildren("adm1");
			}

			if (this.defaultFilters.adm2?.length) {
				this.selectedFiltersOptions.adm2 = this.filtersOptions
					.adm2.data
					.find((item) => item.locationId === this.defaultFilters.adm2[0]);
				this.setAdmParents("adm2");
				this.filterAdmChildren("adm2");
			}

			if (this.defaultFilters.adm3?.length) {
				this.selectedFiltersOptions.adm3 = this.filtersOptions
					.adm3.data
					.find((item) => item.locationId === this.defaultFilters.adm3[0]);
				this.setAdmParents("adm3");
				this.filterAdmChildren("adm3");
			}

			if (this.defaultFilters.adm4?.length) {
				this.selectedFiltersOptions.adm4 = this.filtersOptions
					.adm4.data
					.find((item) => item.locationId === this.defaultFilters.adm4[0]);

				this.setAdmParents("adm4");
			}
		},

		setAdmParents(filterName) {
			if (filterName && filterName.includes("adm")) {
				const admNum = parseInt(filterName.slice(-1), 10);
				for (let i = admNum; i >= 2; i -= 1) {
					if (this.selectedFiltersOptions[`adm${i}`]) {
						this.selectedFiltersOptions[`adm${i - 1}`] = this.filtersOptions[`adm${i - 1}`].data.find((adm) => (
							adm.id === this.selectedFiltersOptions[`adm${i}`].parentId
						));
					}
				}
			}
		},

		filterAdmChildren(filterName) {
			if (filterName && filterName.includes("adm")) {
				const admNum = parseInt(filterName.slice(-1), 10);
				if (!this.selectedFiltersOptions[filterName]) {
					for (let i = admNum; i <= 4; i += 1) {
						if (this.filtersOptions[`adm${i}`] && this.filtersOptionsCopy[`adm${i}`]) {
							this.filtersOptions[`adm${i}`].data = copyObject(this.filtersOptionsCopy[`adm${i}`].data);
						}
					}
					return;
				}

				// Filter children options according to parent(s)
				for (let i = admNum; i <= 3; i += 1) {
					const selectedAdm = this.selectedFiltersOptions[`adm${i}`];
					const admFilterSelected = (!Array.isArray(selectedAdm) && selectedAdm !== null)
						|| (Array.isArray(selectedAdm) && selectedAdm.length);

					if (admFilterSelected) {
						// Copy array so it is not affected by .filter function
						const filtersCopy = this.filtersOptionsCopy[`adm${i + 1}`].data.slice(0);
						this.filtersOptions[`adm${i + 1}`].data = filtersCopy.filter((adm) => (
							adm.parentId === selectedAdm.id
						));

						for (let j = i + 1; j <= 3; j += 1) {
							const filtersCopy2 = this.filtersOptionsCopy[`adm${j + 1}`].data.slice(0);
							this.filtersOptions[`adm${j + 1}`].data = filtersCopy2.filter((adm) => {
								if (this.filtersOptions[`adm${j}`].data[0]) {
									const parentIdsList = this.filtersOptions[`adm${j}`].data.map((item) => item.id);
									return parentIdsList?.includes(adm.parentId);
								}
								return null;
							});
						}
					}
				}
			}
		},

		getLocation(filters) {
			let location = null;

			if (this.selectedFiltersOptions.adm4?.id) {
				const [a] = filters.adm4;
				location = a;
			} else if (this.selectedFiltersOptions.adm3?.id) {
				const [a] = filters.adm3;
				location = a;
			} else if (this.selectedFiltersOptions.adm2?.id) {
				const [a] = filters.adm2;
				location = a;
			} else if (this.selectedFiltersOptions.adm1?.id) {
				const [a] = filters.adm1;
				location = a;
			}
			return location;
		},

		clearedLocationFilters(filters, filterName) {
			if (!filterName) return filters;

			const filtersCopy = copyObject(filters);
			const startIndex = Number(filterName?.slice(3));

			if (Number(startIndex)) {
				for (let i = startIndex; i <= 4; i += 1) {
					if (filterName.startsWith("adm") && filterName.length === 4 && filterName !== `adm${i}`) {
						this.selectedFiltersOptions[`adm${i}`] = [];
						filtersCopy[`adm${i}`] = [];
					}
				}
			}

			return filtersCopy;
		},
	},
};
