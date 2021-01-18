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
								:type="getValidationType('login')"
								:message="getValidationMessage('login', 'Required')"
							>
								<b-input
									v-model="formModel.login"
									autofocus
									@blur="validateInput('login')"
								/>
							</b-field>

							<b-field
								label="Password"
								label-position="inside"
								:type="getValidationType('password')"
								:message="getValidationMessage('password', 'Required')"
							>
								<b-input
									type="password"
									v-model="formModel.password"
									password-reveal
									@blur="validateInput('password')"
								/>
							</b-field>

							<b-field grouped position="is-centered">
								<b-button
									type="is-primary"
									native-type="submit"
									:disabled="fetch.loading === true"
								>
									<span :class="{ 'is-invisible': fetch.loading }">Login</span>
									<b-loading
										v-model="fetch.loading"
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

export default {
	name: "Login",

	data() {
		return {
			formModel: {
				login: "",
				password: "",
			},
			fetch: {
				loading: false,
			},
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
			login: (state) => state.login,
			version: (state) => `v${state.packageVersion}`,
		}),
	},

	beforeCreate() {
		document.documentElement.classList.add("layout-center");
	},

	methods: {
		...mapActions(["logUserIn"]),

		async submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.fetch.loading = true;

			const { successful } = await this.logUserIn(this.formModel);

			if (successful) {
				await this.$router.push(this.$route.query.redirect?.toString() || "/");
			} else {
				this.fetch.loading = false;

				this.$buefy.toast.open({
					duration: 5000,
					message: "Login has failed",
					position: "is-bottom",
					type: "is-danger",
				});

				this.$v.$reset();
			}
		},

		validateInput(fieldName) {
			this.$v.formModel[fieldName].$touch();
		},

		getValidationMessage(fieldName, message) {
			return this.$v.formModel[fieldName].$error ? message : "";
		},

		getValidationType(fieldName) {
			let result = "";
			if (this.$v.formModel[fieldName].$dirty) {
				result = this.$v.formModel[fieldName].$error ? "is-danger" : "is-success";
			}
			return result;
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
