<template>
	<div class="px-5 pb-5 has-border-bottom">
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
							#singleLabel
							v-slot:default="option"
						>
							{{ option }}
						</template>
					</MultiSelect>
					<b-datepicker
						v-if="filter.type === 'date'"
						v-model="selectedFiltersOptions[name]"
						trap-focus
						locale="en-CA"
						icon="calendar-day"
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
	name: "TransactionsFilter",

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
					placeholder: this.$t("Select Beneficiary"),
					data: [],
				},
				type: {
					label: "Type",
					type: "multiselect",
					placeholder: this.$t("Select Type"),
					data: [],
				},
				from: {
					label: "From",
					type: "date",
					placeholder: this.$t("Select Date"),
					data: [],
				},
				to: {
					label: "To",
					type: "date",
					placeholder: this.$t("Select Date"),
					data: [],
				},
				reedem: {
					label: "Reedem",
					type: "multiselect",
					placeholder: this.$t("Select Reedem"),
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
