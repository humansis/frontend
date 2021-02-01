<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Project"
				:type="validateType('projectId')"
				:message="validateMsg('projectId')"
			>
				<MultiSelect
					v-model="formModel.projectId"
					v-if="!formDisabled"
					searchable
					placeholder="Click to select..."
					label="name"
					track-by="id"
					:disabled="formDisabled"
					:options="projects"
					:class="validateMultiselect('projectId')"
					@select="validate('projectId')"
				/>
				<b-input
					v-model="formModel.project"
					v-show="formDisabled"
					:disabled="formDisabled"
				/>
			</b-field>

			<b-field
				v-if="!formDisabled"
				label="Quantity Of Booklets"
				:type="validateType('quantityOfBooklets')"
				:message="validateMsg('quantityOfBooklets')"
			>
				<b-numberinput
					v-model="formModel.quantityOfBooklets"
					expanded
					min="0"
					controls-alignment="right"
					controls-position="compact"
					placeholder="Quantity Of Booklets"
					:disabled="formDisabled"
					:controls="!formDisabled"
					@input="validate('quantityOfBooklets')"
				/>
			</b-field>

			<b-field
				label="Quantity Of Vouchers"
				:type="validateType('quantityOfVouchers')"
				:message="validateMsg('quantityOfVouchers')"
			>
				<b-numberinput
					v-model="formModel.quantityOfVouchers"
					expanded
					min="0"
					placeholder="Quantity Of Vouchers"
					controls-alignment="right"
					controls-position="compact"
					:disabled="formDisabled"
					:controls="!formDisabled"
					@input="validate('quantityOfVouchers')"
				/>
			</b-field>

			<b-field
				label="Individual Value"
				:type="validateType('individualValue')"
				:message="validateMsg('individualValue')"
			>
				<b-numberinput
					v-model="formModel.individualValue"
					placeholder="Individual Value"
					:controls="false"
					:disabled="formDisabled"
					@blur="validate('individualValue')"
				/>
			</b-field>

			<b-field
				label="Currency"
				:type="validateType('currency')"
				:message="validateMsg('currency')"
			>
				<MultiSelect
					v-model="formModel.currency"
					searchable
					placeholder="Click to select..."
					label="code"
					track-by="value"
					:disabled="formDisabled"
					:options="currencies"
					:class="validateMultiselect('currency')"
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
				v-if="formModel.defineAPassword && !formDisabled"
				label="Password"
				:type="validateType('password')"
				:message="validateMsg('password')"
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
import ProjectsService from "@/services/ProjectsService";
import { Notification } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import Validation from "@/mixins/validation";

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
			currencies: [],
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

	async mounted() {
		await this.fetchProjects();
		await this.fetchCurrencies();
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
			await ProjectsService.getListOfProjects()
				.then(({ data }) => {
					this.projects = data;
				}).catch((e) => {
					Notification(`Projects ${e}`, "is-danger");
				});
		},

		async fetchCurrencies() {
			// TODO fill currencies
			this.currencies = [
				{
					code: "CZK",
					value: "CZK",
				},
				{
					code: "USD",
					value: "USD",
				},
				{
					code: "GBP",
					value: "GBP",
				},
				{
					code: "EUR",
					value: "EUR",
				},
				{
					code: "KHR",
					value: "KHR",
				},
			];
			this.formModel.currency = getArrayOfCodeListByKey([this.formModel.currency], this.currencies, "code");
		},
	},
};
</script>
