import { mapActions, mapState } from "vuex";

export default {
	computed: {
		...mapState(["country", "gridFilters"]),
	},

	methods: {
		...mapActions(["storeGridFilters"]),

		setGridFilters(entity, hasLocationsFilter = true) {
			const storedFilter = this.gridFilters[entity]
				.find(({ country }) => country === this.country.iso3);

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
				.findIndex(({ country }) => country === this.country.iso3);

			if (filterEntityIndex !== -1) {
				updatedGridFilters[entity][filterEntityIndex].query = { ...query };
			} else {
				updatedGridFilters[entity].push({
					country: this.country.iso3,
					query,
				});
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

				await this.fetchDistricts(this.selectedFiltersOptions.adm1.id);
			}

			if (this.defaultFilters.adm2?.length) {
				this.selectedFiltersOptions.adm2 = this.filtersOptions
					.adm2.data
					.find((item) => item.locationId === this.defaultFilters.adm2[0]);

				await this.fetchCommunes(this.selectedFiltersOptions.adm2.id);
			}

			if (this.defaultFilters.adm3?.length) {
				this.selectedFiltersOptions.adm3 = this.filtersOptions
					.adm3.data
					.find((item) => item.locationId === this.defaultFilters.adm3[0]);

				await this.fetchVillages(this.selectedFiltersOptions.adm3.id);
			}

			if (this.defaultFilters.adm4?.length) {
				this.selectedFiltersOptions.adm4 = this.filtersOptions
					.adm4.data
					.find((item) => item.locationId === this.defaultFilters.adm4[0]);
			}
		},
	},
};
