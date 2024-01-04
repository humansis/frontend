import { normalizeFiltersOptions } from "@/utils/datagrid";
import { copyObject } from "@/utils/helpers";
import { FILTER } from "@/consts";

export default {
	methods: {
		resetFilters() {
			const filters = {};
			Object.keys(this.filtersOptions).forEach((key) => {
				const filterKey = this.filtersOptions[key]?.filterKey || key;
				filters[filterKey] = FILTER.DEFAULT_FILTERS[normalizeFiltersOptions(filterKey)]
						=== null ? null : [];
			});

			this.selectedFiltersOptions = filters;

			if (this.filtersOptions.adm1) {
				this.filtersOptions.adm1 = copyObject(this.filtersOptionsCopy.adm1);
			}

			if (this.filtersOptions.adm2) {
				this.filtersOptions.adm2 = copyObject(this.filtersOptionsCopy.adm2);
			}

			if (this.filtersOptions.adm3) {
				this.filtersOptions.adm3 = copyObject(this.filtersOptionsCopy.adm3);
			}

			if (this.filtersOptions.adm4) {
				this.filtersOptions.adm4 = copyObject(this.filtersOptionsCopy.adm4);
			}

			this.$nextTick(() => {
				this.$refs.advancedFilter.onFilterChanged();
			});
		},
	},
};
