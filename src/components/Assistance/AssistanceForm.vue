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
			:distribution-protocol-message="distributionProtocolMessage"
			is-editing
			@locationChanged="onValuesForAssistanceName"
		/>

		<DatePicker
			v-model="formModel.dateDistribution"
			:min-date="minDateOfAssistance"
			:max-date="maxDateOfAssistance"
			:disabled="!isAssistanceNew"
			:hint="isDateOfAssistanceInvalidMsg"
			label="Date of Assistance"
			name="date-of-assistance"
			class="has-warning-message mb-4"
			persistent-hint
			@update:modelValue="onValuesForAssistanceName"
		/>

		<DataSelect
			v-model="formModel.round"
			:items="options.rounds"
			:disabled="isAssistanceValidated"
			:is-clearable="false"
			label="Round"
			name="round"
			class="mb-4"
			@update:modelValue="onValuesForAssistanceName"
		/>

		<DataInput
			v-model="formModel.eloNumber"
			label="ELO number"
			name="elo-number"
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
			class="my-4"
			disabled
		/>

		<DataInput
			v-model="subSectorName"
			label="Subsector"
			name="subsector"
			class="mb-4"
			disabled
		/>

		<DataInput
			v-model="formModel.type"
			label="Assistance Type"
			name="assistance-type"
			class="mb-4"
			disabled
		/>

		<DataInput
			v-model="formModel.target"
			label="Target"
			name="target"
			class="mb-4"
			disabled
		/>

		<DataTextarea
			v-model.trim="formModel.note"
			label="Note"
			name="note"
			class="mb-4"
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
					class="mb-4"
					disabled
				/>
			</v-col>
		</v-row>

		<template v-if="isCommoditySmartCard">
			<h3 class="text-h5 my-4">{{ $t('Distributed Commodity') }}</h3>

			<DatePicker
				v-model="formModel.dateExpiration"
				:min-date="formModel.dateDistribution"
				:max-date="maxDateOfAssistance"
				:disabled="!isAssistanceNew"
				label="Expiration Date"
				name="expiration-date"
				class="mb-4"
				@blur="onValuesForAssistanceName"
			/>

			<h4>{{ $t('Allowed Product Category Types') }}</h4>

			<div
				v-for="(productCategoryType, index) of project.allowedProductCategoryTypes"
				:key="`product-category-type-${productCategoryType}`"
				class="category-types"
			>
				<v-checkbox
					v-model="formModel.allowedProductCategoryTypes"
					:label="productCategoryType"
					:value="productCategoryType"
					:name="`product-category-${index}`"
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

			<DataInput
				v-if="formModel.cashbackLimit"
				v-model="formModel.cashbackLimit"
				label="Cashback Limit"
				name="cashback-limit"
				class="my-4"
				disabled
			/>
		</template>
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
			@actionConfirmed="onSubmitForm"
		/>
	</v-card-actions>
</template>

<script>
import { required } from "@vuelidate/validators";
import AssistancesService from "@/services/AssistancesService";
import SectorsService from "@/services/SectorsService";
import AssistanceName from "@/components/Assistance/AssistanceName";
import ButtonAction from "@/components/ButtonAction";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DataTextarea from "@/components/Inputs/DataTextarea";
import DatePicker from "@/components/Inputs/DatePicker";
import LocationForm from "@/components/Inputs/LocationForm";
import SvgIcon from "@/components/SvgIcon";
import validation from "@/mixins/validation";
import { getCodeAndValueObject } from "@/utils/codeList";
import { isDateBeforeOrEqual } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";

export default {
	name: "AssistanceForm",

	components: {
		DataTextarea,
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
		editing: Boolean,

		formModel: {
			type: Object,
			required: true,
		},

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

		isDateOfAssistanceInvalidMsg() {
			if (this.formModel.dateExpiration) {
				return !isDateBeforeOrEqual(
					this.formModel.dateDistribution,
					this.formModel.dateExpiration,
				)
					? this.$t("Date is after Expiration date of the commodity")
					: "";
			}

			return "";
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
		this.onValuesForAssistanceName();
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

		onSubmitForm() {
			this.v$.$touch();
			const isValid = !this.v$.$invalid && this.$refs.assistanceName.onIsValid();

			const data = {
				id: this.formModel.id,
				note: this.formModel.note,
				eloNumber: this.formModel.eloNumber,
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
				this.onCloseForm();
			}
		},

		onCloseForm() {
			this.$emit("formClosed");
		},

		onValuesForAssistanceName() {
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
