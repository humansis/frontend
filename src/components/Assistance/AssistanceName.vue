<template>
	<div class="d-flex assistance-name">
		<DataInput
			v-model.trim="assistanceName"
			:disabled="!isCustom || isSwitchDisabled"
			:error-messages="validationMsg('assistanceName')"
			label="Name of Assistance"
			name="name-of-assistance"
			placeholder="Will be generated"
			class="mt-4 mb-5"
			maxlength="70"
			persistent-placeholder
			@input="onIsValid"
		/>

		<v-switch
			v-model="isCustom"
			:label="$t('Custom')"
			:disabled="isSwitchDisabled"
			color="primary"
			class="custom"
			hide-details="auto"
		/>
	</div>
</template>

<script>
import { required } from "@vuelidate/validators";
import DataInput from "@/components/Inputs/DataInput";
import validation from "@/mixins/validation";

export default {
	name: "AssistanceName",

	components: {
		DataInput,
	},

	mixins: [validation],

	validations() {
		return {
			assistanceName: { required },
		};
	},

	props: {
		modelValue: {
			type: String,
			required: true,
		},

		isAssistanceDuplicated: {
			type: Boolean,
			default: false,
		},

		isSwitchDisabled: {
			type: Boolean,
			default: false,
		},

		isAssistanceDetail: {
			type: Boolean,
			default: false,
		},

		dataForAssistanceName: {
			type: Object,
			default: () => {},
		},

		dataBeforeDuplicated: {
			type: Object,
			default: () => {},
		},
	},

	data() {
		return {
			isCustom: false,
			isCopyAdded: false,
			isFirstLoad: false,
			customName: "",
		};
	},

	computed: {
		assistanceName: {
			get() {
				if (this.setupAssistanceName(this.dataForAssistanceName) !== this.modelValue
					&& this.isCustomNameLoaded) {
					return this.setCopyIntoAssistanceName();
				}
				return this.modelValue;
			},

			set(value) {
				this.$emit("update:modelValue", value);
			},
		},

		isCustomNameLoaded() {
			return this.isAssistanceDuplicated && this.isCustom
				&& !this.isFirstLoad && !this.isCopyAdded;
		},
	},

	watch: {
		dataForAssistanceName: {
			handler(value) {
				if (!this.isCustom) {
					this.assistanceName = this.setupAssistanceName(value);
				}

				if (this.isAssistanceDuplicated) {
					const roundBeforeDuplicated = this.dataBeforeDuplicated?.round;
					const assistanceBeforeDuplicated = {
						...value,
						dateOfAssistance: new Date(this.dataBeforeDuplicated?.dateDistribution),
						round: {
							value: roundBeforeDuplicated,
							code: roundBeforeDuplicated,
						},
					};

					if (!this.customName
						&& this.setupAssistanceName(assistanceBeforeDuplicated) === this.modelValue) {
						this.isFirstLoad = true;
					}

					if (assistanceBeforeDuplicated && !this.isFirstLoad
						&& this.setupAssistanceName(assistanceBeforeDuplicated) !== this.modelValue) {
						this.setDefaultValuesForCustomName();
					}
				}
			},
			deep: true,
		},

		assistanceName(value) {
			if (this.isCustom) {
				this.customName = value;
			}
		},

		isCustom(value) {
			if (!value) {
				this.assistanceName = this.setupAssistanceName(this.dataForAssistanceName);
			} else if (this.customName) {
				this.assistanceName = this.customName;
			}
		},
	},

	mounted() {
		if (this.isAssistanceDetail) {
			if (this.setupAssistanceName(this.dataForAssistanceName) !== this.modelValue) {
				this.setDefaultValuesForCustomName();
			}
		}
	},

	methods: {
		onIsValid() {
			this.v$.assistanceName.$touch();
			this.onValidate("assistanceName");

			return !this.v$.$invalid;
		},

		setDefaultValuesForCustomName() {
			this.isCustom = true;
			this.customName = this.modelValue;
			this.assistanceName = this.modelValue;
		},

		setCopyIntoAssistanceName() {
			this.isCopyAdded = true;

			return this.modelValue.includes(`- ${this.$t("copy")}`)
				? this.modelValue
				: `${this.modelValue} - ${this.$t("copy")}`;
		},

		setupAssistanceName(assistance) {
			const adm = assistance.adm4?.name
				|| assistance.adm3?.name
				|| assistance.adm2?.name
				|| assistance.adm1?.name;

			const round = assistance.round?.value;

			const dateOfAssistance = this.$moment(assistance.dateOfAssistance).format("YYYY-MM-DD");

			const roundName = round && round !== "N/A"
				? ` #${round}`
				: "";

			return (adm && dateOfAssistance)
				? `${adm}${roundName} • ${dateOfAssistance}`
				: "";
		},
	},
};
</script>

<style lang="scss" scoped>
.assistance-name .custom {
	max-width: 10rem;
	padding: .2rem 0 0 2rem
}
</style>
