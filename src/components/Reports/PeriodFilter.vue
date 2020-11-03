<template>
	<div>
		<div>
			<b-button class="period-button">Per Year</b-button>
			<b-button class="period-button">Per Quarter</b-button>
			<b-button class="period-button">Per Month</b-button>
			<b-button class="period-button" @click="showChoosePeriod">Choose Period</b-button>
		</div>
		<div v-if="showChoosePeriodForm">
			<b-field>
				<b-datepicker
					placeholder="From"
					icon="calendar-today"
					editable>
				</b-datepicker>
				<b-datepicker
					placeholder="To"
					icon="calendar-today"
					editable>
				</b-datepicker>
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

<style scoped>
.period-button {
	margin: 0 10px 0 10px;
}
</style>
