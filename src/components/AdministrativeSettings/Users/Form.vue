<template>
	<v-card-text>
		<DataInput
			v-model="formModel.email"
			:disabled="formDisabled || isEditing"
			:error-messages="validationMsg('email')"
			label="Email"
			name="email"
			type="email"
			class="mb-4"
			@update:modelValue="onValidate('email')"
		/>

		<DataInput
			v-model="formModel.firstName"
			:disabled="formDisabled"
			:error-messages="validationMsg('firstName')"
			label="First name"
			name="first-name"
			class="mb-4"
			@update:modelValue="onValidate('firstName')"
		/>

		<DataInput
			v-model="formModel.lastName"
			:disabled="formDisabled"
			:error-messages="validationMsg('lastName')"
			label="Surname"
			name="surname"
			class="mb-4"
			@update:modelValue="onValidate('lastName')"
		/>

		<DataInput
			v-model="formModel.position"
			:disabled="formDisabled"
			:error-messages="validationMsg('position')"
			label="Position"
			name="position"
			class="mb-4"
			@update:modelValue="onValidate('position')"
		/>

		<DataSelect
			v-model="formModel.rights"
			:items="options.rights"
			:loading="loading.isRoles"
			:disabled="formDisabled"
			:error-messages="validationMsg('rights')"
			label="Rights"
			name="rights"
			item-title="name"
			class="mb-4"
			@update:modelValue="onRightsSelect"
		/>

		<DataSelect
			v-show="!formModel.disabledProject"
			v-model="formModel.projectIds"
			:items="options.projects"
			:loading="loading.isProjects"
			:disabled="formDisabled || formModel.disabledProject"
			:error-messages="validationMsg('projectIds')"
			label="Project"
			name="project"
			item-title="name"
			item-value="id"
			class="mb-4"
			multiple
			@update:modelValue="onValidate('projectIds')"
		/>

		<DataSelect
			v-show="!formModel.disabledCountry"
			v-model="formModel.countries"
			:items="options.countries"
			:loading="loading.isCountries"
			:disabled="formDisabled || formModel.disabledCountry"
			:multiple="!isOnlyOneCountry"
			:hint="countryHint"
			:persistent-hint="isOnlyOneCountry"
			:error-messages="validationMsg('countries')"
			label="Country"
			name="country"
			item-title="name"
			item-value="iso3"
			class="mb-4"
			@update:modelValue="onValidate('countries')"
		/>

		<DataSelect
			v-model="formModel.language"
			:items="options.languages"
			:disabled="formDisabled"
			label="Language"
			name="language"
			item-title="name"
			item-value="key"
			class="mb-4"
			optional
		/>

		<DataSelect
			v-model="formModel.phonePrefix"
			:items="options.phonePrefixes"
			:disabled="formDisabled"
			label="Prefix"
			name="prefix"
			class="mb-4"
			optional
		/>

		<DataInput
			v-model="formModel.phoneNumber"
			:disabled="formDisabled"
			label="Phone Number"
			name="phone-number"
			class="mb-4"
			optional
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			v-if="closeButton"
			class="text-none"
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
import { email, required, requiredIf } from "@vuelidate/validators";
import CountriesService from "@/services/CountriesService";
import ProjectService from "@/services/ProjectService";
import SystemService from "@/services/SystemService";
import UsersService from "@/services/UsersService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { PHONE, ROLE } from "@/consts";

export default {
	name: "userForm",

	emits: ["formSubmitted", "formClosed"],

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
				rights: { required },
				projectIds: { required: requiredIf(!this.formModel.disabledProject) },
				countries: { required: requiredIf(!this.formModel.disabledCountry) },
			},
		};
	},

	props: {
		closeButton: Boolean,
		formDisabled: Boolean,
		isEditing: Boolean,

		formModel: {
			type: Object,
			required: true,
		},

		submitButtonLabel: {
			type: String,
			required: true,
		},
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
			loading: {
				isCountries: false,
				isProjects: false,
				isRoles: false,
			},
			isOnlyOneCountry: false,
		};
	},

	computed: {
		...mapState(["languages"]),

		countryHint() {
			return this.isOnlyOneCountry
				? "You can select only one country"
				: "";
		},
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
			this.loading.isProjects = true;

			if (!this.formDisabled) {
				try {
					const {
						data: { data },
						status,
						message,
					} = await ProjectService.getListOfProjects({});

					checkResponseStatus(status, message);

					this.options.projects = data;

					this.formModel.projectIds = getArrayOfCodeListByKey(this.formModel.projectIds, data, "id");
				} catch (e) {
					Notification(`${this.$t("Projects")}: ${e.message || e}`, "error");
				}
			} else if (this.formModel.id) {
				try {
					const {
						data: { data },
						status,
						message,
					} = await UsersService.getListOfUsersProjects(this.formModel.id);

					checkResponseStatus(status, message);

					this.formModel.projectIds = data;
				} catch (e) {
					Notification(`${this.$t("Projects")}: ${e.message || e}`, "error");
				}
			}

			this.loading.isProjects = false;
		},

		async fetchRoles() {
			try {
				this.loading.isRoles = true;

				const {
					data: { data },
					status,
					message,
				} = await SystemService.getRoles();

				checkResponseStatus(status, message);

				this.options.rights = data;
			} catch (e) {
				Notification(`${this.$t("Roles")}: ${e.message || e}`, "error");
			} finally {
				this.formModel.rights = getArrayOfCodeListByKey(this.formModel.roles, this.options.rights, "code");
				this.loading.isRoles = false;
			}
		},

		async fetchCountries() {
			try {
				this.loading.isCountries = true;

				const {
					data: { data },
					status,
					message,
				} = await CountriesService.getListOfCountries();

				checkResponseStatus(status, message);

				this.options.countries = data;
				this.formModel.countries = getArrayOfCodeListByKey(this.formModel.countries, this.options.countries, "iso3");
			} catch (e) {
				Notification(`${this.$t("Countries")}: ${e.message || e}`, "error");
			} finally {
				this.loading.isCountries = false;
			}
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
	},
};
</script>
