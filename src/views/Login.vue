<template>
	<v-container fluid class="hero fill-height">
		<v-row>
			<v-col class="d-flex justify-center">
				<v-card class="mx-auto px-6 py-8 login-box" max-width="600" width="100%">
					<div class="logo">
						<img src="@/assets/images/bms_logo_with_title.png" alt="humansis">
					</div>

					<h1 class="text-subtitle-1 text-center text-white mt-5 mb-5">Beneficiary Management System</h1>

					<div
						v-if="gitInfo.appVersion !== '__APP_VERSION__'"
						class="text-subtitle-2 font-italic text-center text-white mb-5"
					>
						{{ gitInfo.appVersion }}
					</div>

					<v-form @submit.prevent="submitForm">
						<v-text-field
							v-model="v$.formModel.username.$model"
							label="Email"
							name="email"
							type="email"
							placeholder="Enter your email"
							bg-color="white"
							class="mx-12"
							:error-messages="v$.formModel.username.$errors.map(e => e.$message)"
						/>

						<v-text-field
							v-model="v$.formModel.password.$model"
							label="Password"
							name="password"
							placeholder="Enter your password"
							bg-color="white"
							class="mx-12"
							:append-inner-icon="passwordVisible ? 'eye-slash' : 'eye'"
							:type="passwordVisible ? 'text' : 'password'"
							:error-messages="v$.formModel.password.$errors.map(e => e.$message)"
							@click:append-inner="passwordVisible = !passwordVisible"
						/>

						<div class="text-center">
							<v-btn
								color="primary"
								type="submit"
								class="text-center"
							>
								{{ $t("login") }}
							</v-btn>
						</div>
					</v-form>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import CountriesService from "@/services/CountriesService";
import LoginService from "@/services/LoginService";
import TranslationService from "@/services/TranslationService";
import UsersService from "@/services/UsersService";
import { setCookie } from "@/utils/cookie";
import { Notification } from "@/utils/UI";
import { GENERAL, ROLE } from "@/consts";
import gitInfo from "@/gitInfo";
import { useVuelidate } from "@vuelidate/core";
import { email, required } from "@vuelidate/validators";
import { jwtDecode } from "jwt-decode";

export default {
	name: "LoginPage",

	validations() {
		return {
			formModel: {
				username: { required, email },
				password: { required },
			},
		};
	},

	data() {
		return {
			gitInfo,
			passwordVisible: false,
			formModel: {
				username: "",
				password: "",
			},
			loginButtonLoading: false,
		};
	},

	setup: () => ({ v$: useVuelidate() }),

	computed: {
		...mapState([
			"user",
			"lastUsername",
			"languages",
			"language",
			"country",
			"translations",
		]),
	},

	beforeCreate() {
		// TODO it is necessary?
		document.documentElement.classList.add("layout-center");
	},

	mounted() {
		this.urlLogin();

		this.$store.commit("fullPage", true);
	},

	beforeUnmount() {
		this.$store.commit("fullPage", false);
	},

	methods: {
		...mapActions([
			"storeUser",
			"updateStoredUser",
			"storePermissions",
			"storeLanguage",
			"storeTranslations",
			"storeCountries",
			"storeCountry",
			"storeAvailableProjects",
		]),

		urlLogin() {
			if (import.meta.env.VITE_APP_ENV === "prod") return;

			const { username, password } = this.$route.query;

			if (username && password) {
				this.formModel = {
					username,
					password,
				};

				this.submitForm();
			}
		},

		async submitForm() {
			const isFormCorrect = await this.v$.$validate();
			if (!isFormCorrect) return;

			try {
				this.loginButtonLoading = true;

				const lastLoggedUsername = this.user.username || this.lastUsername;

				const { data, status, message } = await LoginService.logUserIn(this.formModel);

				if (status !== 200) {
					throw new Error(message);
				}

				const { token, userId } = data;

				const user = await jwtDecode(token);
				user.userId = userId;

				await setCookie("token", token, user.exp - user.iat);

				await this.storeUser(user);

				if (user.roles[0] === ROLE.GUEST) {
					await this.$router.push({ name: "AccountCreated" });
					return;
				}

				const { data: userDetail } = await UsersService.getDetailOfUser(userId);

				this.updateStoredUser({
					attribute: "changePassword",
					value: userDetail.changePassword,
				});

				await this.storeAvailableProjects(userDetail.projectIds);

				const language = this.languages.find(({ key }) => key === userDetail?.language)
					|| GENERAL.DEFAULT_LANGUAGE;

				if (lastLoggedUsername === user.username) {
					await this.setLocales(this.language.key);
				} else {
					await this.setLocales(language.key);
				}

				if (lastLoggedUsername === user.username) {
					await this.storeLanguage(this.language);
				} else {
					await this.storeLanguage(language);
				}

				const { data: countries } = await CountriesService.getListOfUsersCountries(userId);

				if (countries.length) {
					await this.storeCountries(countries);

					if (lastLoggedUsername === user.username) {
						await this.storeCountry(this.country);
					} else {
						await this.storeCountry(countries[0]);
					}
				}

				let rolePrivileges = [];

				if (user.roles[0]) {
					const { data: { privileges } } = await LoginService.getRolePermissions(user.roles[0]);
					rolePrivileges = privileges;
				}

				await this.storePermissions(rolePrivileges);

				if (countries.length) {
					if (this.$route.query.redirect) {
						this.$router.push(this.$route.query.redirect.toString());
					} else {
						this.$router.push({
							name: "Home",
							params: {
								countryCode: this.country?.iso3 || countries[0].iso3,
							},
						});
					}
				} else {
					Notification(this.$t("No Countries"), "warning");
				}
			} catch (e) {
				Notification(`${this.$t("Login")} ${e}`, "error");
			} finally {
				this.loginButtonLoading = false;
			}
		},

		async setLocales(languageKey) {
			if (!this.translations || languageKey !== this.language.key) {
				try {
					const { data, status, message } = await TranslationService.getTranslations(languageKey);

					if (status !== 200) {
						throw new Error(message);
					}

					this.storeTranslations(data);
					this.$i18n.locale = languageKey;
					this.$i18n.fallbackLocale = languageKey;
					this.$root.$i18n.setLocaleMessage(languageKey, data);
				} catch (e) {
					if (e.message) Notification(`${this.$t("Translations")} ${e}`, "warning");
				}
			} else {
				this.$i18n.locale = languageKey;
				this.$i18n.fallbackLocale = languageKey;
				this.$root.$i18n.setLocaleMessage(languageKey, this.translations);
			}
		},
	},
};
</script>

<style scoped lang="scss">
.hero {
	background-image: url(@/assets/images/login_page.jpg);
	background-repeat: no-repeat;
	background-size: cover;
	min-height: 100vh;

	.logo {
		margin: 0 auto;
		width: 150px;
		height: 150px;
		background-color: #f1f1fb;
		border-radius: 100px;
	}

	.login-box {
		background-color: rgba(161,160,160,.85);
	}
}

</style>
