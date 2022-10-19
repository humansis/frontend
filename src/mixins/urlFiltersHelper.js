import { mapActions, mapState } from "vuex";

export default {
	computed: {
		...mapState(["country", "gridFilters"]),
	},

	methods: {
		...mapActions(["storeGridFilters"]),

		setGridFilters(entity, hasLocationsFilter = true) {
			const storedFilter = this.gridFilters[entity]
				?.find(({ country }) => country === this.country.iso3);

			const { query } = storedFilter || this.$route;

			const {
				page,
				search,
				sortColumn,
				sortDirection,
				filters,
				locationsFilter,
			} = query;

			if (query.filters && Object.keys(query.filters).length !== 0) {
				this.advancedSearchVisible = true;
			}

			if (!query.page) {
				this.setGridFiltersToUrl(entity, hasLocationsFilter);
			} else {
				this.table.currentPage = Number(page);
				this.table.searchPhrase = search;
				this.table.sortColumn = sortColumn;
				this.table.sortDirection = sortDirection;
				this.filters = JSON.parse(filters);

				if (hasLocationsFilter) {
					this.locationsFilter = JSON.parse(locationsFilter);
				}
			}
		},

		setGridFiltersToUrl(entity, hasLocationsFilter = true) {
			const { name, query } = this.$route;

			const updatedGridFilters = { ...this.gridFilters };
			const filterEntityIndex = this.gridFilters?.[entity]
				?.findIndex(({ country }) => country === this.country.iso3);

			if (filterEntityIndex !== -1 && filterEntityIndex !== undefined) {
				updatedGridFilters[entity][filterEntityIndex].query = { ...query };
			} else if (updatedGridFilters[entity]?.length) {
				updatedGridFilters[entity].push({
					country: this.country.iso3,
					query,
				});
			} else {
				updatedGridFilters[entity] = [{
					country: this.country.iso3,
					query,
				}];
			}

			this.storeGridFilters({
				...updatedGridFilters,
			});

			this.$router.replace({
				name,
				query: {
					...query,
					page: this.table.currentPage,
					search: this.table.searchPhrase,
					sortColumn: this.table.sortColumn,
					sortDirection: this.table.sortDirection,
					filters: JSON.stringify(this.filters),
					...(hasLocationsFilter && { locationsFilter: JSON.stringify(this.locationsFilter) }),
				},
			});
		},

		async setDefaultLocationsFilter() {
			if (this.defaultFilters.adm1?.length) {
				this.selectedFiltersOptions.adm1 = this.filtersOptions
					.adm1.data
					.find((item) => item.locationId === this.defaultFilters.adm1[0]);
			}

			if (this.defaultFilters.adm2?.length) {
				this.selectedFiltersOptions.adm2 = this.filtersOptions
					.adm2.data
					.find((item) => item.locationId === this.defaultFilters.adm2[0]);
				this.setAdmParents("adm2");
			}

			if (this.defaultFilters.adm3?.length) {
				this.selectedFiltersOptions.adm3 = this.filtersOptions
					.adm3.data
					.find((item) => item.locationId === this.defaultFilters.adm3[0]);
				this.setAdmParents("adm3");
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

		getLocation(filters) {
			let location = null;

			if (this.selectedFiltersOptions.adm4) {
				const [a] = filters.adm4;
				location = a;
			} else if (this.selectedFiltersOptions.adm3) {
				const [a] = filters.adm3;
				location = a;
			} else if (this.selectedFiltersOptions.adm2) {
				const [a] = filters.adm2;
				location = a;
			} else if (this.selectedFiltersOptions.adm1) {
				const [a] = filters.adm1;
				location = a;
			}

			return location;
		},

		clearedLocationFilters(filters, filterName) {
			const filtersCopy = { ...filters };

			switch (filterName) {
				case "adm1":
					this.selectedFiltersOptions.adm2 = null;
					this.selectedFiltersOptions.adm3 = null;
					this.selectedFiltersOptions.adm4 = null;
					filtersCopy.adm2 = [];
					filtersCopy.adm3 = [];
					filtersCopy.adm4 = [];
					break;
				case "adm2":
					this.selectedFiltersOptions.adm1 = null;
					this.selectedFiltersOptions.adm3 = null;
					this.selectedFiltersOptions.adm4 = null;
					filtersCopy.adm1 = [];
					filtersCopy.adm3 = [];
					filtersCopy.adm4 = [];
					break;
				case "adm3":
					this.selectedFiltersOptions.adm1 = null;
					this.selectedFiltersOptions.adm2 = null;
					this.selectedFiltersOptions.adm4 = null;
					filtersCopy.adm1 = [];
					filtersCopy.adm2 = [];
					filtersCopy.adm4 = [];
					break;
				case "adm4":
					this.selectedFiltersOptions.adm1 = null;
					this.selectedFiltersOptions.adm2 = null;
					this.selectedFiltersOptions.adm3 = null;
					filtersCopy.adm1 = [];
					filtersCopy.adm2 = [];
					filtersCopy.adm3 = [];
					break;
				default: break;
			}

			return filtersCopy;
		},
	},
};
