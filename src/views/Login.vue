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

							<div class="has-text-light has-text-centered mb-4">{{ version}}</div>

							<b-field
								label="Username"
								label-position="inside"
								:type="validateType('login')"
								:message="validateMsg('login', 'Required')"
							>
								<b-input
									v-model="formModel.login"
									autofocus
									@blur="validate('login')"
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
									:disabled="loading === true"
								>
									<span :class="{ 'is-invisible': loading }">Login</span>
									<b-loading
										v-model="loading"
										:is-full-page="false"
									/>
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
import { required } from "vuelidate/lib/validators";
import Validation from "@/mixins/validation";

export default {
	name: "Login",

	mixins: [Validation],

	data() {
		return {
			formModel: {
				login: "",
				password: "",
			},
			loading: false,
		};
	},

	validations: {
		formModel: {
			login: {
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
		...mapActions(["storeUser"]),
		async submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			// TODO Uncomment bellow after Login service on BE will be DONE
			this.loading = true;
			// await LoginService.logUserIn(this.formModel).then((response) => {
			// if (response.status === 200) {
			// const { data: user } = response;
			const user = {};
			// TODO Different usage of window.btoa with credentials
			user.authdata = window.btoa(`${this.formModel.login}:${this.formModel.password}`);
			localStorage.setItem("user", JSON.stringify(user));
			this.storeUser(user);

			this.$router.push(this.$route.query.redirect?.toString() || "/");
			// }
			// }).catch((e) => {
			// Notification(`Login ${e}`, "is-danger");
			// this.loading = false;
			// this.$v.$reset();
			// });
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
