<template>
	<div>
		<h3 class="title is-4">{{ $t('Activity Details') }}</h3>
		<form class="box">
			<b-field
				v-if="visible.activityDescription"
				:label="$t('Activity Description')"
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
				:label="$t('Households Targeted')"
				:type="validateType('householdsTargeted')"
				:message="validateMsg('householdsTargeted')"
			>
				<b-numberinput
					v-model="formModel.householdsTargeted"
					expanded
					type="is-dark"
					:controls="false"
					:min="0"
					@blur="validate('householdsTargeted')"
				/>
			</b-field>
			<b-field
				v-if="visible.individualsTargeted"
				:label="$t('Individuals Targeted')"
				:type="validateType('individualsTargeted')"
				:message="validateMsg('individualsTargeted')"
			>
				<b-numberinput
					v-model="formModel.individualsTargeted"
					expanded
					type="is-dark"
					:controls="false"
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

	data() {
		return {
			formModel: {
				activityDescription: "",
				householdsTargeted: 0,
				individualsTargeted: 0,
			},
		};
	},

	mixins: [validation],

	props: {
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

	updated() {
		this.$emit("updatedData", this.formModel);
	},

	methods: {
		submit() {
			this.$v.$touch();
			return !this.$v.$invalid;
		},
	},
};
</script>
