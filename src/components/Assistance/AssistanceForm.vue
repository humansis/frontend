<template>
	<v-card-text>
		<h3 class="text-h5">{{ $t('Basic properties') }}</h3>

		<AssistanceName
			v-model="formModel.name"
			ref="assistanceName"
			:is-switch-disabled="isAssistanceValidated"
			:data-for-assistance-name="dataForAssistanceName"
			assistance-detail
		/>

		<p
			v-if="influenceDistributionProtocol.assistanceName"
			class="text-caption text-red mb-3"
		>
			{{ distributionProtocolMessage }}
		</p>

		<LocationForm
			ref="locationForm"
			:form-model="formModel"
			:disabled-adm="disabledAdmInput"
			:disabled-adm-clear="disabledAdmInput"
			:influence-distribution-protocol="influenceDistributionProtocol"
			distribution-protocol-message="TSASAGASGASGAS"
			is-editing
			@locationChanged="valuesForAssistanceName"
		/>

		<DatePicker
			v-model="formModel.dateDistribution"
			:min-date="minDateOfAssistance"
			:max-date="maxDateOfAssistance"
			:disabled="!isAssistanceNew"
			label="Date of Assistance"
			name="date-of-assistance"
			@blur="valuesForAssistanceName"
		/>

		<DataSelect
			v-model="formModel.round"
			:items="options.rounds"
			:disabled="isAssistanceValidated"
			:is-clearable="false"
			label="Round"
			name="round"
			item-title="value"
			item-value="code"
			is-search-enabled
		/>

		<p
			v-if="influenceDistributionProtocol.round"
			class="text-caption text-red mb-3"
		>
			{{ distributionProtocolMessage }}
		</p>

		<h3 class="text-h5 mt-4">{{ $t('Target') }}</h3>

		<DataInput
			v-model="formModel.sector"
			label="Sector"
			name="sector"
			class="mt-4 mb-6"
			disabled
		/>

		<DataInput
			v-model="subSectorName"
			label="Subsector"
			name="subsector"
			class="mb-6"
			disabled
		/>

		<DataInput
			v-model="formModel.type"
			label="Assistance Type"
			name="assistance-type"
			class="mb-6"
			disabled
		/>

		<DataInput
			v-model="formModel.target"
			label="Target"
			name="target"

			class="mb-6"
			disabled
		/>

		<v-textarea
			v-model.trim="formModel.note"
			:label="$t('Note')"
			name="note"
			variant="outlined"
			density="compact"
			hide-details="auto"
			class="mb-6"
			auto-grow
		/>

		<h3 class="text-h5 mt-4">{{ $t('Selection Criteria') }}</h3>

		<v-row class="mt-4">
			<v-col cols="8">
				<DataInput
					v-model="scoringType"
					label="Scoring"
					name="scoring"
					disabled
				/>
			</v-col>

			<v-col>
				<DataInput
					v-model="minimumVulnerabilityScore"
					label="Minimum Vulnerability Score"
					name="minimum-vulnerability-score"
					class="mb-6"
					disabled
				/>
			</v-col>
		</v-row>

		<h3 v-if="isCommoditySmartCard" class="text-h5 mt-4">
			{{ $t('Distributed Commodity') }}
		</h3>

		<div v-if="isCommoditySmartCard">
			<div
				v-for="(productCategoryType) of project.allowedProductCategoryTypes"
				:key="`product-category-type-${productCategoryType}`"
				class="category-types"
			>
				<v-checkbox
					v-model="formModel.allowedProductCategoryTypes"
					:label="productCategoryType"
					:value="productCategoryType"
					hide-details="auto"
					disabled
				>
					<template v-slot:label>
						{{ $t(productCategoryType) }}

						<SvgIcon
							:items="getCodeAndValueObject(productCategoryType)"
							class="ml-2"
						/>
					</template>
				</v-checkbox>
			</div>
		</div>

		<DataInput
			v-if="formModel.cashbackLimit && isCommoditySmartCard"
			v-model="formModel.cashbackLimit"
			label="Cashback Limit"
			name="cashback-limit"
			class="mb-6 mt-5"
			disabled
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			class="text-none"
			size="small"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="closeForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<ButtonAction
			:is-confirm-action="isDataModifiedForDistributionProtocol"
			:confirm-message="updateButtonMessage"
			:is-only-icon="false"
			label="Update"
			confirm-title="Do you really want to apply the change?"
			close-button-name="No"
			confirm-button-name="Yes"
			confirm-button-color="warning"
			prepend-icon="circle-exclamation"
			prepend-icon-color="warning"
			default-button
			@actionConfirmed="submitForm"
		/>
	</v-card-actions>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import SectorsService from "@/services/SectorsService";
import AssistanceName from "@/components/Assistance/AssistanceName";
import ButtonAction from "@/components/ButtonAction";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DatePicker from "@/components/Inputs/DatePicker";
import LocationForm from "@/components/Inputs/LocationForm";
import SvgIcon from "@/components/SvgIcon";
import validation from "@/mixins/validation";
import { getCodeAndValueObject } from "@/utils/codeList";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";
import { required } from "@vuelidate/validators";

