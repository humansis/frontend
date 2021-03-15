<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Beneficiaries"
				:type="validateType('beneficiaries')"
				:message="validateMsg('beneficiaries')"
			>
				<MultiSelect
					v-model="formModel.beneficiaries"
					searchable
					placeholder="Click to select..."
					label="name"
					track-by="id"
					:loading="loading.beneficiaries"
					:disabled="formDisabled"
					:options="options.beneficiaries"
					:class="validateMultiselect('beneficiaries')"
					@select="validate('beneficiaries')"
				>
					<template slot="singleLabel" slot-scope="props">
						<div class="option__desc">
							<span class="option__title">
								{{ `${props.option.localFamilyName} ${props.option.localGivenName}` }}
							</span>
						</div>
					</template>
					<template slot="option" slot-scope="props">
						<div class="option__desc">
							<span class="option__title">
								{{ `${props.option.localFamilyName} ${props.option.localGivenName}` }}
							</span>
						</div>
					</template>
				</MultiSelect>
			</b-field>
			<b-field
				label="Justification"
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
				Close
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
import { mapState } from "vuex";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Notification } from "@/utils/UI";
import validation from "@/mixins/validation";
import { required } from "vuelidate/lib/validators";

export default {
	name: "AddBeneficiaryForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	validations: {
		formModel: {
			beneficiaries: { required },
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
		this.fetchBeneficiariesByProject();
	},

	computed: {
		...mapState(["temporaryAssistance"]),
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			if (!this.$v.$invalid) {
				this.$emit("formSubmitted", this.formModel);
			}
		},

		async fetchBeneficiariesByProject() {
			const { projectId } = this.$route.params;
			const { target } = this.temporaryAssistance;
			await BeneficiariesService.getBeneficiariesByProject(projectId, target.toLowerCase())
				.then(({ data }) => {
					this.options.beneficiaries = data;
				}).catch((e) => {
					Notification(`Project Beneficiaries ${e}`, "is-danger");
				});
			this.loading.beneficiaries = false;
		},

		closeForm() {
			this.$emit("formClosed");
		},

	},
};
</script>
