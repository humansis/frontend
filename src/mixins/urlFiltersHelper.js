export default {
	methods: {
		setGridFilters() {
			const { query } = this.$route;

			if (query.filters && Object.keys(query.filters).length !== 0) {
				this.advancedSearchVisible = true;
			}

			if (!query.page) {
				this.setGridFiltersToUrl();
			} else {
				const { query: {
					page,
					search,
					sortColumn,
					sortDirection,
					filters,
					locationsFilter,
				} } = this.$route;

				this.table.currentPage = Number(page);
				this.table.searchPhrase = search;
				this.table.sortColumn = sortColumn;
				this.table.sortDirection = sortDirection;
				this.filters = JSON.parse(filters);
				this.locationsFilter = JSON.parse(locationsFilter);
			}
		},

		setGridFiltersToUrl() {
			const { name, query } = this.$route;

			this.$router.replace({
				name,
				query: {
					...query,
					page: this.table.currentPage,
					search: this.table.searchPhrase,
					sortColumn: this.table.sortColumn,
					sortDirection: this.table.sortDirection,
					filters: JSON.stringify(this.filters),
					locationsFilter: JSON.stringify(this.locationsFilter),
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
