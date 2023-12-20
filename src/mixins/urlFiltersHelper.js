import { mapActions, mapState } from "vuex";
import { deepEqual } from "@/utils/helpers";

export default {
	computed: {
		...mapState(["country", "gridFilters"]),
	},

	methods: {
		...mapActions(["storeGridFilters"]),

		removeEmptyValues(data) {
			const copiedObject = {};

			Object.entries(data).forEach(([key, value]) => {
				if (!value) {
					return;
				}

				if (Object.keys(value).length === 0
					&& typeof value !== "number"
					&& typeof value !== "boolean") {
					return;
				}

				copiedObject[key] = value;
			});

			return copiedObject;
		},

		setGridFilters(entity, hasLocationsFilter = true) {
			const storedFilter = this.gridFilters[entity]?.find(
				({ country }) => country === this.country.iso3,
			);

			let query = {};

			if (Object.keys(this.$route.query).length) {
				query = this.$route.query;
			} else if (storedFilter) {
				query = storedFilter.query;
			}

			const {
				page,
				search,
				sortColumn,
				sortDirection,
				filters,
				locationsFilter,
			} = query;

			if (filters && Object.keys(JSON.parse(filters)).length !== 0) {
				this.advancedSearchVisible = true;
			}

			if (!Object.keys(query).length) {
				this.setGridFiltersToUrl(entity, hasLocationsFilter);
			} else {
				this.table.currentPage = Number(page) || 1;
				this.table.searchPhrase = search || "";
				this.table.sortColumn = sortColumn || "";
				this.table.sortDirection = sortDirection || "desc";
				this.filters = filters ? JSON.parse(filters) : {};

				if (hasLocationsFilter && locationsFilter) {
					this.locationsFilter = locationsFilter ? JSON.parse(locationsFilter) : {};
				}
			}
		},

		setGridFiltersToUrl(entity, hasLocationsFilter = true, selectedTypeOfDataStored = {}) {
			const defaultTypeOfDataStored = {
				page: true,
				searchPhrase: true,
				sortColumn: true,
				sortDirection: true,
				filters: true,
			};

			const typeOfDataStored = Object.keys(selectedTypeOfDataStored).length
				? selectedTypeOfDataStored
				: defaultTypeOfDataStored;

			const { name, query } = this.$route;

			const updatedGridFilters = { ...this.gridFilters };
			const filterEntityIndex = this.gridFilters?.[entity]?.findIndex(
				({ country }) => country === this.country.iso3,
			);

			const checkedFilter = this.removeEmptyValues(this.filters);

			const checkedLocation = hasLocationsFilter
				? this.removeEmptyValues(this.locationsFilter)
				: {};

			const { page, searchPhrase, sortColumn, sortDirection, filters } = typeOfDataStored;

			const newQuery = {
				...(this.table.currentPage > 1 && page && { page: this.table.currentPage.toString() }),
				...(this.table.searchPhrase && searchPhrase && { search: this.table.searchPhrase }),
				...(this.table.sortColumn
					&& sortColumn
					&& { sortColumn: this.table.sortColumn.sortKey || this.table.sortColumn }),
				...(this.table.sortDirection
					&& sortDirection
					&& { sortDirection: this.table.sortDirection }
				),
				...(Object.keys(checkedFilter).length
					&& filters
					&& { filters: JSON.stringify(checkedFilter) }),
				...(hasLocationsFilter && Object.keys(checkedLocation).length && {
					locationsFilter: JSON.stringify(checkedLocation),
				}),
			};

			if (!deepEqual(query, newQuery)) {
				this.$router.replace({
					name,
					query: newQuery,
				}).catch((error) => {
					console.error(error);
				});
			}

			this.$router.replace({
				name,
				query: newQuery,
			}).then(() => {
				const routeQuery = this.$route.query;

				if (filterEntityIndex !== -1 && filterEntityIndex !== undefined) {
					updatedGridFilters[entity][filterEntityIndex].query = { ...routeQuery };
				} else {
					updatedGridFilters[entity].push({
						country: this.country.iso3,
						query: routeQuery,
					});
				}

				this.storeGridFilters({
					...updatedGridFilters,
				});
			}).catch((error) => {
				console.error(error);
			});
		},

		async onFiltersChange({ filters, locationsFilter }) {
			this.locationsFilter = locationsFilter;
			this.table.dataUpdated = false;

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
		},
	},
};
