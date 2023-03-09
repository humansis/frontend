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
			maxlength="80"
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
import { normalizeExportDate } from "@/utils/datagrid";

export default {
	name: "AssistanceName",

	mixins: [validation],

	data() {
		return {
			isCustom: false,
			customName: "",
			firstLoad: false,
		};
	},

	validations: {
		assistanceName: { required },
	},

	mounted() {
		if (this.assistanceDetail) {
			if (this.setupAssistanceName(this.dataForAssistanceName) !== this.value) {
				this.setDefaultValuesForCustomName();
			}
		}
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

	computed: {
		assistanceName: {
			get() {
				if (this.setupAssistanceName(this.dataForAssistanceName) !== this.value) {
					if (this.duplicateAssistance && this.isCustom) {
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

			const dateOfAssistance = normalizeExportDate(
				assistance.dateOfAssistance,
			);

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
