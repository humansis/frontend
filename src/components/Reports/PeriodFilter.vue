<template>
	<div>
		<div>
			<b-button class="mx-2">Per Year</b-button>
			<b-button class="mx-2">Per Quarter</b-button>
			<b-button class="mx-2">Per Month</b-button>
			<b-button class="mx-2" @click="showChoosePeriod">Choose Period</b-button>
		</div>
		<div v-if="showChoosePeriodForm">
			<b-field>
				<b-datepicker
					placeholder="From"
					icon="calendar-today"
					editable
				/>
				<b-datepicker
					placeholder="To"
					icon="calendar-today"
					editable
				/>
			</b-field>
		</div>
	</div>
</template>

<script>
export default {
	name: "PeriodFilter",

	data() {
		return {
			showChoosePeriodForm: false,
		};
	},

	methods: {
		showChoosePeriod() {
			this.showChoosePeriodForm = !this.showChoosePeriodForm;
		},
	},
};
</script>
