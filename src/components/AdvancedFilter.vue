<template>
	<div class="mb-5 box">
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
export default {
	name: "CommunitiesFilter",

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
			this.$emit("filtersChanged", filters, filterName);
		},
	},
};
</script>
