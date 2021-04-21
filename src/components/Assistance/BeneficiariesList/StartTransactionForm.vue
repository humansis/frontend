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
				tag="input"
				class="is-primary"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import validation from "@/mixins/validation";

export default {
	name: "StartTransactionsForm",

	props: {
		submitButtonLabel: String,
		closeButton: Boolean,
	},

	mixins: [validation],

	data() {
		return {
			formModel: {
				code: null,
			},
		};
	},

	validations: {
		formModel: {
			code: { required },
		},
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
