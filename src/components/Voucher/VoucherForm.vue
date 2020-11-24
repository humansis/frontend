<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Project"
				:type="getValidationType('projectId')"
				:message="getValidationMessage('projectId', 'Required')"
			>
				<MultiSelect
					v-model="formModel.projectId"
					searchable
					placeholder="Project"
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="projects"
					@select="validateInput('projectId')"
				/>
			</b-field>

			<b-field
				label="Quantity Of Booklets"
				:type="getValidationType('quantityOfBooklets')"
				:message="getValidationMessage('quantityOfBooklets', 'Required')"
			>
				<b-numberinput
					v-model="formModel.quantityOfBooklets"
					expanded
					min="0"
					controls-alignment="right"
					controls-position="compact"
					placeholder="Quantity Of Booklets"
					:disabled="formDisabled"
					@blur="validateInput('Quantity Of Booklets')"
				/>
			</b-field>

			<b-field
				label="Quantity Of Vouchers"
				:type="getValidationType('quantityOfVouchers')"
				:message="getValidationMessage('quantityOfVouchers', 'Required')"
			>
				<b-numberinput
					v-model="formModel.quantityOfVouchers"
					expanded
					min="0"
					placeholder="Quantity Of Vouchers"
					controls-alignment="right"
					controls-position="compact"
					:disabled="formDisabled"
					@blur="validateInput('quantityOfVouchers')"
				/>
			</b-field>

			<b-field
				label="Individual Value"
				:type="getValidationType('individualValue')"
				:message="getValidationMessage('individualValue', 'Required')"
			>
				<b-input
					v-model="formModel.individualValue"
					placeholder="Individual Value"
					:disabled="formDisabled"
					@blur="validateInput('individualValue')"
				/>
			</b-field>

			<b-field
				label="Currency"
				:type="getValidationType('currency')"
				:message="getValidationMessage('currency', 'Required')"
			>
				<MultiSelect
					v-model="formModel.currency"
					searchable
					placeholder="Currency"
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="currencies"
					@select="validateInput('currency')"
				/>
			</b-field>

			<b-field
				v-if="!formDisabled"
				label="Define A Password"
			>
				<b-checkbox
					v-model="formModel.defineAPassword"
				/>
			</b-field>

			<b-field
				v-if="formModel.defineAPassword || formDisabled"
				label="Password"
				:type="getValidationType('password')"
				:message="getValidationMessage('password', 'Required')"
			>
				<b-input
					v-model="formModel.password"
					type="password"
					placeholder="Password"
					password-reveal
					:disabled="formDisabled"
					@blur="validateInput('password')"
				/>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<button
				v-if="closeButton"
				class="button"
				type="button"
				@click="closeForm"
			>
				Close
			</button>
			<b-button
				v-if="!formDisabled"
				tag="input"
				class="is-success"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import { required, requiredIf } from "vuelidate/lib/validators";
import ProjectsService from "@/services/ProjectsService";

export default {
	name: "VoucherForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	data() {
		return {
			projects: [],
			// TODO fill currencies
			currencies: [
				{
					id: "CZK",
					name: "CZK",
				},
				{
					id: "USD",
					name: "USD",
				},
				{
					id: "GBP",
					name: "GBP",
				},
				{
					id: "EUR",
					name: "EUR",
				},
			],
		};
	},

	validations: {
		formModel: {
			quantityOfBooklets: {
				required,
			},
			quantityOfVouchers: {
				required,
			},
			individualValue: {
				required,
			},
			projectId: {
				required,
			},
			password: {
				required: requiredIf((form) => form.defineAPassword),
			},
			status: {},
			currency: {
				required,
			},
		},
	},

	mounted() {
		this.fetchProjects();
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

		closeForm() {
			this.$v.$reset();
			this.$emit("formClosed");
		},

		fetchProjects() {
			ProjectsService.getListOfProjects(
				1,
				15,
				"desc",
			).then((response) => {
				this.projects = response.data;
			});
		},
	},
};
</script>
