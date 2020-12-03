<template>
	<div>
		<div>
			<b-button
				class="mx-2"
				:active="selectedPeriod === 'year'"
				@click="selectPeriod('year')"
			>
				Per Year
			</b-button>
			<b-button
				class="mx-2"
				:active="selectedPeriod === 'quarter'"
				@click="selectPeriod('quarter')"
			>
				Per Quarter
			</b-button>
			<b-button
				class="mx-2"
				:active="selectedPeriod === 'month'"
				@click="selectPeriod('month')"
			>
				Per Month
			</b-button>
			<b-button class="mx-2" @click="showChoosePeriod">
				Choose Period
			</b-button>
		</div>
		<div v-if="showChoosePeriodForm" class="ml-2 mt-5 box">
			<b-field class="columns">
				<div class="column is-half">
					<b-datepicker
						v-model="from"
						placeholder="From"
						icon="calendar"
						editable
						@input="choosePeriod"
					/>
				</div>
				<div class="column is-half">
					<b-datepicker
						v-model="to"
						placeholder="To"
						icon="calendar"
						editable
						@input="choosePeriod"
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
			selectedPeriod: null,
			to: null,
			from: null,
		};
	},

	methods: {
		showChoosePeriod() {
			this.showChoosePeriodForm = !this.showChoosePeriodForm;
		},

		selectPeriod(period) {
			this.selectedPeriod = this.selectedPeriod !== period ? period : "";
			this.$emit("periodChanged", this.selectedPeriod);
		},

		choosePeriod() {
			this.$emit("choosePeriodChanged", { from: this.from, to: this.to });
		},
	},
};
</script>

<style scoped>
.is-active {
	background-color: #e3e3e3;
}
</style>
