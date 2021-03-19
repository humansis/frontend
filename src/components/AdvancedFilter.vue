<template>
	<div class="px-5 pb-5 has-border-bottom">
		<div class="columns is-multiline">
			<div v-for="(options, filter) in filtersOptions" :key="filter" :class="filterClass">
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
						selectLabel="Select"
						deselectLabel="Remove"
						:closeOnSelect="!options.multiple"
						@input="filterChanged(filter)"
					/>
				</b-field>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "AdvancedFilter",

	props: {
		selectedFiltersOptions: Object,
		filtersOptions: Object,
		multiline: Boolean,
	},

	computed: {
		filterClass() {
			return `column ${this.multiline ? "is-half" : ""}`;
		},
	},

	methods: {
		filterChanged(filterName) {
			const filters = {};
			Object.keys(this.selectedFiltersOptions).forEach((key) => {
				const filterKey = this.filtersOptions[key]?.filterKey || key;
				if (Array.isArray(this.selectedFiltersOptions[key])) {
					filters[filterKey] = [];
					this.selectedFiltersOptions[key].forEach((value) => {
						const select = this.filtersOptions[key]?.selectValue || this.filtersOptions[key].trackBy || "code";
						filters[filterKey].push(value[select]);
					});
				} else if (this.selectedFiltersOptions[key]) {
					const select = this.filtersOptions[key]?.selectValue || this.filtersOptions[key].trackBy || "code";
					filters[filterKey] = [this.selectedFiltersOptions[key][select]];
				}
			});
			this.$emit("filtersChanged", filters, filterName);
		},
	},
};
</script>
