<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Email"
				:type="getValidationType('email')"
			>
				<b-input
					v-model="formModel.email"
					type="email"
					placeholder="Email"
					:disabled="formDisabled"
					@blur="validateInput('email')"
				/>
			</b-field>
			<!-- TODO add rules to password -->
			<b-field
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
				label="Rights"
				:type="getValidationType('rights')"
				:message="getValidationMessage('rights', 'Required')"
			>
				<MultiSelect
					v-model="formModel.rights"
					searchable
					placeholder="Rights"
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="rights"
					@select="onRightsSelect"
				/>
			</b-field>

			<b-field
				v-show="!disabledProject"
				label="Project"
				:type="getValidationType('projects')"
				:message="getValidationMessage('projects', 'Required')"
			>
				<MultiSelect
					v-model="formModel.projects"
					searchable
					placeholder="Project"
					label="name"
					track-by="iso3"
					:multiple="true"
					:disabled="formDisabled || disabledProject"
					:options="projects"
				/>
			</b-field>

			<b-field
				v-show="!disabledCountry"
				label="Country"
				:type="getValidationType('countries')"
				:message="getValidationMessage('countries', 'Required')"
			>
				<MultiSelect
					v-model="formModel.countries"
					searchable
					placeholder="Country"
					label="name"
					track-by="iso3"
					:multiple="!onlyOneCountry"
					:disabled="formDisabled || disabledCountry"
					:options="countries"
				/>
			</b-field>

			<b-field
				v-if="!formDisabled"
				label="Update Password On Next Login"
			>
				<b-checkbox
					v-model="formModel.updatePasswordOnNextLogin"
				/>
			</b-field>

			<b-field
				label="Prefix"
				:type="getValidationType('prefix')"
			>
				<b-input
					v-model="formModel.prefix"
					placeholder="Prefix"
					:disabled="formDisabled"
					@blur="validateInput('prefix')"
				/>
			</b-field>

			<b-field
				label="Phone Number"
				:type="getValidationType('phoneNumber')"
			>
				<b-input
					v-model="formModel.phoneNumber"
					placeholder="Phone Number"
					:disabled="formDisabled"
					@blur="validateInput('phoneNumber')"
				/>
			</b-field>

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
import { required, requiredIf, email } from "vuelidate/lib/validators";
import ProjectsService from "@/services/ProjectsService";
import LocationsService from "@/services/LocationsService";

export default {
	name: "userForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			email: {
				required,
				email,
			},
			password: {
				required,
			},
			rights: {
				required,
			},
			projects: {
				required: requiredIf(() => this.disabledProject),
			},
			countries: {
				required: requiredIf(() => this.disabledCountry),
			},
			phoneNumber: {},
			prefix: {},
			updatePasswordOnNextLogin: {},
		},
	},

	data() {
		return {
			// TODO fix after implementing real api or roleService or something like that
			rights: [
				{
					name: "Administrator",
					id: 0,
				},
				{
					name: "Field Officer",
					id: 1,
				},
				{
					name: "Project Officer",
					id: 2,
				},
				{
					name: "Project Manager",
					id: 3,
				},
				{
					name: "Country Manager",
					id: 4,
				},
				{
					name: "Regional Manager",
					id: 5,
				},
				{
					name: "Enumerator",
					id: 6,
				},
			],
			projects: [],
			countries: [],
			onlyOneCountry: false,
			disabledCountry: true,
			disabledProject: true,
		};
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

		onRightsSelect({ id }) {
			this.validateInput("rights");
			if (id === 1 || id === 2 || id === 3 || id === 6) {
				this.fetchProjects();
				this.disabledProject = false;
				this.disabledCountry = true;
			} else if (id === 4 || id === 5) {
				this.onlyOneCountry = (id === 4);
				this.fetchCountries();
				this.disabledProject = true;
				this.disabledCountry = false;
			}
		},

		async fetchProjects() {
			await ProjectsService.getListOfProjects(1, 15, "desc")
				.then((response) => {
					this.projects = response.data;
				});
		},

		async fetchCountries() {
			await LocationsService.getListOfCountries()
				.then((response) => {
					this.countries = response.data;
				});
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

	},
};
</script>
