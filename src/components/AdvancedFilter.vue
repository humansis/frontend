<template>
	<div class="px-5 pb-5 has-border-bottom">
		<div class="columns is-multiline">
			<div v-for="(options, filter) in filtersOptions" :key="filter" :class="filterClass">
				<b-field v-if="options.type === 'empty'" />
				<b-field v-else :label="options.name">
					<MultiSelect
						v-if="!options.type || options.type === 'multiselect'"
						v-model="selectedFiltersOptions[filter]"
						searchable
						:label="options.label || 'value'"
						:track-by="options.trackBy || 'code'"
						:multiple="options.multiple"
						:placeholder="options.placeholder || $t('Click to select')"
						:loading="options.loading"
						:options="options.data"
						:selectLabel="$t('Select')"
						:deselectLabel="$t('Remove')"
						:closeOnSelect="!options.multiple"
						@input="filterChanged(filter)"
					/>
					<b-field v-else-if="options.type === 'date'">
						<b-datepicker
							v-model="selectedFiltersOptions[filter]"
							expanded
							icon-right="calendar"
							:placeholder="options.placeholder || $t('')"
							@input="filterChanged(filter)"
						/>
						<b-button
							icon-left="times"
							@click="removeDate(filter)"
						/>
					</b-field>
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
			return "column is-12-mobile is-half-tablet is-one-third-desktop is-one-quarter-widescreen is-one-fifth-fullhd";
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
					if (this.filtersOptions[key].type === "date") {
						filters[filterKey] = new Date(this.selectedFiltersOptions[key]).toISOString();
					} else {
						const select = this.filtersOptions[key]?.selectValue || this.filtersOptions[key].trackBy || "code";
						filters[filterKey] = [this.selectedFiltersOptions[key][select]];
					}
				}
			});
			this.$emit("filtersChanged", filters, filterName);
		},

		removeDate(filter) {
			this.selectedFiltersOptions[filter] = null;
			this.filterChanged(filter);
		},
	},
};
</script>
