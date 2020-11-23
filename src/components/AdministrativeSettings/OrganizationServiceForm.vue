<!-- TODO edit after real api-->
<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Service Name"
				:type="getValidationType('name')"
			>
				<b-input
					v-model="formModel.name"
					disabled
					placeholder="Service Name"
				/>
			</b-field>

			<b-field
				label="Country"
				:type="getValidationType('country')"
			>
				<b-input
					v-model="formModel.country"
					disabled
					placeholder="Country"
				/>
			</b-field>

			<b-field
				v-if="formModel.password"
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
				v-if="formModel.username"
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
				v-if="formModel.email"
				label="Email"
				:type="getValidationType('email')"
				:message="getValidationMessage('email', 'Required')"
			>
				<b-input
					v-model="formModel.email"
					placeholder="Email"
					:disabled="formDisabled"
					@blur="validateInput('email')"
				/>
			</b-field>

			<b-field
				v-if="formModel.token"
				label="Token"
				:type="getValidationType('token')"
				:message="getValidationMessage('token', 'Required')"
			>
				<b-input
					v-model="formModel.token"
					placeholder="Token"
					:disabled="formDisabled"
					@blur="validateInput('token')"
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

			<b-field
				label="Enabled"
			>
				<b-checkbox
					v-model="formModel.enabled"
					:disabled="formDisabled"
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
import ProjectsService from "@/services/ProjectsService";

export default {
	name: "OrganizationServiceForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			name: {
				required,
			},
			country: {
				required,
			},
			enabled: {
				required,
			},
			password: {},
			username: {},
			token: {},
			email: {},
			production: {},
		},
	},

	mounted() {
		this.fetchProjects();
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
			this.$v.$reset();
			this.$emit("formClosed");
		},

		fetchProjects() {
			ProjectsService.getListOfProjects(
				1,
				15,
				"desc",
			).then((response) => {
				this.projects = response.data;
			});
		},
	},
};
</script>
