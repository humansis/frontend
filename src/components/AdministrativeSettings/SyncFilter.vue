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
				timeFrom: null,
				timeTo: null,
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
				timeFrom: {
					name: "Time From",
					placeholder: this.$t("Select Time"),
					type: "time",
				},
				timeTo: {
					name: "Time To",
					placeholder: this.$t("Select Time"),
					type: "time",
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
