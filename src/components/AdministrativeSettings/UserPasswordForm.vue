<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				:label="$t('Password')"
				:type="validateType('password')"
				:message="passwordMessage()"
			>
				<b-input
					v-model="formModel.password"
					type="password"
					password-reveal
					@blur="validate('password')"
				/>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button
				class="is-primary"
				native-type="submit"
			>{{ submitButtonLabel }}</b-button>
		</footer>
	</form>
</template>

<script>
import Validation from "@/mixins/validation";

const passwordRegexp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/);

const passwordValidation = (value) => ((value ? passwordRegexp.test(value) : true) && value.length);

export default {
	name: "UserPasswordForm",

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
	},

	validations: {
		formModel: {
			password: {
				passwordValidation,
			},
		},
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

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

		passwordMessage() {
			if (this.$v.formModel.password.$dirty) {
				if (!this.$v.formModel.password.passwordValidation) {
					return this.$t("The Password Is Not Strong Enough... Minimum Required = 8 Characters, 1 Lowercase, 1 Uppercase, 1 Numeric");
				}
			}
			return "";
		},
	},
};
</script>
