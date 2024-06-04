<template>
	<v-card-text>
		<p v-if="!formModel.removingId" class="mb-5">
			{{ $t('Please select the beneficiaries that you want to add to the') }}
			<strong>{{ assistance.name }}</strong> {{ $t('assistance') }}.
		</p>

		<p v-else class="mb-5">
			{{ $t('You are about to remove this beneficiary from') }}
			<strong>{{ assistance.name }}</strong> {{ $t('assistance') }}.<br>
			{{ $t('Do you wish to continue?') }}
		</p>

		<DataSelect
			v-if="!formModel.removingId"
			v-model="formModel.beneficiaries"
			:items="beneficiariesOptions"
			:item-title="multiselectLabel"
			:loading="loading.beneficiaries"
			:disabled="formDisabled"
			:error-messages="validationMsg('beneficiaries')"
			label="Beneficiaries"
			name="beneficiaries"
			item-value="id"
			class="mb-4"
			multiple
			@update:modelValue="onValidate('beneficiaries')"
		/>

		<DataInput
			v-model="formModel.justification"
			:disabled="formDisabled"
			:error-messages="validationMsg('justification')"
			label="Justification"
			name="justification"
			@update:modelValue="onValidate('justification')"
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			class="text-none"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
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
import { required, requiredIf } from "@vuelidate/validators";
import BeneficiariesService from "@/services/BeneficiariesService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";

