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
								<span v-if="gitinfo.appVersion !== '__APP_VERSION__'">
									{{ gitinfo.appVersion }}
								</span>
								-
								<span v-if="gitinfo.hash !== '__COMMIT_HASH__'">
									{{ gitinfo.hash }}
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
import { mapState, mapActions } from "vuex";
import JWTDecode from "jwt-decode";
import { required } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";
import LoginService from "@/services/LoginService";
import { Notification } from "@/utils/UI";
import gitinfo from "@/gitinfo";

export default {
	name: "Login",

	data() {
		return {
			gitinfo,
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

	computed: {
		...mapState({
			version: (state) => `v${state.packageVersion}`,
		}),
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

	methods: {
		...mapActions(["storeUser", "storePermissions"]),

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

					const { data: { privileges } } = user.roles[0]
						? await LoginService.getRolePermissions(user.roles[0]) : {}
							.then(({ data }) => data);

					await this.storePermissions(privileges);

					this.$router.push(this.$route.query.redirect?.toString() || "/");
				}
			}).catch((e) => {
				Notification(`Login ${e}`, "is-danger");
				this.$v.$reset();
			});

			this.loginButtonLoading = false;
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
