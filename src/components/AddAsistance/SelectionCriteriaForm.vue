<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Criteria Target"
			>
				<MultiSelect
					v-model="formModel.criteriaTarget"
					placeholder="Click to select..."
					:options="options.criteriaTarget"
					:searchable="false"
					@select="onCriteriaTargetSelect"
				/>
			</b-field>

			<b-field
				label="Criteria"
			>
				<MultiSelect
					v-model="formModel.criteria"
					placeholder="Click to select..."
					:options="criteria"
					:searchable="false"
				/>
			</b-field>

			<b-field
				label="Condition"
			>
				<MultiSelect
					v-model="formModel.condition"
					placeholder="Click to select..."
					:options="options.condition"
					:searchable="false"
				/>
			</b-field>

			<b-field
				label="Value"
			>

				<b-input
					v-model="formModel.value"
					v-if="formModel.criteria !== 'Date Of Birth'"
				/>

				<b-datepicker
					v-else
					v-model="formModel.value"
					show-week-number
					locale="en-GB"
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus
				/>
			</b-field>

			<b-field
				label="Score Weight"
			>
				<b-numberinput
					v-model="formModel.scoreWeight"
				/>
			</b-field>

		</section>

		<footer class="modal-card-foot">
			<button v-if="closeButton" class="button" type="button" @click="closeForm">
				Close
			</button>
			<b-button
				tag="input"
				class="is-success"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>

export default {
	name: "SelectionCriteriaForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
	},

	data() {
		return {
			options: {
				criteriaTarget: ["Beneficiary", "Head", "Household"],
				criteria: [],
				condition: [">", "<", ">=", "<=", "=", "!="],
			},
		};
	},

	computed: {
		criteria() {
			return this.options.criteria;
		},
	},

	methods: {
		onCriteriaTargetSelect(criteriaTarget) {
			switch (criteriaTarget) {
				case "Beneficiary":
					this.options.criteria = [
						"Gender", "Date Of Birth", "Residency Status",
						"Has Not Been In A Distribution Since", "Disable", "Solo Parent",
						"Lactating", "Pregnant", "Nutritional Issues",
					];
					break;
				case "Head":
					this.options.criteria = ["Disable", "Date Of Birth", "Gender"];
					break;
				case "Household":
					this.options.criteria = [
						"Livelihood", "Food Consumption Score", "Coping Strategies Index",
						"Income Level", "Household Size", "Current Location", "Location Type",
						"IDPoor", "EquityCardNo",
					];
					break;
				default:
					this.options.criteria = [];
			}
		},

		submitForm() {
			this.$emit("formSubmitted", this.formModel);
		},

		closeForm() {
			this.$emit("close");
		},
	},
};
</script>
