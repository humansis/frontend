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
import { getArrayOfCodeListByParams } from "@/utils/codeList";
import currencies from "@/utils/currencies";

export default {
	name: "VouchersFilter",

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
					placeholder: this.$t("Select Currency"),
					label: "value",
					trackBy: "value",
					multiple: true,
					loading: false,
					data: currencies,
				},
				statuses: {
					name: "Status",
					placeholder: this.$t("Select Status"),
					multiple: true,
					data: [
						{ code: 0, value: this.$t("Unassigned") },
						{ code: 1, value: this.$t("Distributed") },
						{ code: 2, value: this.$t("Used") },
						{ code: 3, value: this.$t("Deactivated") },
					],
				},
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
				beneficiaries: {
					name: "Beneficiary",
					placeholder: this.$t("Select Beneficiary"),
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
					if (e.message) Notification(`${this.$t("Assistances")} ${e}`, "is-danger");
				});

			this.filtersOptions.assistances.loading = false;
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
							if (e.message) Notification(`${this.$t("Beneficiaries")} ${e}`, "is-danger");
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
