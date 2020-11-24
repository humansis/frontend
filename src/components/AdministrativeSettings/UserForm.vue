<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Email"
				:type="validateType('email')"
			>
				<b-input
					v-model="formModel.email"
					type="email"
					placeholder="Email"
					:disabled="formDisabled"
					@blur="validate('email')"
				/>
			</b-field>
			<!-- TODO add rules to password -->
			<b-field
				label="Password"
				:type="validateType('password')"
				:message="validateMsg('password', 'Required')"
			>
				<b-input
					v-model="formModel.password"
					type="password"
					placeholder="Password"
					password-reveal
					:disabled="formDisabled"
					@blur="validate('password')"
				/>
			</b-field>

			<b-field
				label="Rights"
				:type="validateType('rights')"
				:message="validateMsg('rights', 'Required')"
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
				label="Organization"
				:type="validateType('organization')"
				:message="validateMsg('organization', 'Required')"
			>
				<MultiSelect
					v-model="formModel.organization"
					searchable
					placeholder="Organization"
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="organizations"
				/>
			</b-field>

			<b-field
				v-show="!formModel.disabledProject"
				label="Project"
				:type="validateType('projects')"
				:message="validateMsg('projects', 'Required')"
			>
				<MultiSelect
					v-model="formModel.projects"
					searchable
					placeholder="Project"
					label="name"
					track-by="iso3"
					:multiple="true"
					:disabled="formDisabled || formModel.disabledProject"
					:options="projects"
				/>
			</b-field>

			<b-field
				v-show="!formModel.disabledCountry"
				label="Country"
				:type="validateType('countries')"
				:message="validateMsg('countries', 'Required')"
			>
				<MultiSelect
					v-model="formModel.countries"
					searchable
					placeholder="Country"
					label="name"
					track-by="iso3"
					:multiple="!onlyOneCountry"
					:disabled="formDisabled || formModel.disabledCountry"
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
				:type="validateType('prefix')"
			>
				<b-input
					v-model="formModel.prefix"
					placeholder="Prefix"
					:disabled="formDisabled"
					@blur="validate('prefix')"
				/>
			</b-field>

			<b-field
				label="Phone Number"
				:type="validateType('phoneNumber')"
			>
				<b-input
					v-model="formModel.phoneNumber"
					placeholder="Phone Number"
					:disabled="formDisabled"
					@blur="validate('phoneNumber')"
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
import Validation from "@/mixins/validation";
import ProjectsService from "@/services/ProjectsService";
import LocationsService from "@/services/LocationsService";
import MyOrganizationsService from "@/services/MyOrganizationsService";

export default {
	name: "userForm",

	mixins: [Validation],

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
			organization: {
				required,
			},
			projects: {
				required: requiredIf((form) => !form.disabledProject),
			},
			countries: {
				required: requiredIf((form) => !form.disabledCountry),
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
			organizations: [],
			onlyOneCountry: false,
		};
	},

	mounted() {
		this.fetchOrganizations();
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

		onRightsSelect({ id }) {
			this.validate("rights");
			if (id === 1 || id === 2 || id === 3 || id === 6) {
				this.fetchProjects();
				this.formModel.disabledProject = false;
				this.formModel.disabledCountry = true;
			} else if (id === 4 || id === 5) {
				this.onlyOneCountry = (id === 4);
				this.fetchCountries();
				this.formModel.disabledProject = true;
				this.formModel.disabledCountry = false;
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

		async fetchOrganizations() {
			await MyOrganizationsService.getListOfMyOrganizations()
				.then((response) => {
					this.organizations = response.data;
				});
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

	},
};
</script>
