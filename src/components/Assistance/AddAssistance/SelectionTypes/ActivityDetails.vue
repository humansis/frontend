<template>
	<h2 class="text-h6 mt-5 font-weight-bold">{{ $t('Activity Details') }}</h2>

	<v-card class="mx-auto mt-5">
		<v-card-text>
			<DataInput
				v-if="visible.isActivityDescription"
				v-model="formModel.activityDescription"
				:error-messages="validationMsg('activityDescription')"
				label="Activity Description"
				name="activity-description"
				class="mb-4"
				@update:modelValue="onDataInput('activityDescription')"
			/>

			<DataInput
				v-if="visible.isHouseholdsTargeted"
				v-model.number="formModel.householdsTargeted"
				:error-messages="validationMsg('householdsTargeted')"
				label="Households Targeted"
				name="households-targeted"
				type="number"
				min="0"
				class="mb-4"
				hide-spin-buttons
				@update:modelValue="onDataInput('householdsTargeted')"
			/>

			<DataInput
				v-if="visible.isIndividualsTargeted"
				v-model.number="formModel.individualsTargeted"
				:error-messages="validationMsg('individualsTargeted')"
				label="Individuals Targeted"
				name="individuals-targeted"
				type="number"
				min="0"
				class="mb-4"
				hide-spin-buttons
				@update:modelValue="onDataInput('individualsTargeted')"
			/>
		</v-card-text>
	</v-card>
</template>

<script>
import { integer, minValue, requiredIf } from "@vuelidate/validators";
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
				activityDescription: { required: requiredIf(this.visible.isActivityDescription) },
				householdsTargeted: {
					required: requiredIf(this.visible.isHouseholdsTargeted),
					minValue: minValue(0),
					integer,
				},
				individualsTargeted: {
					required: requiredIf(this.visible.isIndividualsTargeted),
					minValue: minValue(0),
					integer,
				},
			},
		};
	},

	props: {
		visible: {
			type: Object,
			required: true,
		},

		duplicatedData: {
			type: Object,
			default: null,
		},

		isAssistanceDuplicated: {
			type: Boolean,
			default: false,
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
		duplicatedData: {
			deep: true,
			handler(value) {
				this.prepareDuplicatedData(value);
			},
		},
	},

	mounted() {
		if (this.isAssistanceDuplicated) {
			this.prepareDuplicatedData(this.duplicatedData);
		}
	},

	methods: {
		onDataInput(field) {
			this.onValidate(field);
			this.$emit("updatedData", this.formModel);
		},

		isFormValid() {
			this.v$.$touch();

			return !this.v$.$invalid;
		},

		prepareDuplicatedData(data) {
			this.formModel = data;
			this.$emit("updatedData", this.formModel);
		},
	},
};
</script>
