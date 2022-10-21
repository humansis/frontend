import { copyObject } from "@/utils/helpers";
import consts from "@/utils/filterConst";

export default {
	methods: {
		resetFilters() {
			Object.keys(this.filtersOptions).forEach((key) => {
				const filterKey = this.filtersOptions[key]?.filterKey || key;
				this.selectedFiltersOptions[filterKey] = consts.DEFAULT_FILTERS[filterKey];
			});

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
				this.$refs.advancedFilter.filterChanged();
			});
		},
	},
};
