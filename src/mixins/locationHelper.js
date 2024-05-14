import { mapState } from "vuex";
import LocationsService from "@/services/LocationsService";
import { checkResponseStatus } from "@/utils/fetcher";
import { copyObject } from "@/utils/helpers";
import { Notification } from "@/utils/UI";

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
			try {
				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getListOfAdm1();

				checkResponseStatus(status, message);

				this.filtersOptions.adm1.data = data;
			} catch (e) {
				Notification(`${this.$t(this.admNames.adm1)}: ${e.message || e}`, "error");
			} finally {
				this.filtersOptions.adm1.loading = false;
			}
		},

		fillParentProvinces() {
			const adm1Map = new Map(this.filtersOptions.adm1.data.map((adm) => [adm.id, adm]));

			this.filtersOptions.adm2.data.forEach((item, index) => {
				if (item.hasDuplicity) {
					const parentLocation = adm1Map.get(item.parentId);

					if (parentLocation) {
						this.filtersOptions.adm2.data[index].parentLocationName = parentLocation.name;
					}
				}
			});
		},

		async fetchDistricts() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getListOfAdm2();

				checkResponseStatus(status, message);

				this.filtersOptions.adm2.data = data;
			} catch (e) {
				Notification(`${this.$t(this.admNames.adm2)}: ${e.message || e}`, "error");
			} finally {
				this.filtersOptions.adm2.loading = false;
			}
		},

		fillParentDistricts() {
			const adm2Map = new Map(this.filtersOptions.adm2.data.map((adm) => [adm.id, adm]));

			this.filtersOptions.adm3.data.forEach((item, index) => {
				if (item.hasDuplicity) {
					const parentLocation = adm2Map.get(item.parentId);

					if (parentLocation) {
						this.filtersOptions.adm3.data[index].parentLocationName = parentLocation.name;
					}
				}
			});
		},

		async fetchCommunes() {
			try {
				this.filtersOptions.adm3.loading = true;

				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getListOfAdm3();

				checkResponseStatus(status, message);

				this.filtersOptions.adm3.data = data;
			} catch (e) {
				Notification(`${this.$t(this.admNames.adm3)}: ${e.message || e}`, "error");
			} finally {
				this.filtersOptions.adm3.loading = false;
			}
		},

		fillParentCommunes() {
			const adm3Map = new Map(this.filtersOptions.adm3.data.map((adm) => [adm.id, adm]));

			this.filtersOptions.adm4.data.forEach((item, index) => {
				if (item.hasDuplicity) {
					const parentLocation = adm3Map.get(item.parentId);

					if (parentLocation) {
						this.filtersOptions.adm4.data[index].parentLocationName = parentLocation.name;
					}
				}
			});
		},

		async fetchVillages() {
			try {
				this.filtersOptions.adm4.loading = true;

				const {
					data: { data },
					status,
					message,
				} = await LocationsService.getListOfAdm3();

				checkResponseStatus(status, message);

				this.filtersOptions.adm4.data = data;
			} catch (e) {
				Notification(`${this.$t(this.admNames.adm4)}: ${e.message || e}`, "error");
			} finally {
				this.filtersOptions.adm4.loading = false;
			}
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

			if (startIndex) {
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
