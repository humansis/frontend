<template>
	<div class="px-5 pb-5 has-border-bottom">
		<div class="columns is-multiline">
			<div v-for="(options, filter) in filtersOptions" :key="filter" :class="filterClass">
				<b-field v-if="options.type === 'empty'" />
				<b-field v-else :label="$t(options.name)">
					<MultiSelect
						v-if="!options.type || options.type === 'multiselect'"
						v-model="selectedFiltersOptions[filter]"
						searchable
						:label="options.label || 'value'"
						:track-by="options.trackBy || 'code'"
						:multiple="options.multiple"
						:placeholder="$t(options.placeholder) || $t('Click to select')"
						:select-label="$t('Press enter to select')"
						:selected-label="$t('Selected')"
						:deselect-label="$t('Press enter to remove')"
						:loading="options.loading"
						:options="options.data"
						:selectLabel="$t('Select')"
						:deselectLabel="$t('Remove')"
						:closeOnSelect="!options.multiple"
						@input="filterChanged(filter)"
					>
						<template slot="option" slot-scope="props">
							<span class="option__title">{{ props.option[options.label || 'value'] }}</span>
							<span class="option__small" v-if="props.option.parentLocationName">
								({{ props.option.parentLocationName }})
							</span>
						</template>
						<span slot="noOptions">{{ $t("List is empty")}}</span>
					</MultiSelect>
					<b-field v-else-if="options.type === 'text'">
						<b-input
							v-model="selectedFiltersOptions[filter]"
							expanded
							:placeholder="options.placeholder || ''"
							@input="filterChangeDelay(filter)"
						/>
						<b-button
							icon-left="times"
							@click="removeFilterValue(filter)"
						/>
					</b-field>
					<b-field v-else-if="options.type === 'date'">
						<b-datepicker
							v-model="selectedFiltersOptions[filter]"
							expanded
							icon-right="calendar"
							:month-names="months()"
							:placeholder="$t(options.placeholder) || ''"
							@input="filterChanged(filter)"
						/>
						<b-button
							icon-left="times"
							@click="removeFilterValue(filter)"
						/>
					</b-field>
					<b-field v-else-if="options.type === 'datetime'">
						<b-datetimepicker
							v-model="selectedFiltersOptions[filter]"
							expanded
							icon-right="calendar"
							:placeholder="$t(options.placeholder) || ''"
							@input="filterChanged(filter)"
						/>
						<b-button
							icon-left="times"
							@click="removeFilterValue(filter)"
						/>
					</b-field>
					<b-field v-else-if="options.type === 'time'">
						<b-timepicker
							v-model="selectedFiltersOptions[filter]"
							icon="clock"
							expanded
							:placeholder="$t(options.placeholder) || ''"
							@input="filterChanged(filter)"
						/>
						<b-button
							icon-left="times"
							@click="removeFilterValue(filter)"
						/>
					</b-field>
				</b-field>
			</div>
		</div>

		<div class="has-text-right">
			<b-button type="is-primary" icon-left="search" @click="$emit('onSearch')">
				{{ $t('Search') }}
			</b-button>
		</div>
	</div>
</template>

<script>
import calendarHelper from "@/mixins/calendarHelper";

export default {
	name: "AdvancedFilter",

	mixins: [calendarHelper],

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

	computed: {
		filterClass() {
			return "column is-12-mobile is-half-tablet is-one-third-desktop is-one-quarter-widescreen is-one-fifth-fullhd";
		},
	},

	methods: {
		customLabel({ name, subLabel }) {
			return `${name} – ${subLabel}`;
		},

		filterChanged(filterName) {
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
			// Component does not re-render selectedFiltersOptions[filter], need to force update:
			this.$forceUpdate();
		},

		filterChangeDelay(filter) {
			clearTimeout(this.timer);

			this.timer = setTimeout(() => {
				this.filterChanged(filter);
			}, 150);
		},

		removeFilterValue(filter) {
			this.selectedFiltersOptions[filter] = null;
			this.filterChanged(filter);
		},
	},
};
</script>

<style>
.option__small {
	font-size: 0.85em;
}
</style>