export default {
	name: "AddBeneficiaryForm",

	components: {
		DataSelect,
		DataInput,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				beneficiaries: { required: requiredIf(!this.formModel.removingId) },
				justification: { required },
			},
		};
	},

	props: {
		closeButton: Boolean,
		formDisabled: Boolean,

		formModel: {
			type: Object,
			required: true,
		},

		assistance: {
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
			target: "",
			options: {
				beneficiaries: [],
			},
			loading: {
				beneficiaries: true,
			},
			submitButtonLoading: false,
		};
	},

	computed: {
		multiselectLabel() {
			let result = "";

			switch (this.assistance.target) {
				case ASSISTANCE.TARGET.COMMUNITY:
				case ASSISTANCE.TARGET.INSTITUTION:
					result = "name";
					break;
				case ASSISTANCE.TARGET.HOUSEHOLD:
				case ASSISTANCE.TARGET.INDIVIDUAL:
				default:
					result = "fullName";
			}

			return result;
		},

		beneficiariesOptions() {
			return this.options.beneficiaries.map((beneficiary) => ({
				...beneficiary,
				fullName: this.getOptionTitle(beneficiary),
			}));
		},

		isAssistanceTargetInstitution() {
			return this.target === ASSISTANCE.TARGET.INSTITUTION;
		},

		beneficiaryEndpointVersion() {
			return this.isAssistanceTargetInstitution ? 2 : 1;
		},
	},

	mounted() {
		this.target = this.assistance.target;

		if (!this.formModel.removingId) this.fetchBeneficiariesByProject();
		this.formModel.justification = "";
		this.formModel.beneficiaries = [];
	},

	methods: {
		onSubmitForm() {
			this.v$.$touch();
			if (!this.v$.$invalid) {
				if (this.formModel.removingId) {
					this.removeBeneficiaryFromAssistance(this.formModel);
				} else {
					this.addBeneficiaryToAssistance(this.formModel);
				}
			}
		},

		getOptionTitle(option) {
			let result = "";

			switch (this.assistance.target) {
				case ASSISTANCE.TARGET.COMMUNITY:
				case ASSISTANCE.TARGET.INSTITUTION:
					result = option.name;
					break;
				case ASSISTANCE.TARGET.HOUSEHOLD:
				case ASSISTANCE.TARGET.INDIVIDUAL:
				default:
					result = `${option.localFamilyName} ${option.localGivenName}`;
			}

			return result;
		},

		async fetchBeneficiariesByProject() {
			try {
				const { projectId } = this.$route.params;
				const filters = {
					excludeAssistance: this.$route.params.assistanceId,
					...(this.assistance.remoteDistributionAllowed
						&& this.assistance.commodities[0]?.modalityType === ASSISTANCE.COMMODITY.SMARTCARD
						&& {
							validSmartcard: true,
						}),
				};

				const {
					data: { data },
					status,
					message,
				} = await BeneficiariesService.getBeneficiariesByProject({
					id: projectId,
					target: this.target,
					filters,
				});

				checkResponseStatus(status, message);

				this.options.beneficiaries = data;
			} catch (e) {
				Notification(`${this.$t("Project Beneficiaries")}: ${e.message || e}`, "error");
			} finally {
				this.loading.beneficiaries = false;
			}
		},

		async removeBeneficiaryFromAssistance({ justification, removingId }) {
			const body = {
				...(!this.isAssistanceTargetInstitution && { removed: true }),
				justification,
			};

			switch (this.assistance.target) {
				case ASSISTANCE.TARGET.COMMUNITY:
					body.communityIds = [removingId];
					break;
				case ASSISTANCE.TARGET.INSTITUTION:
					body.institutionIds = [removingId];
					break;
				case ASSISTANCE.TARGET.HOUSEHOLD:
				case ASSISTANCE.TARGET.INDIVIDUAL:
				default:
					body.beneficiaryIds = [removingId];
			}

			await this.addOrRemoveBeneficiaryFromAssistance(
				body,
				this.target,
				this.$t("Beneficiary Successfully Removed"),
			);
		},

		async addBeneficiaryToAssistance({ beneficiaries, justification }) {
			const body = {
				added: true,
				justification,
			};

			switch (this.assistance.target) {
				case ASSISTANCE.TARGET.COMMUNITY:
					body.communityIds = getArrayOfIdsByParam(beneficiaries, "id");
					break;
				case ASSISTANCE.TARGET.INSTITUTION:
					body.institutionIds = getArrayOfIdsByParam(beneficiaries, "id");
					break;
				case ASSISTANCE.TARGET.HOUSEHOLD:
				case ASSISTANCE.TARGET.INDIVIDUAL:
				default:
					body.beneficiaryIds = getArrayOfIdsByParam(beneficiaries, "id");
			}

			await this.addOrRemoveBeneficiaryFromAssistance(
				body,
				this.target,
				this.$t("Beneficiary Successfully Added"),
			);
		},

		async addOrRemoveBeneficiaryFromAssistance(body, target, successMessage) {
			this.submitButtonLoading = true;
			let assistanceTarget = "";

			switch (target) {
				case ASSISTANCE.TARGET.COMMUNITY:
					assistanceTarget = "communities";
					break;
				case ASSISTANCE.TARGET.INSTITUTION:
					assistanceTarget = "institutions";
					break;
				case ASSISTANCE.TARGET.HOUSEHOLD:
				case ASSISTANCE.TARGET.INDIVIDUAL:
				default:
					assistanceTarget = "beneficiaries";
			}

			if (body.removed || !body.added) {
				await BeneficiariesService.removeBeneficiaryFromAssistance(
					this.$route.params.assistanceId,
					assistanceTarget,
					body,
					this.beneficiaryEndpointVersion,
				)
					.then(({ data, status }) => {
						if (status === 400) {
							Notification(data, "warning");
						} else {
							Notification(successMessage, "success");
						}
					})
					.catch((e) => {
						Notification(`${this.$t("Beneficiary")} ${e.message || e}`, "error");
					});
			}

			if (body.added) {
				await BeneficiariesService.addBeneficiaryToAssistance(
					this.$route.params.assistanceId,
					assistanceTarget,
					body,
					this.beneficiaryEndpointVersion,
				)
					.then(({ data, status }) => {
						if (status === 400) {
							Notification(data, "warning");
						} else {
							Notification(successMessage, "success");
						}
					})
					.catch((e) => {
						Notification(`${this.$t("Beneficiary")} ${e}`, "error");
					});
			}

			this.submitButtonLoading = false;
			this.onCloseForm();
			this.$emit("addingOrRemovingSubmitted");
		},

		onCloseForm() {
			this.$emit("formClosed");
		},

	},
};
</script>
