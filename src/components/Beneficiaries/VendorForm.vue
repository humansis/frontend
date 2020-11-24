<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Username"
				:type="validateType('username')"
				:message="validateMsg('username', 'Required')"
			>
				<b-input
					v-model="formModel.username"
					:disabled="formDisabled"
					@blur="validate('username')"
				/>
			</b-field>

			<b-field
				v-if="formModel.creating"
				label="Password"
				:type="validateType('password')"
				:message="validateMsg('password', 'Required')"
			>
				<b-input
					v-model="formModel.password"
					type="password"
					password-reveal
					:disabled="formDisabled"
					@blur="validate('password')"
				/>
			</b-field>

			<b-field
				label="Name"
				:type="validateType('name')"
				:message="validateMsg('name', 'Required')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field
				label="Description"
				:type="validateType('description')"
				:message="validateMsg('description', 'Required')"
			>
				<b-input
					v-model="formModel.description"
					:disabled="formDisabled"
					@blur="validate('description')"
				/>
			</b-field>

			<b-field
				label="Address Street"
				:type="validateType('addressStreet')"
				:message="validateMsg('addressStreet', 'Required')"
			>
				<b-input
					v-model="formModel.addressStreet"
					:disabled="formDisabled"
					@blur="validate('addressStreet')"
				/>
			</b-field>

			<b-field
				label="Address Number"
				:type="validateType('addressNumber')"
				:message="validateMsg('addressNumber', 'Required')"
			>
				<b-input
					v-model="formModel.addressNumber"
					:disabled="formDisabled"
					@blur="validate('addressNumber')"
				/>
			</b-field>

			<b-field
				label="Address Postcode"
				:type="validateType('addressPostcode')"
				:message="validateMsg('addressPostcode', 'Required')"
			>
				<b-input
					v-model="formModel.addressPostcode"
					:disabled="formDisabled"
					@blur="validate('addressPostcode')"
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
import Validation from "@/mixins/validation";
import locationForm from "@/components/LocationForm";

export default {
	name: "vendorForm",

	mixins: [Validation],

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

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},
	},
};
</script>
