<template>
	<AdvancedFilter
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
	/>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";

export default {
	name: "SyncFilter",

	components: {
		AdvancedFilter,
	},

	data() {
		return {
			selectedFiltersOptions: {
				assistances: [],
				dateFrom: null,
				dateTo: null,
			},
			filtersOptions: {
				assistances: {
					name: "Assistance",
					placeholder: this.$t("Select Assistance"),
					trackBy: "id",
					label: "name",
					multiple: true,
					loading: true,
					data: [],
					filterKey: "distributions",
				},
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

	mounted() {
		this.fetchAssistances();
	},

	methods: {
		filterChanged(filters) {
			this.$emit("filtersChanged", filters);
		},

		async fetchAssistances() {
			await AssistancesService.getListOfAssistances()
				.then(({ data }) => {
					this.filtersOptions.assistances.data = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Assistances")} ${e}`, "is-danger");
				});

			this.filtersOptions.assistances.loading = false;
		},
	},
};
</script>
