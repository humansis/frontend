<template>
	<div class="mb-5 box">
		<div class="columns is-multiline">
			<div v-for="(options, filter) in filtersOptions" :key="filter" class="column">
				<b-field :label="options.name">
					<MultiSelect
						v-model="selectedFiltersOptions[filter]"
						searchable
						:label="options.label || 'value'"
						:track-by="options.trackBy || 'code'"
						:multiple="options.multiple"
						:placeholder="options.placeholder || 'Click to select...'"
						:loading="options.loading"
						:options="options.data"
						@input="filterChanged(filter)"
					>
						<template
							slot="singleLabel"
							slot-scope="options"
						>
							{{ options.option.name }}
						</template>
					</MultiSelect>
				</b-field>
			</div>
		</div>
	</div>
</template>

<script>
import CurrencyService from "@/services/CurrencyService";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";

export default {
	name: "VoucherFilters",

	data() {
		return {
			selectedFiltersOptions: {
				currencies: [],
				statuses: [],
				assistances: [],
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
						{ code: 4, value: "Deactivated" },
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
			},
		};
	},

	mounted() {
		this.fetchAssistances();
		this.fetchCurrencies();
	},

	methods: {
		filterChanged() {
			const filters = {};
			Object.keys(this.selectedFiltersOptions).forEach((key) => {
				if (Array.isArray(this.selectedFiltersOptions[key])) {
					filters[key] = [];
					this.selectedFiltersOptions[key].forEach((value) => {
						const select = this.filtersOptions[key].trackBy || "code";
						filters[key].push(value[select]);
					});
				} else if (this.selectedFiltersOptions[key]) {
					filters[key] = [this.selectedFiltersOptions[key].id];
				}
			});
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
	},
};
</script>
