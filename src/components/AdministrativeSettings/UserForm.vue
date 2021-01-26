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
					:disabled="formDisabled"
					@blur="validate('email')"
				/>
			</b-field>

			<!-- TODO add rules to password -->
			<b-field
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
				label="Organization"
				:type="validateType('organization')"
				:message="validateMsg('organization')"
			>
				<MultiSelect
					v-model="formModel.organization"
					searchable
					label="value"
					track-by="code"
					placeholder="Click to select..."
					:disabled="formDisabled"
					:options="options.organizations"
					:class="validateMultiselect('organization')"
					@select="validate('organization')"
				/>
			</b-field>

			<b-field
				label="Rights"
				:type="validateType('rights')"
				:message="validateMsg('rights')"
			>
				<MultiSelect
					v-model="formModel.rights"
					searchable
					label="value"
					track-by="code"
					placeholder="Click to select..."
					:disabled="formDisabled"
					:options="options.rights"
					:class="validateMultiselect('rights')"
					@select="onRightsSelect"
				/>
			</b-field>

			<b-field
				v-show="!formModel.disabledProject"
				label="Project"
				:type="validateType('projects')"
				:message="validateMsg('projects')"
			>
				<MultiSelect
					v-model="formModel.projects"
					searchable
					label="name"
					track-by="id"
					placeholder="Click to select..."
					:multiple="true"
					:disabled="formDisabled || formModel.disabledProject"
					:options="options.projects"
					:class="validateMultiselect('projects')"
					@select="validate('projects')"
				/>
			</b-field>

			<b-field
				v-show="!formModel.disabledCountry"
				label="Country"
				:type="validateType('countries')"
				:message="validateMsg('countries')"
			>
				<MultiSelect
					v-model="formModel.countries"
					searchable
					label="name"
					track-by="iso3"
					placeholder="Click to select..."
					:multiple="!onlyOneCountry"
					:disabled="formDisabled || formModel.disabledCountry"
					:options="options.countries"
					:class="validateMultiselect('countries')"
					@select="validate('countries')"
				/>
				<small v-if="onlyOneCountry" class="ml-2">
					<strong>You can select only one country</strong>
				</small>
			</b-field>

			<b-field
				v-if="!formDisabled"
				label="Update Password On Next Login"
			>
				<b-checkbox v-model="formModel.updatePasswordOnNextLogin" />
			</b-field>

			<b-field>
				<template #label>
					Prefix<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<MultiSelect
					v-model="formModel.prefix"
					searchable
					placeholder="Phone Ext"
					label="value"
					track-by="code"
					:disabled="formDisabled"
					:options="options.phonePrefixes"
					:class="validateMultiselect('prefix')"
					@select="validate('prefix')"
				/>
			</b-field>

			<b-field>
				<template #label>
					Phone Number
					<span class="optional-text has-text-weight-normal is-italic"> - Optional</span>
				</template>
				<b-input
					v-model="formModel.phoneNumber"
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
import MyOrganizationsService from "@/services/MyOrganizationsService";
import LocationsService from "@/services/LocationsService";
import ProjectsService from "@/services/ProjectsService";
import { Notification } from "@/utils/UI";
import PhoneCodes from "@/utils/phoneCodes";
import Validation from "@/mixins/validation";

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
			email: { required, email },
			password: { required },
			rights: { required },
			organization: { required },
			projects: { required: requiredIf((form) => !form.disabledProject) },
			countries: { required: requiredIf((form) => !form.disabledCountry) },
			phoneNumber: {},
			prefix: {},
			updatePasswordOnNextLogin: {},
		},
	},

	data() {
		return {
			options: {
				// TODO fix after implementing real api or roleService or something like that
				rights: [
					{
						code: 0,
						value: "Administrator",
					},
					{
						code: 1,
						value: "Field Officer",
					},
					{
						code: 2,
						value: "Project Officer",
					},
					{
						code: 3,
						value: "Project Manager",
					},
					{
						value: "Country Manager",
						code: 4,
					},
					{
						value: "Regional Manager",
						code: 5,
					},
					{
						value: "Enumerator",
						code: 6,
					},
				],
				projects: [],
				countries: [],
				organizations: [],
				phonePrefixes: PhoneCodes,
			},
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

		onRightsSelect({ code }) {
			this.validate("rights");
			if (code === 1 || code === 2 || code === 3 || code === 6) {
				this.fetchProjects();
				this.formModel.disabledProject = false;
				this.formModel.disabledCountry = true;
			} else if (code === 4 || code === 5) {
				this.onlyOneCountry = (code === 4);
				this.fetchCountries();
				this.formModel.disabledProject = true;
				this.formModel.disabledCountry = false;
			}
		},

		async fetchProjects() {
			await ProjectsService.getListOfProjects(1, 15, "desc")
				.then(({ data }) => {
					this.options.projects = data;
				}).catch((e) => {
					Notification(`Projects ${e}`, "is-danger");
				});
		},

		async fetchCountries() {
			await LocationsService.getListOfCountries()
				.then(({ data }) => {
					this.options.countries = data;
				}).catch((e) => {
					Notification(`Countries ${e}`, "is-danger");
				});
		},

		async fetchOrganizations() {
			await MyOrganizationsService.getListOfMyOrganizations()
				.then(({ data }) => {
					this.options.organizations = data;
				}).catch((e) => {
					Notification(`Organizations ${e}`, "is-danger");
				});
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

	},
};
</script>
