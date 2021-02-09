<template>
	<AdvancedFilter
		:selected-filters-options="selectedFiltersOptions"
		:filters-options="filtersOptions"
		@filtersChanged="filterChanged"
	/>
</template>

<script>
import AdvancedFilter from "@/components/AdvancedFilter";
import CurrencyService from "@/services/CurrencyService";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import BeneficiariesService from "@/services/BeneficiariesService";

export default {
	name: "VoucherFilters",

	components: {
		AdvancedFilter,
	},

	data() {
		return {
			selectedFiltersOptions: {
				currencies: [],
				statuses: [],
				assistances: [],
				beneficiaries: [],
			},
			filtersOptions: {
				currencies: {
					name: "Currency",
					placeholder: "Select Currency",
					label: "code",
					multiple: true,
					loading: true,
					data: [],
				},
				statuses: {
					name: "Status",
					placeholder: "Select Status",
					multiple: true,
					data: [
						{ code: "unassigned", value: "Unassigned" },
						{ code: "distributed", value: "Distributed" },
						{ code: "used", value: "Used" },
						{ code: "deactivated", value: "Deactivated" },
					],
				},
				assistances: {
					name: "Assistance",
					placeholder: "Select Assistance",
					trackBy: "id",
					label: "name",
					multiple: true,
					loading: true,
					data: [],
				},
				beneficiaries: {
					name: "Beneficiary",
					placeholder: "Select Beneficiary",
					trackBy: "id",
					label: "name",
					multiple: true,
					loading: true,
					data: [],
				},
			},
		};
	},

	mounted() {
		this.fetchAssistances();
		this.fetchBeneficiaries();
		this.fetchCurrencies();
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
					Notification(`Assistances ${e}`, "is-danger");
				});

			this.filtersOptions.assistances.loading = false;
		},

		async fetchCurrencies() {
			await CurrencyService.getListOfCurrencies()
				.then(({ data }) => {
					this.filtersOptions.currencies.data = data;
				})
				.catch((e) => {
					Notification(`Currencies ${e}`, "is-danger");
				});

			this.filtersOptions.currencies.loading = false;
		},

		async fetchBeneficiaries() {
			await BeneficiariesService.getBeneficiaries()
				.then(({ data }) => {
					this.filtersOptions.beneficiaries.data = data;
				})
				.catch((e) => {
					Notification(`Beneficiaries ${e}`, "is-danger");
				});

			this.filtersOptions.beneficiaries.loading = false;
		},
	},
};
</script>
