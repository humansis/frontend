<template>
	<v-card-text>
		<DataSelect
			v-model="formModel.project"
			:items="options.projects"
			:disabled="formDisabled || isEditing"
			:error-messages="validationMsg('project')"
			label="Project"
			name="project"
			item-title="name"
			item-value="id"
			class="mb-4"
			@update:modelValue="onValidate('project')"
		/>

		<DataInput
			v-if="isEditing"
			v-model="formModel.code"
			label="Code"
			name="code"
			class="mb-4"
		/>

		<DataInput
			v-if="!formDisabled && !isEditing"
			v-model.number="formModel.quantityOfBooklets"
			:disabled="formDisabled || isEditing"
			:error-messages="validationMsg('quantityOfBooklets')"
			label="Quantity of Booklets"
			name="quantity-of-booklets"
			type="number"
			min="0"
			class="mb-4"
			hide-spin-buttons
			@blur="onValidate('quantityOfBooklets')"
		/>

		<DataInput
			v-model.number="formModel.quantityOfVouchers"
			:disabled="formDisabled"
			:error-messages="validationMsg('quantityOfVouchers')"
			label="Quantity of Vouchers"
			name="quantity-of-vouchers"
			type="number"
			min="0"
			class="mb-4"
			hide-spin-buttons
			@blur="onValidate('quantityOfVouchers')"
		/>

		<TagInput
			v-model="formModel.values"
			:disabled="formDisabled"
			:persistent-hint="!formDisabled"
			:error-messages="validationMsg('values')"
			label="Individual Value"
			type="number"
			hint="Use enter to add value"
			class="mb-4"
			multiple
			clearable
			hide-spin-buttons
			@update:modelValue="onValidate('values')"
		/>

		<DataSelect
			v-model="formModel.currency"
			:items="options.currencies"
			:disabled="formDisabled"
			:error-messages="validationMsg('currency')"
			label="Currency"
			name="currency"
			item-title="value"
			item-value="value"
			class="mb-4"
			searchable
			@update:modelValue="onValidate('currency')"
		/>

		<DataSelect
			v-if="formDisabled || isEditing"
			v-model="formModel.status"
			:items="options.statuses"
			:disabled="formDisabled || isEditing"
			label="Status"
			name="status"
			item-title="value"
			item-value="value"
			class="mb-4"
		/>

		<v-checkbox
			v-if="!formDisabled"
			v-model="formModel.defineAPassword"
			:label="$t('Define a Password')"
			name="define-password"
			class="checkbox"
			hide-details
		/>

		<DataInput
			v-if="formModel.defineAPassword && !formDisabled"
			v-model="formModel.password"
			:disabled="formDisabled"
			:error-messages="validationMsg('password')"
			:append-inner-icon="passwordVisible ? 'eye-slash' : 'eye'"
			:type="passwordVisible ? 'text' : 'password'"
			label="Password"
			name="password"
			class="mb-4"
			@blur="onValidate('password')"
			@click:append-inner="passwordVisible = !passwordVisible"
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
			color="primary"
			class="text-none ml-3"
			variant="elevated"
			@click="onSubmitForm"
		>
			{{ $t(submitButtonLabel) }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import { maxLength, required, requiredIf } from "@vuelidate/validators";
import ProjectService from "@/services/ProjectService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import TagInput from "@/components/Inputs/TagInput";
import validation from "@/mixins/validation";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { checkResponseStatus } from "@/utils/fetcher";
import { BookletStatusArray } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { CURRENCIES } from "@/consts";

export default {
	name: "VoucherForm",

	emits: ["formSubmitted", "formClosed"],

	components: {
		TagInput,
		DataSelect,
		DataInput,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				quantityOfBooklets: { required: requiredIf(!this.isEditing) },
				quantityOfVouchers: { required },
				values: {
					required,
					maxLengthValue: maxLength(this.formModel.quantityOfVouchers),
				},
				project: { required },
				password: { required: requiredIf(this.formModel.defineAPassword) },
				status: {},
				currency: { required },
			},
		};
	},

	props: {
		closeButton: Boolean,
		formDisabled: Boolean,
		isEditing: Boolean,

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
			passwordVisible: false,
			options: {
				projects: [],
				currencies: CURRENCIES,
				statuses: BookletStatusArray,
			},
		};
	},

	async mounted() {
		if (!this.formDisabled) {
			await this.fetchProjects();
		}

		this.mapToFormModel();
	},

	methods: {
		mapToFormModel() {
			if (this.formModel.currency) {
				this.formModel.currency = getArrayOfCodeListByKey([this.formModel.currency], CURRENCIES, "value");
			}
		},

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

		async fetchProjects() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await ProjectService.getShortListOfProjects();

				checkResponseStatus(status, message);

				this.options.projects = data;
			} catch (e) {
				Notification(`${this.$t("Projects")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
