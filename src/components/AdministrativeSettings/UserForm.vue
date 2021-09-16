<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				:label="$t('Email')"
				:type="validateType('email')"
			>
				<b-input
					v-model="formModel.email"
					type="email"
					:disabled="formDisabled || isEditing"
					@blur="validate('email')"
				/>
			</b-field>

			<b-field
				:label="$t('Password')"
				:type="validateType('password')"
				:message="passwordMessage()"
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
				:label="$t('Rights')"
				:type="validateType('rights')"
				:message="validateMsg('rights')"
			>
				<MultiSelect
					v-model="formModel.rights"
					searchable
					label="name"
					track-by="code"
					:placeholder="$t('Click to select')"
					:disabled="formDisabled"
					:options="options.rights"
					:loading="rolesLoading"
					:class="validateMultiselect('rights')"
					@select="onRightsSelect"
				/>
			</b-field>

			<b-field
				v-show="!formModel.disabledProject"
				:label="$t('Project')"
				:type="validateType('projectIds')"
				:message="validateMsg('projectIds')"
			>
				<MultiSelect
					v-model="formModel.projectIds"
					searchable
					multiple
					label="name"
					track-by="id"
					:placeholder="$t('Click to select')"
					:disabled="formDisabled || formModel.disabledProject"
					:loading="projectsLoading"
					:options="options.projects"
					:class="validateMultiselect('projectIds')"
					@select="validate('projectIds')"
				/>
			</b-field>

			<b-field
				v-show="!formModel.disabledCountry"
				:label="$t('Country')"
				:type="validateType('countries')"
				:message="validateMsg('countries')"
			>
				<MultiSelect
					v-model="formModel.countries"
					searchable
					label="name"
					track-by="iso3"
					:placeholder="$t('Click to select')"
					:multiple="!onlyOneCountry"
					:disabled="formDisabled || formModel.disabledCountry"
					:options="options.countries"
					:loading="countriesLoading"
					:class="validateMultiselect('countries')"
					@select="validate('countries')"
				/>
				<small v-if="onlyOneCountry" class="ml-2">
					<strong>{{ $t('You can select only one country') }}</strong>
				</small>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Language') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<MultiSelect
					v-model="formModel.language"
					searchable
					label="name"
					track-by="key"
					:placeholder="$t('Click to select')"
					:disabled="formDisabled"
					:options="options.languages"
				/>
			</b-field>

			<b-field
				v-if="!formDisabled"
				:label="$t('Update password on next login')"
			>
				<b-checkbox v-model="formModel.updatePasswordOnNextLogin" />
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Prefix') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<MultiSelect
					v-model="formModel.phonePrefix"
					searchable
					:placeholder="$t('Phone Ext')"
					label="value"
					track-by="code"
					:disabled="formDisabled"
					:options="options.phonePrefixes"
					:class="validateMultiselect('phonePrefix')"
					@select="validate('phonePrefix')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Phone Number') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.phoneNumber"
					:disabled="formDisabled"
					@blur="validate('phoneNumber')"
				/>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="!formDisabled"
				class="is-primary"
				native-type="submit"
				:disabled="mapping"
			>{{ submitButtonLabel }}</b-button>
		</footer>
	</form>
</template>

<script>
import { mapState } from "vuex";
import { required, requiredIf, email } from "vuelidate/lib/validators";
import CountriesService from "@/services/CountriesService";
import ProjectService from "@/services/ProjectService";
import { Notification } from "@/utils/UI";
import PhoneCodes from "@/utils/phoneCodes";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import Validation from "@/mixins/validation";
import roles from "@/utils/roleConst";
import SystemService from "@/services/SystemService";
import UsersService from "@/services/UsersService";

const passwordRegexp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/);

const passwordValidation = (value) => (value ? passwordRegexp.test(value) : true);

