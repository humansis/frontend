<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field label="Service Name">
				<b-input v-model="formModel.name" disabled />
			</b-field>

			<b-field label="Country">
				<b-input v-model="formModel.iso3" disabled />
			</b-field>

			<b-field
				v-if="fields.token"
				label="Token"
			>
				<b-input v-model="formModel.parameters.token" :disabled="formDisabled" />
			</b-field>

			<b-field v-if="fields.username" label="Username">
				<b-input v-model="formModel.parameters.username" :disabled="formDisabled" />
			</b-field>

			<b-field v-if="fields.email" label="Email">
				<b-input v-model="formModel.parameters.email" :disabled="formDisabled" />
			</b-field>

			<b-field v-if="fields.password" label="Password">
				<b-input
					v-model="formModel.parameters.password"
					type="password"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field label="Enabled">
				<b-checkbox v-model="formModel.enabled" :disabled="formDisabled" />
			</b-field>

			<b-field v-if="fields.username" label="Production">
				<b-checkbox v-model="formModel.parameters.production" :disabled="formDisabled" />
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button
				v-if="closeButton"
				@click="closeForm"
			>
				Close
			</b-button>
			<b-button
				v-if="!formDisabled"
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
import Validation from "@/mixins/validation";

export default {
	name: "OrganizationServiceForm",

	mixins: [Validation],

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
