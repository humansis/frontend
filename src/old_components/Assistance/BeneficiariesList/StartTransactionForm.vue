<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-message type="is-success">
				{{ $t('The confirmation code has been sent to your email') }}.
			</b-message>
			<b-field
				:label="$t('Code')"
				:type="validateType('code')"
				:message="validateMsg('code')"
			>
				<b-input
					v-model="formModel.code"
					@blur="validate('code')"
				/>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				class="is-primary"
				native-type="submit"
			>
				{{ $t(submitButtonLabel) }}
			</b-button>
		</footer>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import validation from "@/mixins/validation";

export default {
	name: "StartTransactionsForm",

	mixins: [validation],

	validations: {
		formModel: {
			code: { required },
		},
	},

	props: {
		submitButtonLabel: String,
		closeButton: Boolean,
	},

	data() {
		return {
			formModel: {
				code: null,
			},
		};
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel.code);
			this.$v.$reset();
		},

		closeForm() {
			this.$emit("formClosed");
		},

	},
};
</script>
