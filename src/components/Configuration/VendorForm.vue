<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Username"
				:type="getValidationType('username')"
				:message="getValidationMessage('username', 'Required')"
			>
				<b-input
					v-model="formModel.username"
					placeholder="Username"
					:disabled="formDisabled"
					@blur="validateInput('username')"
				/>
			</b-field>
			<b-field
				v-if="formModel.creating"
				label="Password"
				:type="getValidationType('password')"
				:message="getValidationMessage('password', 'Required')"
			>
				<b-input
					v-model="formModel.password"
					type="password"
					placeholder="Password"
					password-reveal
					:disabled="formDisabled"
					@blur="validateInput('password')"
				/>
			</b-field>
			<b-field
				label="Name"
				:type="getValidationType('name')"
				:message="getValidationMessage('name', 'Required')"
			>
				<b-input
					v-model="formModel.name"
					placeholder="Name"
					:disabled="formDisabled"
					@blur="validateInput('name')"
				/>
			</b-field>

			<b-field
				label="Description"
				:type="getValidationType('description')"
				:message="getValidationMessage('description', 'Required')"
			>
				<b-input
					v-model="formModel.description"
					placeholder="Description"
					:disabled="formDisabled"
					@blur="validateInput('description')"
				/>
			</b-field>

			<b-field
				label="Address Street"
				:type="getValidationType('addressStreet')"
				:message="getValidationMessage('addressStreet', 'Required')"
			>
				<b-input
					v-model="formModel.addressStreet"
					placeholder="Address Street"
					:disabled="formDisabled"
					@blur="validateInput('addressStreet')"
				/>
			</b-field>

			<b-field
				label="Address Number"
				:type="getValidationType('addressNumber')"
				:message="getValidationMessage('addressNumber', 'Required')"
			>
				<b-input
					v-model="formModel.addressNumber"
					placeholder="Address Number"
					:disabled="formDisabled"
					@blur="validateInput('addressNumber')"
				/>
			</b-field>

			<b-field
				label="Address Postcode"
				:type="getValidationType('addressPostcode')"
				:message="getValidationMessage('addressPostcode', 'Required')"
			>
				<b-input
					v-model="formModel.addressPostcode"
					placeholder="Address Postcode"
					:disabled="formDisabled"
					@blur="validateInput('addressPostcode')"
				/>
			</b-field>

			<locationForm
				ref="locationForm"
				:form-model="formModel"
				:form-disabled="formDisabled"
			/>

		</section>

		<footer class="modal-card-foot">
			<button v-if="closeButton" class="button" type="button" @click="closeForm">
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
import { required, requiredIf } from "vuelidate/lib/validators";
import locationForm from "@/components/LocationForm";

export default {
	name: "vendorForm",

	components: { locationForm },

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			username: {
				required,
			},
			password: {
				required: requiredIf((form) => form.creating),
			},
			name: {
				required,
			},
			description: {
			},
			addressStreet: {
			},
			addressNumber: {
			},
			addressPostcode: {
			},
			adm1Id: {
				required,
			},
			adm2Id: {
			},
			adm3Id: {
			},
			adm4Id: {
			},
		},
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			this.$refs.locationForm.submitLocationForm();
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
