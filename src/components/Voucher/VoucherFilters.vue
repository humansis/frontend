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
import { getArrayOfCodeListByParams } from "@/utils/codeList";

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
						{ code: 0, value: "Unassigned" },
						{ code: 1, value: "Distributed" },
						{ code: 2, value: "Used" },
						{ code: 3, value: "Deactivated" },
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
					filterKey: "distributions",
				},
				beneficiaries: {
					name: "Beneficiary",
					placeholder: "Select Beneficiary",
					trackBy: "id",
					label: "localFamilyName",
					multiple: true,
					loading: false,
					data: [],
				},
			},
		};
	},

	mounted() {
		this.fetchAssistances();
		this.fetchCurrencies();
	},

	methods: {
		filterChanged(filters, filtername) {
			if (filtername === "assistances") {
				this.fetchBeneficiaries(filters.distributions);
			}
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

		async fetchBeneficiaries(ids) {
			if (ids?.length) {
				this.filtersOptions.beneficiaries.loading = true;
				this.filtersOptions.beneficiaries.data = [];
				const promise = ids.map(async (id) => {
					await AssistancesService.getListOfBeneficiaries(id)
						.then(({ data }) => {
							data.forEach((item) => {
								if (!this.filtersOptions.beneficiaries.data.some((el) => el.id === item.id)) {
									this.filtersOptions.beneficiaries.data.push(item);
								}
							});
						})
						.catch((e) => {
							Notification(`Beneficiaries ${e}`, "is-danger");
						});
				});
				await Promise.all(promise);
				this.selectedFiltersOptions
					.beneficiaries = getArrayOfCodeListByParams(this.selectedFiltersOptions.beneficiaries, this.filtersOptions.beneficiaries.data, "id", "id");
				this.filtersOptions.beneficiaries.loading = false;
			} else {
				this.selectedFiltersOptions.beneficiaries = [];
			}
		},
	},
};
</script>
