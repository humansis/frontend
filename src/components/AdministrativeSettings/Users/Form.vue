<template>
	<v-card-text>
		<DataInput
			v-model="formModel.email"
			:disabled="formDisabled || isEditing"
			:error-messages="validationMsg('email')"
			label="Email"
			name="email"
			type="email"
			class="mb-6"
			@update:modelValue="onValidate('email')"
		/>

		<DataInput
			v-model="formModel.password"
			:disabled="formDisabled"
			:error-messages="validationMsg('password')"
			label="Password"
			name="password"
			type="password"
			class="mb-6"
			@blur="onValidate('password')"
		/>

		<DataInput
			v-model="formModel.firstName"
			:disabled="formDisabled"
			:error-messages="validationMsg('firstName')"
			label="First name"
			name="first-name"
			class="mb-6"
			@update:modelValue="onValidate('firstName')"
		/>

		<DataInput
			v-model="formModel.lastName"
			:disabled="formDisabled"
			:error-messages="validationMsg('lastName')"
			label="Surname"
			name="surname"
			class="mb-6"
			@update:modelValue="onValidate('lastName')"
		/>

		<DataInput
			v-model="formModel.position"
			:disabled="formDisabled"
			:error-messages="validationMsg('position')"
			label="Position"
			name="position"
			class="mb-6"
			@update:modelValue="onValidate('position')"
		/>

		<DataSelect
			v-model="formModel.rights"
			:items="options.rights"
			:loading="rolesLoading"
			:disabled="formDisabled"
			:error-messages="validationMsg('rights')"
			label="Rights"
			name="rights"
			item-title="name"
			class="mb-6"
			is-search-enabled
			@update:modelValue="onRightsSelect"
		/>

		<DataSelect
			v-show="!formModel.disabledProject"
			v-model="formModel.projectIds"
			:items="options.projects"
			:loading="projectsLoading"
			:disabled="formDisabled || formModel.disabledProject"
			:error-messages="validationMsg('projectIds')"
			label="Project"
			name="project"
			item-title="name"
			item-value="id"
			class="mb-6"
			is-search-enabled
			is-data-shown-as-tag
			multiple
			@update:modelValue="onValidate('projectIds')"
		/>

		<DataSelect
			v-show="!formModel.disabledCountry"
			v-model="formModel.countries"
			:items="options.countries"
			:loading="countriesLoading"
			:disabled="formDisabled || formModel.disabledCountry"
			:multiple="!isOnlyOneCountry"
			:hint="isOnlyOneCountry && 'You can select only one country'"
			:persistent-hint="isOnlyOneCountry"
			:error-messages="validationMsg('countries')"
			label="Country"
			name="country"
			item-title="name"
			item-value="iso3"
			class="mb-6"
			is-search-enabled
			@update:modelValue="onValidate('countries')"
		/>

		<DataSelect
			v-model="formModel.language"
			:items="options.languages"
			:disabled="formDisabled"
			:class="{ 'mb-6': formDisabled }"
			label="Language"
			name="language"
			item-title="name"
			item-value="key"
			is-search-enabled
			optional
		/>

		<v-checkbox
			v-if="!formDisabled"
			v-model="formModel.updatePasswordOnNextLogin"
			:label="$t('Update password on next login')"
			hide-details
			class="checkbox"
		/>

		<DataSelect
			v-model="formModel.phonePrefix"
			:items="options.phonePrefixes"
			:disabled="formDisabled"
			label="Prefix"
			name="prefix"
			class="mb-6"
			is-search-enabled
			optional
		/>

		<DataInput
			v-model="formModel.phoneNumber"
			:disabled="formDisabled"
			label="Phone Number"
			name="phone-number"
			class="mb-6"
			optional
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			v-if="closeButton"
			class="text-none"
			size="small"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="!formDisabled"
			:disabled="mapping"
			color="primary"
			size="small"
			class="text-none ml-3"
			variant="elevated"
			@click="onSubmitForm"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import { mapState } from "vuex";
import CountriesService from "@/services/CountriesService";
import ProjectService from "@/services/ProjectService";
import SystemService from "@/services/SystemService";
import UsersService from "@/services/UsersService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { Notification } from "@/utils/UI";
import { PHONE, ROLE } from "@/consts";
import { email, required, requiredIf } from "@vuelidate/validators";

const passwordRegexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
const passwordValidation = (value) => (!value || passwordRegexp.test(value));

export default {
	name: "userForm",

	components: {
		DataInput,
		DataSelect,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				email: { required, email },
				firstName: { required },
				lastName: { required },
				position: { required },
				password: {
					required: requiredIf(!this.isEditing),
					passwordValidation,
				},
				rights: { required },
				projectIds: { required: requiredIf(!this.formModel.disabledProject) },
				countries: { required: requiredIf(!this.formModel.disabledCountry) },
			},
		};
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		isEditing: Boolean,
	},

	data() {
		return {
			options: {
				rights: [],
				projects: [],
				countries: [],
				phonePrefixes: PHONE.CODES,
				languages: [],
			},
			mapping: true,
			countriesLoading: true,
			projectsLoading: true,
			rolesLoading: true,
			isOnlyOneCountry: false,
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
		onSubmitForm() {
			this.v$.$touch();
			if (this.v$.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.v$.$reset();
		},

		onRightsSelect(right) {
			this.onValidate("rights");
			this.mapRights(right);
		},

		mapRights({ code }) {
			if (code === ROLE.FIELD_OFFICER
				|| code === ROLE.PROJECT_OFFICER
				|| code === ROLE.PROJECT_MANAGER
				|| code === ROLE.ENUMERATOR) {
				this.formModel.disabledProject = false;
				this.formModel.disabledCountry = true;
			} else if (code === ROLE.COUNTRY_MANAGER || code === ROLE.REGIONAL_MANAGER) {
				this.isOnlyOneCountry = (code === ROLE.COUNTRY_MANAGER);
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
			if (!this.formDisabled) {
				await ProjectService.getListOfProjects()
					.then(({ data }) => {
						this.options.projects = data;
					}).catch((e) => {
						Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
					});
			}

			if (this.formModel.id) {
				await UsersService.getListOfUsersProjects(this.formModel.id).then(({ data }) => {
					this.options.projects = [...this.options.projects, ...data];
				}).catch((e) => {
					Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
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
					Notification(`${this.$t("Roles")} ${e.message || e}`, "error");
				});
			this.formModel.rights = getArrayOfCodeListByKey(this.formModel.roles, this.options.rights, "code");
			this.rolesLoading = false;
		},

		async fetchCountries() {
			await CountriesService.getListOfCountries()
				.then(({ data }) => {
					this.options.countries = data;
				}).catch((e) => {
					Notification(`${this.$t("Countries")} ${e.message || e}`, "error");
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

		onCloseForm() {
			this.$emit("formClosed");
			this.v$.$reset();
		},

		passwordMessage() {
			if (this.v$.formModel.password.$dirty) {
				if (!this.v$.formModel.password.required) {
					return this.$t("Required");
				}
				if (!this.v$.formModel.password.passwordValidation) {
					return this.$t("The Password Is Not Strong Enough... Minimum Required = 8 Characters, 1 Lowercase, 1 Uppercase, 1 Numeric");
				}
			}
			return "";
		},
	},
};
</script>
