<template>
	<AdvancedFilter
		ref="advancedFilter"
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="onFilterChanged"
		@search="$emit('search')"
	/>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";
import filtersHelper from "@/mixins/filtersHelper";
import { copyObject } from "@/utils/helpers";
import { FILTER } from "@/consts";

export default {
	name: "SyncFilter",

	emits: [
		"search",
		"filtersChanged",
	],

	components: {
		AdvancedFilter,
	},

	mixins: [filtersHelper],

	props: {
		defaultFilters: {
			type: Object,
			default: () => ({
				dateFrom: FILTER.DEFAULT_FILTERS.DATE_FROM,
				dateTo: FILTER.DEFAULT_FILTERS.DATE_TO,
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
		onFilterChanged(filters) {
			this.$emit("filtersChanged", { filters });
		},
	},
};
</script>