export default {
	name: "AssistanceForm",

	components: {
		AssistanceName,
		DatePicker,
		DataSelect,
		DataInput,
		LocationForm,
		ButtonAction,
		SvgIcon,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				name: { required },
			},
		};
	},

	props: {
		formModel: Object,
		editing: Boolean,

		assistance: {
			type: Object,
			default: () => {},
		},

		project: {
			type: Object,
			default: () => {},
		},
	},

	data() {
		return {
			options: {
				rounds: ASSISTANCE.ROUNDS_OPTIONS,
				allowedProductCategoryTypes: [
					"Food", "Non-Food", "Cashback",
				],
			},
			dataForAssistanceName: {},
			defaultScoringType: AssistancesService.getDefaultScoringType(),
			subSectorName: "",
			influenceDistributionProtocol: {
				assistanceName: false,
				subDistrict: false,
				village: false,
				round: false,
			},
			updateButtonMessage: "By changing data on a closed distribution, you may create"
				+ " a discrepancy between data in Humansis and data in the signed distribution "
				+ "protocol. Please check you gave your name and provided reasoning for the change "
				+ "in the Note section of the distribution to serve for auditing purposes.",
		};
	},

	computed: {
		maxDateOfAssistance() {
			const { endDate } = this.project;
			return new Date(`${endDate} 00:00`);
		},

		minDateOfAssistance() {
			const { startDate } = this.project;
			return new Date(`${startDate} 00:00`);
		},

		isCommoditySmartCard() {
			return this.formModel?.commodity[0]?.code === ASSISTANCE.COMMODITY.SMARTCARD;
		},

		isAssistanceNew() {
			return this.assistance.state.code === ASSISTANCE.STATUS.NEW;
		},

		isAssistanceValidated() {
			return this.assistance.state.code === ASSISTANCE.STATUS.VALIDATED;
		},

		isAssistanceClosed() {
			return this.assistance.state.code === ASSISTANCE.STATUS.CLOSED;
		},

		disabledAdmInput() {
			return {
				adm1: true,
				adm2: true,
				adm3: this.isAssistanceValidated,
				adm4: this.isAssistanceValidated,
			};
		},

		isDataModifiedForDistributionProtocol() {
			return Object.values(this.influenceDistributionProtocol).some((value) => value === true);
		},

		distributionProtocolMessage() {
			return this.$t("By changing data on a closed distribution, you may create a discrepancy"
				+ " between data in Humansis and data in the signed distribution protocol. Please "
				+ "give your name and provide reasoning for the change in the Note section of the "
				+ "distribution to serve for auditing purposes.");
		},

		scoringType() {
			if (!this.isAssistanceTargetInstitution) {
				return this.assistance.scoringBlueprint?.name || this.defaultScoringType.name;
			}

			return this.$t("N/A");
		},

		minimumVulnerabilityScore() {
			return this.assistance.threshold || "";
		},

		isAssistanceTargetInstitution() {
			return this.assistance.target.toLowerCase() === ASSISTANCE.TARGET.INSTITUTION;
		},
	},

	watch: {
		"formModel.name": function assistanceName(value) {
			this.influenceDistributionProtocol.assistanceName = this.assistance.name !== value
				&& this.isAssistanceClosed;
		},
		"formModel.adm3.name": function subDistrictName(value) {
			this.influenceDistributionProtocol.subDistrict = this.assistance.adm3?.name !== value
				&& this.isAssistanceClosed;
		},
		"formModel.adm4.name": function villageName(value) {
			this.influenceDistributionProtocol.village = this.assistance.adm4?.name !== value
				&& this.isAssistanceClosed;
		},
		"formModel.round.value": function roundValue(value) {
			this.influenceDistributionProtocol.round = this.assistance.round !== value
				&& this.isAssistanceClosed;
		},
		"formModel.dateDistribution": function dateDistribution(value) {
			if (this.isCommoditySmartCard && this.formModel.dateExpiration < value) {
				this.formModel.dateExpiration = value;
			}
		},
	},

	created() {
		this.valuesForAssistanceName();
		this.fetchSubsectors();
	},

	methods: {
		async fetchSubsectors() {
			await SectorsService.getListOfSubSectors(this.formModel.sector)
				.then(({ data }) => {
					this.findSubsectorName(data);
				})
				.catch((e) => {
					Notification(`${this.$t("Subsectors")} ${e.message || e}`, "error");
				});
		},

		findSubsectorName(data) {
			this.subSectorName = data.find(({ code }) => code === this.formModel.subsector).value || "";
		},

		getCodeAndValueObject(value) {
			return getCodeAndValueObject(value);
		},

		submitForm() {
			this.v$.$touch();
			const isValid = !this.v$.$invalid && this.$refs.assistanceName.isValid();

			const data = {
				id: this.formModel.id,
				note: this.formModel.note,
				...(!this.isAssistanceValidated && {
					name: this.formModel.name,
					round: this.formModel.round?.code,
					locationId: this.formModel.locationId,
				}),
				...(this.isAssistanceNew && {
					dateDistribution: this.formModel.dateDistribution,
					dateExpiration: this.formModel.dateExpiration,
				}),
			};

			if (isValid) {
				this.$emit("formSubmitted", data);
				this.closeForm();
			}
		},

		closeForm() {
			this.$emit("formClosed");
		},

		confirmUpdate(data) {
			const message = this.$t("By changing data on a closed distribution, you may create"
				+ " a discrepancy between data in Humansis and data in the signed distribution "
				+ "protocol. Please check you gave your name and provided reasoning for the change "
				+ "in the Note section of the distribution to serve for auditing purposes.");

			this.$buefy.dialog.confirm({
				title: this.$t("Do you really want to apply the change?"),
				message,
				confirmText: this.$t("Yes"),
				cancelText: this.$t("No"),
				type: "is-warning",
				hasIcon: true,
				onConfirm: () => {
					this.$emit("formSubmitted", data);
					this.closeForm();
				},
			});
		},

		valuesForAssistanceName() {
			const {
				adm1,
				adm2,
				adm3,
				adm4,
				dateDistribution,
				round,
			} = this.formModel;

			this.dataForAssistanceName = {
				adm1,
				adm2,
				adm3,
				adm4,
				dateOfAssistance: dateDistribution,
				round,
			};
		},
	},
};
</script>
