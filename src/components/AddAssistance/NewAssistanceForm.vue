<template>
	<div>
		<h2 class="title">New Assistance</h2>
		<form>
			<LocationForm
				ref="locationForm"
				:form-model="formModel"
			/>
			<b-field label="Date of Assistance">
				<b-datepicker
					v-model="formModel.dateOfAssistance"
					show-week-number
					placeholder="Click to select..."
					icon="calendar-day"
					trap-focus
				/>
			</b-field>
			<b-field
				label="Target"
				:type="validateType('target')"
				:message="validateMsg('target', 'Target is Required')"
			>
				<div class="block">
					<b-radio
						v-model="formModel.target"
						name="target"
						native-value="Household"
						@input="$emit('onTargetSelect', 'Household')"
					>
						Household
					</b-radio>
					<b-radio
						v-model="formModel.target"
						name="target"
						native-value="Individual"
						@input="$emit('onTargetSelect', 'Individual')"
					>
						Individual
					</b-radio>
				</div>
			</b-field>
		</form>
	</div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import LocationForm from "@/components/LocationForm";
import Validation from "@/mixins/validation";

export default {
	name: "NewAssistanceForm",

	components: { LocationForm },

	updated() {
		// TODO Emit only if form is validated else emit false
		this.$emit("updatedData", this.formModel);
	},

	mixins: [Validation],

	data() {
		return {
			formModel: {
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
				dateOfAssistance: new Date(),
				target: "",
			},
		};
	},

	validations: {
		formModel: {
			target: {
				required,
			},
			adm1: {},
			adm2: {},
			adm3: {},
			adm4: {},
			dateOfAssistance: {},
		},
	},

	methods: {
		submit() {
			this.$v.$touch();
			const validLocationForm = this.$refs.locationForm.submitLocationForm();
			return this.$v.$invalid || validLocationForm;
		},
	},
};
</script>
