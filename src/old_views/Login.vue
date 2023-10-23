<template>
	<section class="hero is-primary is-fullheight">
		<div class="hero-body">
			<div class="container">
				<div class="columns is-centered">
					<div class="column is-5-tablet is-4-desktop is-3-widescreen">
						<form class="box" @submit.prevent="submitForm">
							<div class="logo mb-4">
								<img src="@/assets/images/bms_logo_with_title.png" alt="">
							</div>

							<h1 class="title is-6 has-text-centered mb-4">Beneficiary Management System</h1>

							<div class="has-text-light has-text-centered mb-4">
								<span v-if="gitInfo.appVersion !== '__APP_VERSION__'">
									{{ gitInfo.appVersion }}
								</span>
							</div>

							<b-field
								:label="$t('Username')"
								label-position="inside"
								:type="validateType('username')"
								:message="validateMsg('username', 'Required')"
							>
								<b-input
									v-model="formModel.username"
									autofocus
									@blur="validate('username')"
								/>
							</b-field>

							<b-field
								:label="$t('Password')"
								label-position="inside"
								:type="validateType('password')"
								:message="validateMsg('password', 'Required')"
							>
								<b-input
									type="password"
									v-model="formModel.password"
									password-reveal
									@blur="validate('password')"
								/>
							</b-field>

							<b-field grouped position="is-centered">
								<b-button
									type="is-primary"
									native-type="submit"
									:loading="loginButtonLoading"
								>
									<span :class="{ 'is-invisible': loginButtonLoading }">
										{{ $t('Login') }}
									</span>
								</b-button>
							</b-field>
						</form>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { required } from "vuelidate/lib/validators";
import CountriesService from "@/services/CountriesService";
import LoginService from "@/services/LoginService";
import TranslationService from "@/services/TranslationService";
import UsersService from "@/services/UsersService";
import validation from "@/mixins/validation";
import { setCookie } from "@/utils/cookie";
import { Notification } from "@/utils/UI";
import { GENERAL } from "@/consts";
import gitInfo from "@/gitInfo";
import JWTDecode from "jwt-decode";

export default {
	name: "Login",

	mixins: [validation],

	validations: {
		formModel: {
			username: {
				required,
			},
			password: {
				required,
			},
		},
	},

	data() {
		return {
			gitInfo,
			formModel: {
				username: "",
				password: "",
			},
			loginButtonLoading: false,
		};
	},

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
		document.documentElement.classList.add("layout-center");
	},

	mounted() {
		this.urlLogin();

		this.$store.commit("fullPage", true);
	},

	beforeDestroy() {
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
			if (process.env.VUE_APP_ENV === "prod") return;

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
			this.$v.$touch();
			if (this.$v.$invalid) return;

			this.loginButtonLoading = true;

			const lastLoggedUsername = this.user.username || this.lastUsername;

			await LoginService.logUserIn(this.formModel).then(async (response) => {
				if (response.status === 200) {
					const { data: { token, userId } } = response;

					const user = await JWTDecode(token);
					user.userId = userId;

					await setCookie("token", token, user.exp - user.iat);

					await this.storeUser(user);

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

					const countries = await this.fetchUsersCountries(userId);

					if (countries.length) {
						await this.storeCountries(countries);

						if (lastLoggedUsername === user.username) {
							await this.storeCountry(this.country);
						} else {
							await this.storeCountry(countries[0]);
						}
					}

					const { data: { privileges } } = user.roles[0]
						? await LoginService.getRolePermissions(user.roles[0]) : {}
							.then(({ data }) => data);

					await this.storePermissions(privileges);

					if (countries.length) {
						if (this.$route.query.redirect) {
							this.$router.push(this.$route.query.redirect.toString());
						} else {
							this.$router.push({
								name: "Projects",
								params: {
									countryCode: this.country?.iso3 || countries[0].iso3,
								},
							});
						}
					} else {
						Notification(`${this.$t("No Countries")}`, "is-warning");
					}
				}
			}).catch((e) => {
				Notification(`${e} ${this.$t("Invalid Credentials")}`, "is-danger");
				this.$v.$reset();
			});

			this.loginButtonLoading = false;
		},

		fetchUsersCountries(userId) {
			return CountriesService.getListOfUsersCountries(userId)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Countries")} ${e}`, "is-danger");
				});
		},

		async setLocales(languageKey) {
			if (!this.translations || languageKey !== this.language.key) {
				await TranslationService.getTranslations(languageKey).then((response) => {
					if (response.status === 200) {
						this.storeTranslations(response.data);
						this.$i18n.locale = languageKey;
						this.$i18n.fallbackLocale = languageKey;
						this.$root.$i18n.setLocaleMessage(languageKey, response.data);
					}
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Translations")} ${e}`, "is-danger");
				});
			} else {
				this.$i18n.locale = languageKey;
				this.$i18n.fallbackLocale = languageKey;
				this.$root.$i18n.setLocaleMessage(languageKey, this.translations);
			}
		},
	},
};
</script>

<style scoped>
.hero {
	background-image: url(~@/assets/images/login_page.jpg);
	background-repeat: no-repeat;
	background-size: cover;
}

.box {
	margin: 0 -5rem;
	padding: 2.5rem 5rem;
	background-color: rgba(161, 160 ,160, .85);
}

.logo {
	margin: 0 auto;
	width: 150px;
	height: 150px;
	background-color: #f1f1fb;
	border-radius: 100px;
}
</style>
