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
								label="Username"
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
								label="Password"
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
									<span :class="{ 'is-invisible': loginButtonLoading }">Login</span>
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
import JWTDecode from "jwt-decode";
import { required } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";
import LoginService from "@/services/LoginService";
import { Notification } from "@/utils/UI";
import gitInfo from "@/gitInfo";
import UsersService from "@/services/UsersService";
import CONST from "@/const";
import TranslationService from "@/services/TranslationService";

export default {
	name: "Login",

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

	mixins: [Validation],

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

	mounted() {
		this.$store.commit("fullPage", true);
	},

	beforeCreate() {
		document.documentElement.classList.add("layout-center");
	},

	beforeDestroy() {
		this.$store.commit("fullPage", false);
	},

	computed: {
		...mapState([
			"languages",
			"language",
			"translations",
		]),
	},

	methods: {
		...mapActions(["storeUser", "storePermissions", "storeLanguage", "appLoading", "storeTranslations"]),

		async submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) return;

			this.loginButtonLoading = true;

			await LoginService.logUserIn(this.formModel).then(async (response) => {
				if (response.status === 200) {
					const { data: { token } } = response;

					const user = await JWTDecode(token);
					user.token = token;

					await this.storeUser(user);

					const userDetail = await UsersService.getDetailOfUser(181);
					userDetail.language = "ru";

					const language = this.languages.find(({ key }) => key === userDetail.language)
						|| CONST.DEFAULT_LANGUAGE;

					await this.setLocales(language.key);
					await this.storeLanguage(language);

					const { data: { privileges } } = user.roles[0]
						? await LoginService.getRolePermissions(user.roles[0]) : {}
							.then(({ data }) => data);

					await this.storePermissions(privileges);

					this.$router.push(this.$route.query.redirect?.toString() || "/");
				}
			}).catch((e) => {
				Notification(`${e} ${this.$t("Invalid Credentials")}`, "is-danger");
				this.$v.$reset();
			});

			this.loginButtonLoading = false;
		},

		async setLocales(languageKey) {
			if (!this.translations || languageKey !== this.language.key) {
				this.appLoading(true);

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

				this.appLoading(false);
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

.logo{
	margin: 0 auto;
	width: 150px;
	height: 150px;
	background-color: #f1f1fb;
	border-radius: 100px;
}
</style>
