<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Project"
				:type="validateType('projectId')"
				:message="validateMsg('projectId', 'Required')"
			>
				<MultiSelect
					v-model="formModel.projectId"
					v-if="!formDisabled"
					searchable
					placeholder="Project"
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="projects"
					@select="validate('projectId')"
				/>
				<b-input
					v-model="formModel.project"
					v-show="formDisabled"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field
				label="Quantity Of Booklets"
				:type="validateType('quantityOfBooklets')"
				:message="validateMsg('quantityOfBooklets', 'Required')"
			>
				<b-numberinput
					v-model="formModel.quantityOfBooklets"
					expanded
					min="0"
					controls-alignment="right"
					controls-position="compact"
					placeholder="Quantity Of Booklets"
					:disabled="formDisabled"
					@blur="validate('Quantity Of Booklets')"
				/>
			</b-field>

			<b-field
				label="Quantity Of Vouchers"
				:type="validateType('quantityOfVouchers')"
				:message="validateMsg('quantityOfVouchers', 'Required')"
			>
				<b-numberinput
					v-model="formModel.quantityOfVouchers"
					expanded
					min="0"
					placeholder="Quantity Of Vouchers"
					controls-alignment="right"
					controls-position="compact"
					:disabled="formDisabled"
					@blur="validate('quantityOfVouchers')"
				/>
			</b-field>

			<b-field
				label="Individual Value"
				:type="validateType('individualValue')"
				:message="validateMsg('individualValue', 'Required')"
			>
				<b-input
					v-model="formModel.individualValue"
					placeholder="Individual Value"
					:disabled="formDisabled"
					@blur="validate('individualValue')"
				/>
			</b-field>

			<b-field
				label="Currency"
				:type="validateType('currency')"
				:message="validateMsg('currency', 'Required')"
			>
				<MultiSelect
					v-model="formModel.currency"
					searchable
					placeholder="Currency"
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="currencies"
					@select="validate('currency')"
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
				:type="validateType('password')"
				:message="validateMsg('password', 'Required')"
			>
				<b-input
					v-model="formModel.password"
					type="password"
					placeholder="Password"
					password-reveal
					:disabled="formDisabled"
					@blur="validate('password')"
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
import Validation from "@/mixins/validation";
import ProjectsService from "@/services/ProjectsService";
import { Toast } from "@/utils/UI";

export default {
	name: "VoucherForm",

	mixins: [Validation],

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
			quantityOfBooklets: { required },
			quantityOfVouchers: { required },
			individualValue: { required },
			projectId: { required },
			password: { required: requiredIf((form) => form.defineAPassword) },
			status: {},
			currency: { required },
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

		closeForm() {
			this.$v.$reset();
			this.$emit("formClosed");
		},

		async fetchProjects() {
			await ProjectsService.getListOfProjects(
				1,
				15,
				"desc",
			).then((response) => {
				this.projects = response.data;
			}).catch((e) => {
				Toast(`(Projects) ${e}`, "is-danger");
			});
		},
	},
};
</script>
