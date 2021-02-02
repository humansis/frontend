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
					label: "Beneficiary",
					type: "multiselect",
					placeholder: "Select Beneficiary ...",
					data: [],
				},
				type: {
					label: "Type",
					type: "multiselect",
					placeholder: "Select Type ...",
					data: [],
				},
				from: {
					label: "From",
					type: "date",
					placeholder: "Select Date ...",
					data: [],
				},
				to: {
					label: "To",
					type: "date",
					placeholder: "Select Date ...",
					data: [],
				},
				reedem: {
					label: "Reedem",
					type: "multiselect",
					placeholder: "Select Reedem ...",
					data: [],
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
