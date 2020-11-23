<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Field"
				:type="getValidationType('field')"
				:message="getValidationMessage('field', 'Required')"
			>
				<b-input
					v-model="formModel.field"
					placeholder="Field"
					:disabled="formDisabled"
					@blur="validateInput('field')"
				/>
			</b-field>

			<b-field
				label="Type"
				:type="getValidationType('type')"
				:message="getValidationMessage('type', 'Required')"
			>
				<MultiSelect
					v-model="formModel.type"
					searchable
					is-relative
					placeholder="Type"
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="types"
					@select="validateInput('type')"
				/>
			</b-field>
		</section>

		<footer class="modal-card-foot">
			<button
				v-if="closeButton"
				class="button"
				type="button"
				@click="closeForm"
			>
				Close
			</button>
			<b-button
				v-if="!formDisabled"
				tag="input"
				class="is-success"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";

export default {
	name: "CountrySpecificsForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	data() {
		return {
			types: [
				{
					id: "number",
					name: "Number",
				},
				{
					id: "text",
					name: "Text",
				},
			],
		};
	},

	validations: {
		formModel: {
			field: {
				required,
			},
			type: {
				required,
			},
		},
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
		},

		validateInput(fieldName) {
			this.$v.formModel[fieldName].$touch();
		},

		getValidationMessage(fieldName, message) {
			return this.$v.formModel[fieldName].$error ? message : "";
		},

		getValidationType(fieldName) {
			let result = "";
			if (this.$v.formModel[fieldName].$dirty) {
				result = this.$v.formModel[fieldName].$error ? "is-danger" : "is-success";
			}
			return result;
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
