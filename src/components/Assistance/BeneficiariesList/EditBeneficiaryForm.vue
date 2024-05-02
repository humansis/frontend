<template>
	<v-card-text>
		<DataInput
			v-model="formModel.givenName"
			label="Local given name"
			name="local-given-name"
			disabled
			class="mb-4"
		/>

		<DataInput
			v-model="formModel.familyName"
			label="Local family name"
			name="local-family-name"
			disabled
			class="mb-4"
		/>

		<DataInput
			v-model="formModel.gender"
			label="Gender"
			name="gender"
			disabled
			class="mb-4"
		/>

		<DatePicker
			v-model="formModel.dateOfBirth"
			label="Date of Birth"
			name="date-of-birth"
			class="mb-4"
			disabled
		/>

		<DataInput
			v-model="formModel.residencyStatus"
			label="Residency Status"
			name="residency-status"
			class="mb-4"
			disabled
		/>

		<v-checkbox
			v-model="addAReferral"
			:label="$t('Add a Referral Type')"
			:disabled="disabled"
			name="add-referral-type"
			class="checkbox"
			hide-details
		/>

		<DataSelect
			v-if="addAReferral"
			v-model="formModel.referralType"
			:items="options.referralType"
			:loading="referralTypeLoading"
			:disabled="disabled"
			label="Referral Type"
			name="referral-type"
			class="mb-4"
		/>

		<DataInput
			v-if="addAReferral"
			v-model="formModel.comment"
			:disabled="disabled"
			label="Comment"
			name="comment"
			class="mb-4"
		/>

		<DataInput
			v-model="formModel.justification"
			label="Justification for Adding"
			name="justification-for-adding"
			class="mb-4"
			disabled
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
			v-if="!disabled"
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
import BeneficiariesService from "@/services/BeneficiariesService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DatePicker from "@/components/Inputs/DatePicker";
import { Notification } from "@/utils/UI";

export default {
	name: "EditBeneficiaryForm",

	components: {
		DataInput,
		DatePicker,
		DataSelect,
	},

	props: {
		closeButton: Boolean,
		disabled: Boolean,

		formModel: {
			type: Object,
			required: true,
		},

		submitButtonLabel: {
			type: String,
			required: true,
		},
	},

	emits: ["formSubmitted", "formClosed"],

	data() {
		return {
			addAReferral: false,
			options: {
				referralType: [],
			},
			referralTypeLoading: false,
		};
	},

	methods: {
		onSubmitForm() {
			this.$emit("formSubmitted", this.formModel);
		},

		onCloseForm() {
			this.$emit("formClosed");
		},

		async fetchReferralTypes() {
			this.referralTypeLoading = true;

			await BeneficiariesService.getListOfReferralTypes()
				.then(({ data }) => { this.options.referralType = data; })
				.catch((e) => {
					Notification(`${this.$t("Referral Types")} ${e.message || e}`, "error");
				});

			this.referralTypeLoading = false;
		},

	},
};
</script>
