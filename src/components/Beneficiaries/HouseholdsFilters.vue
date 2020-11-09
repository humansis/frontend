<template>
	<div class="mb-5">
		<div class="columns is-multiline">
			<div v-for="(options, filter) in filtersOptions" :key="filter" class="column is-half">
				<b-field :label="filter">
					<MultiSelect
						v-model="selectedFiltersOptions[filter]"
						searchable
						placeholder="Select sectors"
						multiple
						:options="options"
						@input="filterChanged"
					>
						<template
							slot="singleLabel"
							slot-scope="option"
						>
							{{ option }}
						</template>
					</MultiSelect>
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
				gender: [],
				residencies: [],
				referrals: [],
				livelihoods: [],
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
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
