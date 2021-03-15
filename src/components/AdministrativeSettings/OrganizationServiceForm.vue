<!-- TODO edit after real api-->
<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Service Name"
				:type="validateType('name')"
			>
				<b-input
					v-model="formModel.name"
					disabled
				/>
			</b-field>

			<b-field
				label="Country"
				:type="validateType('country')"
			>
				<b-input
					v-model="formModel.country"
					disabled
				/>
			</b-field>

			<b-field
				v-if="formModel.password"
				label="Password"
				:type="validateType('password')"
				:message="validateMsg('password')"
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
				v-if="formModel.username"
				label="Username"
				:type="validateType('username')"
				:message="validateMsg('username')"
			>
				<b-input
					v-model="formModel.username"
					:disabled="formDisabled"
					@blur="validate('username')"
				/>
			</b-field>

			<b-field
				v-if="formModel.email"
				label="Email"
				:type="validateType('email')"
				:message="validateMsg('email')"
			>
				<b-input
					v-model="formModel.email"
					:disabled="formDisabled"
					@blur="validate('email')"
				/>
			</b-field>

			<b-field
				v-if="formModel.token"
				label="Token"
				:type="validateType('token')"
				:message="validateMsg('token')"
			>
				<b-input
					v-model="formModel.token"
					:disabled="formDisabled"
					@blur="validate('token')"
				/>
			</b-field>

			<b-field
				v-if="formModel.production !== null"
				label="Production"
			>
				<b-checkbox
					v-model="formModel.production"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field label="Enabled">
				<b-checkbox
					v-model="formModel.enabled"
					:disabled="formDisabled"
				/>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button
				v-if="closeButton"
				@click="closeForm"
			>
				Close
			</b-button>
			<b-button
				v-if="!formDisabled"
				tag="input"
				class="is-primary"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";

export default {
	name: "OrganizationServiceForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			name: { required },
			country: { required },
			enabled: { required },
			password: {},
			username: {},
			token: {},
			email: {},
			production: {},
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

		closeForm() {
			this.$v.$reset();
			this.$emit("formClosed");
		},
	},
};
</script>
