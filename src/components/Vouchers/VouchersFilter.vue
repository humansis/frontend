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
import AssistancesService from "@/services/AssistancesService";
import AdvancedFilter from "@/components/AdvancedFilter";
import filtersHelper from "@/mixins/filtersHelper";
import urlFiltersHelper from "@/mixins/urlFiltersHelper";
import { getArrayOfCodeListByParams } from "@/utils/codeList";
import { copyObject } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { CURRENCIES, FILTER } from "@/consts";

export default {
	name: "VouchersFilter",

	emits: [
		"onSearch",
		"filtersChanged",
	],

	components: {
		AdvancedFilter,
	},

	mixins: [filtersHelper, urlFiltersHelper],

	props: {
		defaultFilters: {
			type: Object,
			default: () => ({
				currencies: FILTER.DEFAULT_FILTERS.CURRENCIES,
				statuses: FILTER.DEFAULT_FILTERS.STATUSES,
				assistances: FILTER.DEFAULT_FILTERS.ASSISTANCES,
				beneficiaries: FILTER.DEFAULT_FILTERS.BENEFICIARIES,
			}),
		},
	},

	data() {
		return {
			selectedFiltersOptions: copyObject(this.defaultFilters),
			filtersOptions: {
				currencies: {
					name: "Currency",
					placeholder: this.$t("Select Currency"),
					label: "value",
					trackBy: "value",
					multiple: true,
					loading: false,
					data: CURRENCIES,
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
					label: "id",
					multiple: true,
					loading: false,
					data: [],
				},
			},
		};
	},

	async created() {
		await this.fetchAssistances();

		await Promise.all([
			this.setDefaultFilters(),
		]);
	},

	mounted() {
		if (this.defaultFilters.distributions?.length) {
			this.fetchBeneficiaries((this.defaultFilters.distributions));
		}
	},

	methods: {
		async filterChanged(filters, filtername) {
			if (filtername === "assistances") {
				this.fetchBeneficiaries(filters.distributions);
			}

			this.$emit("filtersChanged", { filters });
		},

		setDefaultFilters() {
			if (this.defaultFilters.currencies?.length) {
				this.selectedFiltersOptions.currencies = this.filtersOptions
					.currencies.data
					.filter((item) => this.defaultFilters.currencies.includes(item.value));
			}

			if (this.defaultFilters.statuses?.length) {
				this.selectedFiltersOptions.statuses = this.filtersOptions
					.statuses.data
					.filter((item) => this.defaultFilters.statuses.includes(item.code));
			}

			if (this.defaultFilters.distributions?.length) {
				this.selectedFiltersOptions.assistances = this.filtersOptions
					.assistances.data
					.filter((item) => this.defaultFilters.distributions.includes(item.id));
			}

			if (this.defaultFilters.beneficiaries?.length) {
				this.selectedFiltersOptions.beneficiaries = this.filtersOptions
					.beneficiaries.data
					.filter((item) => this.defaultFilters.beneficiaries.includes(item.id));
			}
		},

		async fetchAssistances() {
			await AssistancesService.getListOfAssistances()
				.then(({ data }) => {
					this.filtersOptions.assistances.data = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Assistances")} ${e.message || e}`, "error");
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
							Notification(`${this.$t("Beneficiaries")} ${e.message || e}`, "error");
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
