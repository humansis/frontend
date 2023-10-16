<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				:label="$t('Project')"
				:type="validateType('projectId')"
				:message="validateMsg('projectId')"
			>
				<MultiSelect
					v-model="formModel.projectId"
					searchable
					label="name"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					track-by="id"
					:placeholder="$t('Click to select')"
					:disabled="formDisabled || isEditing"
					:options="options.projects"
					:class="validateMultiselect('projectId')"
					@select="validate('projectId')"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field
				v-if="isEditing"
				:label="$t('Code')"
			>
				<b-input
					v-model="formModel.code"
					disabled
				/>
			</b-field>

			<b-field
				v-if="!formDisabled && !isEditing"
				:label="$t('Quantity of Booklets')"
				:type="validateType('quantityOfBooklets')"
				:message="validateMsg('quantityOfBooklets')"
			>
				<b-numberinput
					v-model="formModel.quantityOfBooklets"
					expanded
					min="0"
					type="is-dark"
					:disabled="formDisabled || isEditing"
					:controls="false"
					@input="validate('quantityOfBooklets')"
				/>
			</b-field>

			<b-field
				:label="$t('Quantity of Vouchers')"
				:type="validateType('quantityOfVouchers')"
				:message="validateMsg('quantityOfVouchers')"
			>
				<b-numberinput
					v-model="formModel.quantityOfVouchers"
					expanded
					min="0"
					type="is-dark"
					:disabled="formDisabled"
					:controls="false"
					@input="validate('quantityOfVouchers')"
				/>
			</b-field>

			<b-field
				:label="$t('Individual Value')"
				:type="validateType('values')"
				:message="validateMsg('values')"
			>
				<b-taginput
					v-model="formModel.values"
					:placeholder="$t('Values')"
					:disabled="formDisabled"
					:before-adding="beforeAdding"
					@blur="validate('values')"
				/>
			</b-field>

			<b-field
				:label="$t('Currency')"
				:type="validateType('currency')"
				:message="validateMsg('currency')"
			>
				<MultiSelect
					v-model="formModel.currency"
					searchable
					label="value"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					track-by="value"
					:placeholder="$t('Click to select')"
					:disabled="formDisabled"
					:options="options.currencies"
					:class="validateMultiselect('currency')"
					@select="validate('currency')"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field
				v-if="formDisabled || isEditing"
				:label="$t('Status')"
			>
				<MultiSelect
					v-model="formModel.status"
					label="value"
					track-by="value"
					:disabled="formDisabled || isEditing"
					:options="options.statuses"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field v-if="!formDisabled" :label="$t('Define a Password')">
				<b-checkbox v-model="formModel.defineAPassword" />
			</b-field>

			<b-field
				v-if="formModel.defineAPassword && !formDisabled"
				:label="$t('Password')"
				:type="validateType('password')"
				:message="validateMsg('password')"
			>
				<b-input
					v-model="formModel.password"
					type="password"
					password-reveal
					:disabled="formDisabled"
					@blur="validate('password')"
				/>
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
import { required, requiredIf } from "vuelidate/lib/validators";
import ProjectService from "@/services/ProjectService";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { BookletStatusArray } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { CURRENCIES } from "@/consts";

export default {
	name: "VoucherForm",

	mixins: [validation],

	validations: {
		formModel: {
			// eslint-disable-next-line func-names
			quantityOfBooklets: { required: requiredIf(function () {
				return !this.isEditing;
			}) },
			quantityOfVouchers: { required },
			values: { required },
			projectId: { required },
			password: { required: requiredIf((form) => form.defineAPassword) },
			status: {},
			currency: { required },
		},
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		isEditing: Boolean,
	},

	data() {
		return {
			options: {
				projects: [],
				currencies: CURRENCIES,
				statuses: BookletStatusArray,
			},
		};
	},

	async mounted() {
		await this.fetchProjects();
		this.mapToFormModel();
	},

	methods: {
		mapToFormModel() {
			if (this.formModel.currency) {
				this.formModel.currency = getArrayOfCodeListByKey([this.formModel.currency], CURRENCIES, "value");
			}
			if (this.formModel.projectId) {
				this.formModel.projectId = getArrayOfCodeListByKey([this.formModel.projectId], this.options.projects, "id");
			}
			if (this.formModel.status) {
				this.formModel.status = getArrayOfCodeListByKey([this.formModel.status], this.options.statuses, "code");
			}
		},

		beforeAdding(tag) {
			// Values length must be lower or equal than quantityOfVoucher and value must be number
			return this.formModel.values.length < this.formModel.quantityOfVouchers
				&& !Number.isNaN(Number(tag));
		},

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
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.options.projects = data;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});
		},
	},
};
</script>
