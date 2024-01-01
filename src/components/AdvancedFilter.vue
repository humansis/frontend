<template>
	<v-row class="mt-2">
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
				:label="options.name"
				:loading="options.loading"
				:multiple="options.multiple"
				:items="options.data"
				:item-title="options.label || 'value'"
				:item-value="options.trackBy || 'code'"
				:placeholder="options.placeholder"
				name="filter-select"
				:chips="options.multiple"
				:closable-chips="options.multiple"
				is-search-enabled
				clearable
				persistent-placeholder
				@update:modelValue="onFilterChanged(filter)"
			>
				<template v-slot:custom-item="{ props, item }">
					<v-list-item v-bind="props" :subtitle="item.raw.parentLocationName" />
				</template>
			</DataSelect>

			<DataInput
				v-else-if="options.type === 'text'"
				v-model="selectedFiltersOptions[filter]"
				:label="options.name"
				:placeholder="options.placeholder"
				name="filter-input"
				clearable
				persistent-placeholder
				@update:modelValue="onFilterChanged(filter)"
			/>

			<DatePicker
				v-else-if="options.type === 'date'"
				v-model="selectedFiltersOptions[filter]"
				:label="options.name"
				:placeholder="options.placeholder"
				name="filter-datepicker"
				clearable
				persistent-placeholder
				@update:modelValue="onFilterChanged(filter)"
			/>

			<!-- TODO dateTimePicker -->
		</v-col>

		<v-col cols="12" class="text-right">
			<v-btn
				color="primary"
				prepend-icon="search"
				class="text-none ml-3"
				@click="$emit('search')"
			>
				{{ $t('Search') }}
			</v-btn>
		</v-col>
	</v-row>
</template>

<script>
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DatePicker from "@/components/Inputs/DatePicker";

export default {
	name: "AdvancedFilter",

	components: {
		DataSelect,
		DataInput,
		DatePicker,
	},

	props: {
		selectedFiltersOptions: Object,
		filtersOptions: Object,
	},

	emits: [
		"search",
		"filtersChanged",
	],

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
		},
	},
};
</script>
