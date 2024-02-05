<template>
	<v-card-text>
		<DataInput
			v-model="formModel.name"
			label="Service Name"
			name="service-name"
			class="mb-4"
			disabled
		/>

		<DataInput
			v-model="formModel.iso3"
			label="Country"
			name="country"
			class="mb-4"
			disabled
		/>

		<DataInput
			v-if="fields.token"
			v-model="formModel.parameters.token"
			:disabled="formDisabled"
			label="Token"
			name="token"
			class="mb-4"
		/>

		<DataInput
			v-if="fields.username"
			v-model="formModel.parameters.username"
			:disabled="formDisabled"
			label="Username"
			name="username"
			class="mb-4"
		/>

		<DataInput
			v-if="fields.email"
			v-model="formModel.parameters.email"
			:disabled="formDisabled"
			label="Email"
			name="email"
			class="mb-4"
		/>

		<DataInput
			v-if="fields.password"
			v-model="formModel.parameters.password"
			:disabled="formDisabled"
			label="Password"
			name="password"
			type="password"
		/>

		<v-checkbox
			v-model="formModel.enabled"
			:disabled="formDisabled"
			:label="$t('Enabled')"
			name="enabled"
			class="checkbox"
			hide-details
		/>

		<v-checkbox
			v-if="fields.username"
			v-model="formModel.parameters.production"
			:disabled="formDisabled"
			:label="$t('Production')"
			name="production"
			class="checkbox"
			hide-details
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			v-if="closeButton"
			class="text-none"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			v-if="!formDisabled"
			class="text-none ml-3"
			color="primary"
			variant="elevated"
			@click="onSubmitForm"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import { required } from "@vuelidate/validators";
import DataInput from "@/components/Inputs/DataInput";
import validation from "@/mixins/validation";

export default {
	name: "OrganizationServiceForm",

	emits: ["formSubmitted", "formClosed"],

	components: {
		DataInput,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				enabled: { required },
			},
		};
	},

	props: {
		closeButton: Boolean,
		formDisabled: Boolean,

		formModel: {
			type: Object,
			required: true,
		},

		submitButtonLabel: {
			type: String,
			required: true,
		},
	},

	data() {
		return {
			fields: {
				token: false,
				email: false,
				username: false,
				password: false,
				production: false,
			},
		};
	},

	mounted() {
		const fields = Object.keys(this.fields);
		Object.keys(this.formModel.parameters).forEach((key) => {
			this.fields[key] = !!fields.find((value) => value === key);
			if (key === "production") {
				this.formModel.production = !!this.formModel.parameters.production;
			}
		});
	},

	methods: {
		onSubmitForm() {
			this.v$.$touch();
			if (this.v$.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.v$.$reset();
		},

		onCloseForm() {
			this.v$.$reset();
			this.$emit("formClosed");
		},
	},
};
</script>
