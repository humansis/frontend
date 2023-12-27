<template>
	<v-row>
		<v-col
			v-for="(options, filter) in filtersOptions"
			:key="filter"
			cols="12"
			sm="6"
			md="4"
			lg="2"
		>
			<DataSelect
				v-if="!options.type || options.type === 'multiselect'"
				v-model="selectedFiltersOptions[filter]"
				:label="$t(options.name)"
				:loading="options.loading"
				:items="options.data"
				:item-title="options.label || 'value'"
				:item-value="options.trackBy || 'code'"
				name="filter-select"
				is-search-enabled
				multiple
				clearable
				@update:modelValue="onFilterChanged(filter)"
			/>

			<DataInput
				v-else-if="options.type === 'text'"
				v-model="selectedFiltersOptions[filter]"
				:label="$t(options.name)"
				name="filter-input"
				clearable
				@update:modelValue="onFilterChanged(filter)"
			/>

			<DatePicker
				v-else-if="options.type === 'date'"
				v-model="selectedFiltersOptions[filter]"
				:label="$t(options.name)"
				name="filter-datepicker"
				clearable
				@update:modelValue="onFilterChanged(filter)"
			/>

			<!-- TODO dateTimePicker -->
		</v-col>
	</v-row>
</template>

<script>
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DatePicker from "@/components/Inputs/DatePicker";

export default {
	name: "AdvancedFilter",

	emits: ["filtersChanged"],

	components: {
		DataSelect,
		DataInput,
		DatePicker,
	},

	props: {
		selectedFiltersOptions: Object,
		filtersOptions: Object,
		multiline: Boolean,
	},

	data() {
		return {
			timer: null,
		};
	},

	methods: {
		onFilterChanged(filterName) {
			const filters = {};

			Object.keys(this.selectedFiltersOptions).forEach((key) => {
				const filterKey = this.filtersOptions[key]?.filterKey || key;

				if (Array.isArray(this.selectedFiltersOptions[key])) {
					filters[filterKey] = [];
					this.selectedFiltersOptions[key].forEach((value) => {
						const select = this.filtersOptions[key]?.trackBy || "code";

						if (filters[filterKey] && value && value[select]) {
							filters[filterKey].push(value[select]);
						}
					});
				} else if (this.selectedFiltersOptions[key]) {
					if (this.filtersOptions[key]?.type === "date" || this.filtersOptions[key]?.type === "datetime") {
						filters[filterKey] = new Date(this.selectedFiltersOptions[key]).toISOString();
					} else if (this.filtersOptions[key]?.type === "text") {
						filters[filterKey] = this.selectedFiltersOptions[key];
					} else {
						const select = this.filtersOptions[key]?.trackBy || "code";
						filters[filterKey] = [this.selectedFiltersOptions[key][select]];
					}
				}
			});

			this.$emit("filtersChanged", filters, filterName);
			this.$forceUpdate();
		},

		removeFilterValue(filter) {
			this.selectedFiltersOptions[filter] = null;
			this.filterChanged(filter);
		},
	},
};
</script>
