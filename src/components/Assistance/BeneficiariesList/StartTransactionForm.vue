<template>
	<v-card-text>
		<v-alert
			variant="outlined"
			type="success"
			border="top"
			class="mt-5"
		>
			{{ $t('The confirmation code has been sent to your email') }}.
		</v-alert>

		<DataInput
			v-model="formModel.code"
			:error-messages="validationMsg('code')"
			label="code"
			name="code"
			class="mb-6"
			@blur="onValidate('code')"
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			v-if="closeButton"
			class="text-none"
			size="small"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			color="primary"
			size="small"
			class="text-none ml-3"
			variant="elevated"
			@click="onSubmitForm"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import DataInput from "@/components/Inputs/DataInput";
import validation from "@/mixins/validation";
import { required } from "@vuelidate/validators";

export default {
	name: "StartTransactionsForm",

	components: {
		DataInput,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				code: { required },
			},
		};
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
		onSubmitForm() {
			this.v$.$touch();
			if (this.v$.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel.code);
			this.v$.$reset();
		},

		onCloseForm() {
			this.$emit("formClosed");
		},

	},
};
</script>
