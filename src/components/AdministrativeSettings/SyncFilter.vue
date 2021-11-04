<template>
	<AdvancedFilter
		ref="advancedFilter"
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
	/>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";

export default {
	name: "SyncFilter",

	components: {
		AdvancedFilter,
	},

	data() {
		return {
			selectedFiltersOptions: {
				dateFrom: null,
				dateTo: null,
			},
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
			this.$emit("filtersChanged", filters);
		},

		eraseFilters() {
			this.selectedFiltersOptions = {
				dateFrom: null,
				dateTo: null,
			};
			this.$nextTick(() => {
				this.$refs.advancedFilter.filterChanged();
			});
		},
	},
};
</script>
