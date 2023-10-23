<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body overflow-visible">
			<p v-if="!formModel.removingId" class="mb-5">
				{{ $t('Please select the beneficiaries that you want to add to the') }}
				<strong>{{ assistance.name }} </strong>{{ $t('assistance') }}.
			</p>
			<p v-if="formModel.removingId" class="mb-5">
				{{ $t('You are about to remove this beneficiary from') }}
				<strong>{{ assistance.name }}</strong> {{ $t('assistance') }}.<br>
				{{ $t('Do you wish to continue?') }}
			</p>
			<b-field
				v-if="!formModel.removingId"
				:label="$t('Beneficiaries')"
				:type="validateType('beneficiaries')"
				:message="validateMsg('beneficiaries')"
			>
				<MultiSelect
					v-model="formModel.beneficiaries"
					searchable
					multiple
					track-by="id"
					:label="multiselectLabel"
					:placeholder="$t('Click to select')"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					:loading="loading.beneficiaries"
					:disabled="formDisabled"
					:options="beneficiariesOptions"
					:class="validateMultiselect('beneficiaries')"
					@select="validate('beneficiaries')"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>
			<b-field
				:label="$t('Justification')"
				:type="validateType('justification')"
				:message="validateMsg('justification')"
			>
				<b-input
					v-model="formModel.justification"
					:disabled="formDisabled"
				/>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="!formDisabled"
				class="is-primary"
				native-type="submit"
				:loading="submitButtonLoading"
			>
				{{ submitButtonLabel }}
			</b-button>
		</footer>
	</form>
</template>

<script>
import { required, requiredIf } from "vuelidate/lib/validators";
import BeneficiariesService from "@/services/BeneficiariesService";
import validation from "@/mixins/validation";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import { Notification, Toast } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";

export default {
	name: "AddBeneficiaryForm",

	mixins: [validation],

	validations: {
		formModel: {
			beneficiaries: { required: requiredIf((form) => !form.removingId) },
			justification: { required },
		},
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		assistance: Object,
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
		submitForm() {
			this.$v.$touch();
			if (!this.$v.$invalid) {
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
			const { projectId } = this.$route.params;

			await BeneficiariesService.getBeneficiariesByProject(
				projectId,
				this.target,
				this.$route.params.assistanceId,
			)
				.then(({ data }) => {
					this.options.beneficiaries = data;
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Project Beneficiaries")} ${e}`, "is-danger");
				});
			this.loading.beneficiaries = false;
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
							Toast(data, "is-warning");
						} else {
							Toast(successMessage, "is-success");
						}
					})
					.catch((e) => {
						if (e.message) {
							Notification(
								`${this.$t("Beneficiary")} ${e}`,
								"is-danger",
							);
						}
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
							Toast(data, "is-warning");
						} else {
							Toast(successMessage, "is-success");
						}
					})
					.catch((e) => {
						if (e.message) {
							Notification(
								`${this.$t("Beneficiary")} ${e}`,
								"is-danger",
							);
						}
					});
			}

			this.submitButtonLoading = false;
			this.closeForm();
			this.$emit("addingOrRemovingSubmitted");
		},

		closeForm() {
			this.$emit("formClosed");
		},

	},
};
</script>
