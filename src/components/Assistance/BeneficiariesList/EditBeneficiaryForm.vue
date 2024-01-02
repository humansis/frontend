<template>
	<v-card-text>
		<DataInput
			v-model="formModel.givenName"
			label="First Name"
			name="first-name"
			disabled
			class="mb-6"
		/>

		<DataInput
			v-model="formModel.familyName"
			label="Family Name"
			name="family-name"
			disabled
			class="mb-6"
		/>

		<DataInput
			v-model="formModel.gender"
			label="Gender"
			name="gender"
			disabled
			class="mb-6"
		/>

		<DatePicker
			v-model="formModel.dateOfBirth"
			label="Date of Birth"
			name="date-of-birth"
			disabled
		/>

		<DataInput
			v-model="formModel.residencyStatus"
			label="Residency Status"
			name="residency-status"
			disabled
		/>

		<v-checkbox
			v-model="addAReferral"
			:label="$t('Add a Referral Type')"
			:disabled="disabled"
			hide-details
			class="checkbox"
		/>

		<DataSelect
			v-if="addAReferral"
			v-model="formModel.referralType"
			:items="options.referralType"
			:loading="referralTypeLoading"
			:disabled="disabled"
			label="Referral Type"
			name="referral-type"
			is-search-enabled
			class="mb-6"
		/>

		<DataInput
			v-if="addAReferral"
			v-model="formModel.comment"
			:disabled="disabled"
			label="Comment"
			name="comment"
			class="mb-6"
		/>

		<DataInput
			v-model="formModel.justification"
			label="Justification for Adding"
			name="justification-for-adding"
			class="mb-6"
			disabled
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
			v-if="!disabled"
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
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		disabled: Boolean,
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
