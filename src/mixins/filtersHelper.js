import { copyObject } from "@/utils/helpers";

export default {
	methods: {
		resetFilters() {
			this.selectedFiltersOptions = copyObject(this.defaultFilters);

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
