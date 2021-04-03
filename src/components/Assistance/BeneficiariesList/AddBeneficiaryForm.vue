<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<p v-if="!formModel.removingId" class="mb-5">
				{{ $t('Please select the beneficiaries that you want to add to the') }}
				<strong>{{ assistance.name }}</strong>{{ $t('distribution') }}.
			</p>
			<p v-if="formModel.removingId" class="mb-5">
				{{ $t('You are about to remove this beneficiary from') }}
				<strong>{{ assistance.name }}</strong>
				{{ $t('distribution') }}.<br>
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

					label="name"
					track-by="id"
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
								{{ `${props.option.localFamilyName} ${props.option.localGivenName}` }}
							</span>
						</div>
					</template>
					<template #option="props">
						<div class="option__desc">
							<span class="option__title">
								{{ `${props.option.localFamilyName} ${props.option.localGivenName}` }}
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
import validation from "@/mixins/validation";
import { required, requiredIf } from "vuelidate/lib/validators";

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
			options: {
				beneficiaries: [],
			},
			loading: {
				beneficiaries: true,
			},
		};
	},

	mixins: [validation],

	mounted() {
		if (!this.formModel.removingId) this.fetchBeneficiariesByProject();
		this.formModel.justification = "";
		this.formModel.beneficiaries = [];
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			if (!this.$v.$invalid) {
				if (this.formModel.removingId) {
					this.$emit("removingSubmitted", this.formModel);
				} else {
					this.$emit("addingSubmitted", this.formModel);
				}
			}
		},

		async fetchBeneficiariesByProject() {
			const { projectId } = this.$route.params;

			await BeneficiariesService.getBeneficiariesByProject(projectId, this.assistance.target)
				.then(({ data }) => {
					this.options.beneficiaries = data;
				}).catch((e) => {
					Notification(`${this.$t("Project Beneficiaries")} ${e}`, "is-danger");
				});
			this.loading.beneficiaries = false;
		},

		closeForm() {
			this.$emit("formClosed");
		},

	},
};
</script>
