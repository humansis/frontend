<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field label="Criteria Target">
				<MultiSelect
					v-model="formModel.criteriaTarget"
					placeholder="Click to select..."
					:options="options.criteriaTarget"
					:searchable="false"
					@select="onCriteriaTargetSelect"
				/>
			</b-field>

			<b-field label="Criteria">
				<MultiSelect
					v-model="formModel.criteria"
					placeholder="Click to select..."
					:options="criteria"
					:searchable="false"
					@select="onCriteriaSelect"
				/>
			</b-field>

			<b-field label="Condition">
				<MultiSelect
					v-model="formModel.condition"
					placeholder="Click to select..."
					:options="options.condition"
					:searchable="false"
				/>
			</b-field>

			<b-field
				v-if="showValueInput && !showLocation"
				label="Value"
			>
				<b-datepicker
					v-if="formModel.criteria === 'Date Of Birth'"
					v-model="formModel.value"
					show-week-number
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus
				/>
				<MultiSelect
					v-else-if="formModel.criteria === 'Gender'"
					v-model="formModel.value"
					label="value"
					track-by="code"
					placeholder="Click to select..."
					:options="options.gender"
					:searchable="false"
				/>
				<b-input
					v-else
					v-model="formModel.value"
				/>

			</b-field>
			<LocationForm
				v-if="showLocation"
				ref="locationForm"
				:form-model="formModel"
			/>
			<b-field label="Score Weight">
				<b-numberinput v-model="formModel.scoreWeight" />
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
import LocationForm from "@/components/LocationForm";

export default {
	name: "SelectionCriteriaForm",

	components: { LocationForm },

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
				gender: [
					{ code: "M", value: "Male" },
					{ code: "F", value: "Female" },
				],
			},
			showValueInput: true,
			showLocation: false,
		};
	},

	computed: {
		criteria() {
			return this.options.criteria;
		},
	},

	methods: {
		onCriteriaTargetSelect(criteriaTarget) {
			this.formModel.criteria = "";
			this.formModel.condition = "";
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

		onCriteriaSelect(criteria) {
			this.formModel.condition = "";
			this.showValueInput = true;
			this.showLocation = false;
			switch (criteria) {
				case "Residency Status":
				case "Location Type":
				case "IDPoor":
				case "EquityCardNo":
				case "Gender":
					this.options.condition = ["=", "!="];
					break;
				case "Household Size":
				case "Date Of Birth":
					this.options.condition = [">", "<", ">=", "<=", "=", "!="];
					break;
				case "Livelihood":
				case "Food Consumption Score":
				case "Income Level":
				case "Copying Strategies Index":
				case "Has Not Been In A Distribution Since":
					this.options.condition = ["="];
					break;
				case "Solo Parent":
				case "Lactating":
				case "Pregnant":
				case "Nutritional Issues":
				case "Disable":
					this.options.condition = ["True", "False"];
					this.showValueInput = false;
					break;
				case "Current Location":
					this.options.condition = ["="];
					this.showLocation = true;
					break;
				default: break;
			}
		},

		submitForm() {
			this.$emit("formSubmitted", this.formModel);
		},

		closeForm() {
			this.$emit("formClosed");
		},
	},
};
</script>
