<template>
	<div class="mb-5">
		<div class="columns is-multiline">
			<div v-for="(filter, name) in filters" :key="name" class="column is-half">
				<b-field :label="filter.label">
					<MultiSelect
						v-if="filter.type === 'multiselect'"
						v-model="selectedFiltersOptions[name]"
						searchable
						multiple
						:placeholder="filter.placeholder"
						:options="filter.data"
						@input="filterChanged"
					>
						<template
							slot="singleLabel"
							slot-scope="option"
						>
							{{ option }}
						</template>
					</MultiSelect>
					<b-datepicker
						v-if="filter.type === 'date'"
						v-model="selectedFiltersOptions[name]"
						trap-focus
						icon="calendar"
						:placeholder="filter.placeholder"
						@input="filterChanged"
					/>
				</b-field>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "TransactionFilters",

	data() {
		return {
			selectedFiltersOptions: {
				beneficiary: [],
				type: [],
				from: [],
				to: [],
				reedem: [],
			},
			filters: {
				beneficiary: {
					data: [],
					type: "multiselect",
					placeholder: "Select Beneficiary ...",
					label: "Beneficiary",
				},
				type: {
					data: [],
					type: "multiselect",
					placeholder: "Select Type ...",
					label: "Type",
				},
				from: {
					data: [],
					type: "date",
					placeholder: "Select Date ...",
					label: "From",
				},
				to: {
					data: [],
					type: "date",
					placeholder: "Select Date ...",
					label: "To",
				},
				reedem: {
					data: [],
					type: "multiselect",
					placeholder: "Select Reedem ...",
					label: "Reedem",
				},
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