export default {
	name: "userForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		isEditing: Boolean,
	},

	validations: {
		formModel: {
			email: { required, email },
			password: {
				// eslint-disable-next-line func-names
				required: requiredIf(function () {
					return !this.isEditing;
				}),
				passwordValidation,
			},
			rights: { required },
			language: {},
			projectIds: { required: requiredIf((form) => !form.disabledProject) },
			countries: { required: requiredIf((form) => !form.disabledCountry) },
			phoneNumber: {},
			phonePrefix: {},
			updatePasswordOnNextLogin: {},
		},
	},

	data() {
		return {
			options: {
				rights: [],
				projects: [],
				countries: [],
				phonePrefixes: PhoneCodes,
				languages: [],
			},
			mapping: true,
			countriesLoading: true,
			projectsLoading: true,
			rolesLoading: true,
			onlyOneCountry: false,
		};
	},

	computed: {
		...mapState(["languages"]),
	},

	async mounted() {
		await Promise.all([
			this.fetchRoles(),
			this.fetchProjects(),
			this.fetchCountries(),
		]);
		this.loadLanguages();
		this.mapSelects();
		this.mapping = false;
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

		onRightsSelect(right) {
			this.validate("rights");
			this.mapRights(right);
		},

		mapRights({ code }) {
			if (code === roles.FIELD_OFFICER
				|| code === roles.PROJECT_OFFICER
				|| code === roles.PROJECT_MANAGER
				|| code === roles.ENUMERATOR) {
				this.formModel.disabledProject = false;
				this.formModel.disabledCountry = true;
			} else if (code === roles.COUNTRY_MANAGER || code === roles.REGIONAL_MANAGER) {
				this.onlyOneCountry = (code === roles.COUNTRY_MANAGER);
				this.formModel.disabledProject = true;
				this.formModel.disabledCountry = false;
			} else {
				this.formModel.disabledCountry = true;
				this.formModel.disabledProject = true;
			}
		},

		loadLanguages() {
			this.options.languages = this.languages;
		},

		async fetchProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.options.projects = data;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});

			if (this.formModel.id) {
				await UsersService.getListOfUsersProjects(this.formModel.id).then(({ data }) => {
					this.options.projects = [...this.options.projects, ...data];
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});
			}

			this.formModel.projectIds = getArrayOfCodeListByKey(this.formModel.projectIds, this.options.projects, "id");
			this.projectsLoading = false;
		},

		async fetchRoles() {
			await SystemService.getRoles()
				.then(({ data }) => {
					this.options.rights = data;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Roles")} ${e}`, "is-danger");
				});
			this.formModel.rights = getArrayOfCodeListByKey(this.formModel.roles, this.options.rights, "code");
			this.rolesLoading = false;
		},

		async fetchCountries() {
			await CountriesService.getListOfCountries()
				.then(({ data }) => {
					this.options.countries = data;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Countries")} ${e}`, "is-danger");
				});

			this.formModel.countries = getArrayOfCodeListByKey(this.formModel.countries, this.options.countries, "iso3");
			this.countriesLoading = false;
		},

		mapSelects() {
			if (typeof this.formModel.phonePrefix !== "object") {
				this.formModel.phonePrefix = getArrayOfCodeListByKey([this.formModel.phonePrefix], this.options.phonePrefixes, "code");
			}
			if (typeof this.formModel.language !== "object") {
				this.formModel.language = getArrayOfCodeListByKey([this.formModel.language], this.options.languages, "key");
			}
			this.mapRights(this.formModel.rights);
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

		passwordMessage() {
			if (this.$v.formModel.password.$dirty) {
				if (!this.$v.formModel.password.required) {
					return this.$t("Required");
				}
				if (!this.$v.formModel.password.passwordValidation) {
					return this.$t("The Password Is Not Strong Enough... Minimum Required = 8 Characters, 1 Lowercase, 1 Uppercase, 1 Numeric");
				}
			}
			return "";
		},
	},
};
</script>
