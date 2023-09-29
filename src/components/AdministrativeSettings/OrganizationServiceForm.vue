<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field :label="$t('Service Name')">
				<b-input v-model="formModel.name" disabled />
			</b-field>

			<b-field :label="$t('Country')">
				<b-input v-model="formModel.iso3" disabled />
			</b-field>

			<b-field
				v-if="fields.token"
				:label="$t('Token')"
			>
				<b-input v-model="formModel.parameters.token" :disabled="formDisabled" />
			</b-field>

			<b-field v-if="fields.username" :label="$t('Username')">
				<b-input v-model="formModel.parameters.username" :disabled="formDisabled" />
			</b-field>

			<b-field v-if="fields.email" :label="$t('Email')">
				<b-input v-model="formModel.parameters.email" :disabled="formDisabled" />
			</b-field>

			<b-field v-if="fields.password" :label="$t('Password')">
				<b-input
					v-model="formModel.parameters.password"
					type="password"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field :label="$t('Enabled')">
				<b-checkbox v-model="formModel.enabled" :disabled="formDisabled" />
			</b-field>

			<b-field v-if="fields.username" :label="$t('Production')">
				<b-checkbox v-model="formModel.parameters.production" :disabled="formDisabled" />
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button
				v-if="closeButton"
				@click="closeForm"
			>
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="!formDisabled"
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
	name: "OrganizationServiceForm",

	mixins: [validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			enabled: { required },
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
		submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
		},

		closeForm() {
			this.$v.$reset();
			this.$emit("formClosed");
		},
	},
};
</script>
