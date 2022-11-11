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
				this.filters = filters ? JSON.parse(filters) : {};

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

		async onFiltersChange({ filters, locationsFilter }) {
			this.locationsFilter = locationsFilter;

			Object.keys(filters).forEach((key) => {
				if (Array.isArray(filters[key])) {
					this.filters[key] = [];
					filters[key].forEach((value) => {
						this.filters[key].push(value);
					});
				} else {
					this.filters[key] = filters[key];
				}
			});

			this.table.currentPage = 1;
			await this.fetchData();
		},
	},
};
