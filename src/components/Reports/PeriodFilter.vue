<template>
	<div>
		<div>
			<b-button class="mx-2">Per Year</b-button>
			<b-button class="mx-2">Per Quarter</b-button>
			<b-button class="mx-2">Per Month</b-button>
			<b-button class="mx-2" @click="showChoosePeriod">Choose Period</b-button>
		</div>
		<div v-if="showChoosePeriodForm" class="ml-2 mt-5 box">
			<b-field class="columns">
				<div class="column is-half">
					<b-datepicker
						placeholder="From"
						icon="calendar"
						editable
					/>
				</div>
				<div class="column is-half">
					<b-datepicker
						placeholder="To"
						icon="calendar"
						editable
					/>
				</div>
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
