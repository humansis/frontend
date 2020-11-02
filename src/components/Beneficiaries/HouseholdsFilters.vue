<template>
	<div class="mb-5">
		<div class="columns is-multiline">
			<div v-for="(options, filter) in filtersOptions" :key="filter" class="column">
				<b-field :label="filter">
					<b-tag
						v-for="filterSelectedOptions in selectedFiltersOptions[filter]"
						type="is-success"
						closable
						:key="filterSelectedOptions"
					>
						{{ filterSelectedOptions }}
					</b-tag>
					<b-dropdown
						v-model="selectedFiltersOptions[filter]"
						multiple
						@change="filterChanged"
					>
						<button class="button is-primary is-light" type="button" slot="trigger">
							<span>Select {{ filter }}</span>
							<b-icon icon="chevron-circle-down"></b-icon>
						</button>
						<b-dropdown-item
							v-for="(value, key) in options"
							:key="key"
							:value="value"
						>
							<span>{{ value }}</span>
						</b-dropdown-item>
					</b-dropdown>
				</b-field>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "HouseholdsFilters",

	props: {
		filtersOptions: Object,
	},

	data() {
		return {
			selectedFiltersOptions: {
				projects: [],
				vulnerabilities: [],
				gender: "",
				residencies: [],
				referrals: [],
				livelihoods: [],
				adm1: "",
				adm2: "",
				adm3: "",
				adm4: "",
			},
		};
	},

	methods: {
		filterChanged() {
			this.$emit("filtersChanged", this.selectedFiltersOptions);
		},
	},
};
</script>
