<template>
	<AdvancedFilter
		ref="advancedFilter"
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		:validation-rules="validationRules"
		multiline
		@filtersChanged="onFilterChanged"
		@search="$emit('search')"
	/>
</template>

<script>
import { helpers } from "@vuelidate/validators";
import AdvancedFilter from "@/components/AdvancedFilter";
import filtersHelper from "@/mixins/filtersHelper";
import { isDateBeforeOrEqual } from "@/utils/helpers";
import { FILTER } from "@/consts";

export default {
	name: "AssistancesFilter",

	emits: [
		"search",
		"filtersChanged",
	],

	components: { AdvancedFilter },

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
			selectedFiltersOptions: { ...this.defaultFilters },
			filtersOptionsCopy: {},
			filtersOptions: {
				dateFrom: {
					name: "Date From",
					placeholder: this.$t("Select Date"),
					type: "date",
				},
				dateTo: {
					name: "Date To",
					placeholder: this.$t("Select Date"),
					type: "date",
				},
			},
		};
	},

	computed: {
		validationRules() {
			return {
				selectedFiltersOptions: {
					dateTo: {
						...(this.selectedFiltersOptions.dateTo
							&& this.selectedFiltersOptions.dateFrom
							&& { isDateBeforeOrEqual: helpers.withMessage(
								"Date To is before Date From",
								(value) => isDateBeforeOrEqual(this.selectedFiltersOptions.dateFrom, value),
							) }),
					},
				},
			};
		},
	},

	methods: {
		onFilterChanged(filters) {
			this.$emit("filtersChanged", {
				filters: {
					dateFrom: filters.dateFrom
						? this.$moment(filters.dateFrom).format("YYYY-MM-DD")
						: FILTER.DEFAULT_FILTERS.DATE_FROM,
					dateTo: filters.dateTo
						? this.$moment(filters.dateTo).format("YYYY-MM-DD")
						: FILTER.DEFAULT_FILTERS.DATE_TO,
				},
			});
		},
	},
};
</script>
