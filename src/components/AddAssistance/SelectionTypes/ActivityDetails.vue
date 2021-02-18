<template>
	<div>
		<h2 class="subtitle">Activity Details</h2>
		<form class="box">
			<b-field
				v-if="visible.activityDescription"
				label="Activity Description"
				:type="validateType('activityDescription')"
				:message="validateMsg('activityDescription')"
			>
				<b-input
					v-model="formModel.activityDescription"
					@blur="validate('activityDescription')"
				/>
			</b-field>
			<b-field
				v-if="visible.householdsTargeted"
				label="Households Targeted"
				:type="validateType('householdsTargeted')"
				:message="validateMsg('householdsTargeted')"
			>
				<b-numberinput
					v-model="formModel.householdsTargeted"
					expanded
					controls-alignment="right"
					controls-position="compact"
					:min="0"
					@blur="validate('householdsTargeted')"
				/>
			</b-field>
			<b-field
				v-if="visible.individualsTargeted"
				label="Individuals Targeted"
				:type="validateType('individualsTargeted')"
				:message="validateMsg('individualsTargeted')"
			>
				<b-numberinput
					v-model="formModel.individualsTargeted"
					expanded
					controls-alignment="right"
					controls-position="compact"
					:min="0"
					@blur="validate('individualsTargeted')"
				/>
			</b-field>
		</form>
	</div>
</template>

<script>
import validation from "@/mixins/validation";
import { requiredIf } from "vuelidate/lib/validators";

export default {
	name: "ActivityDetails",

	mixins: [validation],

	props: {
		formModel: Object,
		visible: Object,
	},

	validations: {
		formModel: {
			// eslint-disable-next-line func-names
			activityDescription: { required: requiredIf(function () {
				return this.visible.activityDescription;
			}) },
			// eslint-disable-next-line func-names
			householdsTargeted: { required: requiredIf(function () {
				return this.visible.householdsTargeted;
			}) },
			// eslint-disable-next-line func-names
			individualsTargeted: { required: requiredIf(function () {
				return this.visible.individualsTargeted;
			}) },
		},
	},
};
</script>
