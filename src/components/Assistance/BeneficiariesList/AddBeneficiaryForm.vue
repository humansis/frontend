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
					:loading="loading.beneficiaries"
					:disabled="formDisabled"
					:options="options.beneficiaries"
					:class="validateMultiselect('beneficiaries')"
					@select="validate('beneficiaries')"
				>
					<template #singleLabel="props">
						<div class="option__desc">
							<span class="option__title">
								{{ getOptionTitle(props.option) }}
							</span>
						</div>
					</template>
					<template #option="props">
						<div class="option__desc">
							<span class="option__title">
								{{ getOptionTitle(props.option) }}
							</span>
						</div>
					</template>
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
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification, Toast } from "@/utils/UI";
import validation from "@/mixins/validation";
import { required, requiredIf } from "vuelidate/lib/validators";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import consts from "@/utils/assistanceConst";

export default {
	name: "AddBeneficiaryForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
		assistance: Object,
	},

	validations: {
		formModel: {
			beneficiaries: { required: requiredIf((form) => !form.removingId) },
			justification: { required },
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

	mixins: [validation],

	computed: {
		multiselectLabel() {
			let result = "";

			switch (this.assistance.target) {
				case consts.TARGET.COMMUNITY:
				case consts.TARGET.INSTITUTION:
					result = "name";
					break;
				case consts.TARGET.HOUSEHOLD:
				case consts.TARGET.INDIVIDUAL:
				default:
					result = "localGivenName";
			}

			return result;
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
				case consts.TARGET.COMMUNITY:
				case consts.TARGET.INSTITUTION:
					result = option.name;
					break;
				case consts.TARGET.HOUSEHOLD:
				case consts.TARGET.INDIVIDUAL:
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
				removed: true,
				justification,
			};

			switch (this.assistance.target) {
				case consts.TARGET.COMMUNITY:
					body.communityIds = [removingId];
					break;
				case consts.TARGET.INSTITUTION:
					body.institutionIds = [removingId];
					break;
				case consts.TARGET.HOUSEHOLD:
				case consts.TARGET.INDIVIDUAL:
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
				case consts.TARGET.COMMUNITY:
					body.communityIds = getArrayOfIdsByParam(beneficiaries, "id");
					break;
				case consts.TARGET.INSTITUTION:
					body.institutionIds = getArrayOfIdsByParam(beneficiaries, "id");
					break;
				case consts.TARGET.HOUSEHOLD:
				case consts.TARGET.INDIVIDUAL:
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
				case consts.TARGET.COMMUNITY:
					assistanceTarget = "communities";
					break;
				case consts.TARGET.INSTITUTION:
					assistanceTarget = "institutions";
					break;
				case consts.TARGET.HOUSEHOLD:
				case consts.TARGET.INDIVIDUAL:
				default:
					assistanceTarget = "beneficiaries";
			}

			await BeneficiariesService.addOrRemoveBeneficiaryFromAssistance(
				this.$route.params.assistanceId,
				assistanceTarget,
				body,
			)
				.then(() => {
					Toast(successMessage, "is-success");
				})
				.catch((e) => {
					if (e.message) {
						Notification(
							`${this.$t("Beneficiary")} ${e}`,
							"is-danger",
						);
					}
				});

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
