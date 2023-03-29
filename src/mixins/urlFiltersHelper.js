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
				const canCopy = (typeof value === "object"
						&& value && Object.keys(value).length !== 0)
					|| ((typeof value === "number"
							|| typeof value === "string"
							|| typeof value === "boolean")
						&& value);

				if (canCopy) {
					copiedObject[key] = value;
				}
			});

			return copiedObject;
		},

		setGridFilters(entity, hasLocationsFilter = true) {
			const storedFilter = this.gridFilters[entity]?.find(
				({ country }) => country === this.country.iso3,
			);

			let query;

			if (Object.keys(this.$route.query).length) {
				query = this.$route.query;
			} else if (storedFilter) {
				query = storedFilter.query;
			} else {
				query = {};
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

		setGridFiltersToUrl(entity, hasLocationsFilter = true) {
			const { name, query } = this.$route;

			const updatedGridFilters = { ...this.gridFilters };
			const filterEntityIndex = this.gridFilters?.[entity]?.findIndex(
				({ country }) => country === this.country.iso3,
			);

			const checkedFilter = this.removeEmptyValues(this.filters);

			const checkedLocation = hasLocationsFilter
				? this.removeEmptyValues(this.locationsFilter)
				: {};

			const newQuery = {
				...(this.table.currentPage > 1 && { page: this.table.currentPage.toString() }),
				...(this.table.searchPhrase && { search: this.table.searchPhrase }),
				...(this.table.sortColumn && { sortColumn: this.table.sortColumn }),
				...(this.table.sortDirection && { sortDirection: this.table.sortDirection }),
				...(Object.keys(checkedFilter).length && { filters: JSON.stringify(checkedFilter) }),
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

			const nQuery = this.$route.query;

			if (filterEntityIndex !== -1 && filterEntityIndex !== undefined) {
				updatedGridFilters[entity][filterEntityIndex].query = { ...nQuery };
			} else {
				updatedGridFilters[entity].push({
					country: this.country.iso3,
					query: nQuery,
				});
			}

			this.storeGridFilters({
				...updatedGridFilters,
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
		},
	},
};
