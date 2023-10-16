<template>
	<b-field
		class="name-field"
		:label="$t('Name of Assistance')"
		:type="validateType('assistanceName')"
		:message="validateMsg('assistanceName')"
	>
		<b-input
			v-model.trim="assistanceName"
			class="name-input"
			type="text"
			maxlength="70"
			:placeholder="$t('Will be generated')"
			:disabled="!isCustom || isSwitchDisabled"
			@input="isValid"
		/>
		<p class="control">
			<b-field class="name-switch">
				<b-switch
					v-model="isCustom"
					:disabled="isSwitchDisabled"
				>
					{{ $t("Custom") }}
				</b-switch>
			</b-field>
		</p>
	</b-field>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import validation from "@/mixins/validation";

export default {
	name: "AssistanceName",

	mixins: [validation],

	validations: {
		assistanceName: { required },
	},

	props: {
		value: {
			type: String,
			required: true,
		},

		duplicateAssistance: {
			type: Boolean,
			default: false,
		},

		isSwitchDisabled: {
			type: Boolean,
			default: false,
		},

		assistanceDetail: {
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
			customName: "",
			firstLoad: false,
		};
	},

	computed: {
		assistanceName: {
			get() {
				if (this.setupAssistanceName(this.dataForAssistanceName) !== this.value) {
					if (this.isCustomNameLoaded) {
						return this.setCopyIntoAssistanceName();
					}
					return this.value;
				}
				return this.value;
			},

			set(value) {
				this.$emit("input", value);
			},
		},

		isCustomNameLoaded() {
			return this.duplicateAssistance && this.isCustom
				&& !this.firstLoad && !this.isCopyAdded;
		},
	},

	watch: {
		dataForAssistanceName: {
			handler(value) {
				if (!this.isCustom) {
					this.assistanceName = this.setupAssistanceName(value);
				}

				if (this.duplicateAssistance) {
					const assistanceBeforeDuplicated = {
						...value,
						dateOfAssistance: new Date(this.dataBeforeDuplicated?.dateDistribution),
						round: {
							value: this.dataBeforeDuplicated?.round,
							code: this.dataBeforeDuplicated?.round,
						},
					};

					if (!this.customName
						&& this.setupAssistanceName(assistanceBeforeDuplicated) === this.value) {
						this.firstLoad = true;
					}

					if (assistanceBeforeDuplicated && !this.firstLoad
						&& this.setupAssistanceName(assistanceBeforeDuplicated) !== this.value) {
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
		if (this.assistanceDetail) {
			if (this.setupAssistanceName(this.dataForAssistanceName) !== this.value) {
				this.setDefaultValuesForCustomName();
			}
		}
	},

	methods: {
		isValid() {
			this.$v.assistanceName.$touch();
			this.validate("assistanceName");
			return !this.$v.$invalid;
		},

		setDefaultValuesForCustomName() {
			this.isCustom = true;
			this.customName = this.value;
			this.assistanceName = this.value;
		},

		setCopyIntoAssistanceName() {
			this.isCopyAdded = true;

			return this.value.includes(`- ${this.$t("copy")}`)
				? this.value
				: `${this.value} - ${this.$t("copy")}`;
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

<style lang="scss">
.name-field {
	.name-input {
		width: 100%;
	}
	.name-switch {
		margin-left: 10px;
		margin-top: 5px;
	}
	.control {
		.help.counter {
			position: absolute;
			right: 0;
		}
	}
}
</style>
