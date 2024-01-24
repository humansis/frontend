<template>
	<h2 class="text-h6 mt-5 font-weight-bold">{{ $t('Activity Details') }}</h2>

	<v-card
		class="mx-auto mt-5"
	>
		<v-card-text>
			<DataInput
				v-if="visible.activityDescription"
				v-model="formModel.activityDescription"
				:error-messages="validationMsg('activityDescription')"
				label="Activity Description"
				name="activity-description"
				class="mb-4"
				@blur="onDataInput('activityDescription')"
			/>

			<DataInput
				v-if="visible.householdsTargeted"
				v-model.number="formModel.householdsTargeted"
				:error-messages="validationMsg('householdsTargeted')"
				label="Households Targeted"
				name="households-targeted"
				type="number"
				min="0"
				class="mb-4"
				hide-spin-buttons
				@blur="onDataInput('householdsTargeted')"
			/>

			<DataInput
				v-if="visible.individualsTargeted"
				v-model.number="formModel.individualsTargeted"
				:error-messages="validationMsg('individualsTargeted')"
				label="Individuals Targeted"
				name="individuals-targeted"
				type="number"
				min="0"
				class="mb-4"
				hide-spin-buttons
				@blur="onDataInput('individualsTargeted')"
			/>
		</v-card-text>
	</v-card>
</template>

<script>
import { requiredIf } from "@vuelidate/validators";
import DataInput from "@/components/Inputs/DataInput";
import validation from "@/mixins/validation";

export default {
	name: "ActivityDetails",

	components: {
		DataInput,
	},

	mixins: [validation],

	emits: ["updatedData"],

	validations() {
		return {
			formModel: {
				activityDescription: { required: requiredIf(this.visible.activityDescription) },
				householdsTargeted: { required: requiredIf(this.visible.householdsTargeted) },
				individualsTargeted: { required: requiredIf(this.visible.individualsTargeted) },
			},
		};
	},

	props: {
		visible: Object,

		data: {
			type: Object,
			default: null,
		},
	},

	data() {
		return {
			formModel: {
				activityDescription: "",
				householdsTargeted: 0,
				individualsTargeted: 0,
			},
		};
	},

	watch: {
		data(data) {
			if (data) {
				this.formModel = data;
			}
		},
	},

	methods: {
		onDataInput(field) {
			this.onValidate(field);
			this.$emit("updatedData", this.formModel);
		},

		submit() {
			this.v$.$touch();
			return !this.v$.$invalid;
		},
	},
};
</script>
