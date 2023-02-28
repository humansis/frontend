<template>
	<AdvancedFilter
		ref="advancedFilter"
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
		@onSearch="$emit('onSearch')"
	/>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";
import filtersHelper from "@/mixins/filtersHelper";
import { copyObject } from "@/utils/helpers";
import consts from "@/utils/filterConst";

export default {
	name: "SyncFilter",

	components: {
		AdvancedFilter,
	},

	mixins: [filtersHelper],

	props: {
		defaultFilters: {
			type: Object,
			default: () => ({
				dateFrom: consts.DEFAULT_FILTERS.DATE_FROM,
				dateTo: consts.DEFAULT_FILTERS.DATE_TO,
			}),
		},
	},

	data() {
		return {
			selectedFiltersOptions: copyObject(this.defaultFilters),
			filtersOptions: {
				dateFrom: {
					name: "Date From",
					placeholder: this.$t("Select Date From"),
					type: "datetime",
				},
				dateTo: {
					name: "Date To",
					placeholder: this.$t("Select Date To"),
					type: "datetime",
				},
			},
		};
	},

	methods: {
		filterChanged(filters) {
			this.$emit("filtersChanged", { filters });
		},
	},
};
</script>
