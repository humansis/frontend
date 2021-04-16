<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field :label="$t('First Name')">
				<b-input v-model="formModel.givenName" disabled />
			</b-field>

			<b-field :label="$t('Family Name')">
				<b-input v-model="formModel.familyName" disabled />
			</b-field>

			<b-field :label="$t('Gender')">
				<b-input v-model="formModel.gender" disabled />
			</b-field>

			<b-field :label="$t('Date of Birth')">
				<b-datepicker
					v-model="formModel.dateOfBirth"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					disabled
				/>
			</b-field>

			<b-field :label="$t('Residency Status')">
				<b-input v-model="formModel.residencyStatus" disabled />
			</b-field>

			<b-field :label="$t('Status')">
				<b-input v-model="formModel.residencyStatus" disabled />
			</b-field>

			<b-field :label="$t('Add a Referral Type')">
				<b-checkbox v-model="addAReferral" :disabled="disabled" />
			</b-field>

			<b-field v-if="addAReferral" :label="$t('Referral Type')">
				<MultiSelect
					v-model="formModel.referralType"
					searchable
					:loading="referralTypeLoading"
					:disabled="disabled"
					:placeholder="$t('Click to select')"
					:options="options.referralType"
				/>
			</b-field>

			<b-field v-if="addAReferral" :label="$t('Comment')">
				<b-input v-model="formModel.comment" :disabled="disabled" />
			</b-field>

			<b-field :label="$t('Justification for Adding')">
				<b-input v-model="formModel.justificationForAdding" disabled />
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="!disabled"
				tag="input"
				class="is-primary"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";

export default {
	name: "EditBeneficiaryForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		disabled: Boolean,
	},

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
		submitForm() {
			this.$emit("formSubmitted", this.formModel);
		},

		closeForm() {
			this.$emit("formClosed");
		},

		async fetchReferralTypes() {
			this.referralTypeLoading = true;

			await BeneficiariesService.getListOfReferralTypes()
				.then(({ data }) => { this.options.referralType = data; })
				.catch((e) => {
					Notification(`${this.$t("Referral Types")} ${e}`, "is-danger");
				});

			this.referralTypeLoading = false;
		},

	},
};
</script>
