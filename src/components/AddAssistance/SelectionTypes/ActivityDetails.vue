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
import { requiredIf } from "vuelidate/lib/validators";
import validation from "@/mixins/validation";

export default {
	name: "ActivityDetails",

	mixins: [validation],

	/* eslint-disable func-names */
	validations: {
		formModel: {
			activityDescription: { required: requiredIf(function () {
				return this.visible.activityDescription;
			}) },
			householdsTargeted: { required: requiredIf(function () {
				return this.visible.householdsTargeted;
			}) },
			individualsTargeted: { required: requiredIf(function () {
				return this.visible.individualsTargeted;
			}) },
		},
	},
	/* eslint-enable func-names */

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
