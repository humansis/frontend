<template>
	<v-card-text>
		<DataSelect
			v-model="formModel.modality"
			:items="options.modalities"
			:loading="loading.modalities"
			:error-messages="validationMsg('modality')"
			label="Modality"
			name="modality"
			class="mb-6"
			@update:modelValue="onModalitySelect"
		/>

		<DataSelect
			v-model="formModel.modalityType"
			:items="options.types"
			:loading="loading.types"
			:error-messages="validationMsg('modalityType')"
			label="Modality Type"
			name="modality-type"
			class="mb-6"
			@update:modelValue="onModalityTypeSelect"
		/>

		<DataSelect
			v-if="displayedFields.division"
			v-model="formModel.division"
			:items="divisionOptions"
			:loading="loading.division"
			:error-messages="validationMsg('division')"
			label="Distribute"
			name="division"
			class="mb-6"
			@update:modelValue="onDivisionSelect"
		/>

		<DataSelect
			v-if="displayedFields.customField"
			v-model="formModel.customField"
			:items="options.customFields"
			:loading="loading.customFields"
			:error-messages="validationMsg('customField')"
			label="Custom field"
			name="custom-field"
			class="mb-6"
			@update:modelValue="onValidate('customField')"
		/>

		<DataInput
			v-if="displayedFields.amountMultiplier"
			v-model.number="formModel.amountMultiplier"
			:error-messages="validationMsg('amountMultiplier')"
			label="Amount multiplier"
			name="amount-multiplier"
			type="number"
			min="0.01"
			step="0.01"
			class="mb-6"
			hide-spin-buttons
			@blur="onValidate('amountMultiplier')"
			@input="onCheckQuantityOrValue"
		/>

		<template v-if="displayedFields.customField && displayedFields.amountMultiplier">
			<p
				v-if="isModalityCash"
				class="text-caption pb-2"
			>
				{{ $t('Total amount = Custom field * Amount multiplier')}}
			</p>

			<p
				v-if="isModalityInKind"
				class="text-caption pb-2"
			>
				{{ $t('Quantity 1 = Custom field * Amount multiplier')}}
			</p>
		</template>

		<DataInput
			v-if="displayedFields.unit"
			v-model="formModel.unit"
			:error-messages="validationMsg('unit')"
			label="Unit 1"
			name="unit"
			class="mb-6"
			@blur="onValidate('unit')"
		/>

		<template v-if="showDivisionFields">
			<div
				v-for="(divisionField, key, i) in formModel[divisionFieldsValidationString]"
				:key="key"
			>
				<DataInput
					v-model.number="formModel[divisionFieldsValidationString][key]"
					:label="divisionFields[divisionFieldsValidationString][i].label"
					:error-messages="validationMsg(`${divisionFieldsValidationString}.${key}`)"
					name="division"
					class="mb-6"
					@blur="onValidate(`${divisionFieldsValidationString}.${key}`)"
				/>
			</div>
		</template>

		<DataInput
			v-if="displayedFields.quantity"
			v-model.number="formModel.quantity"
			:error-messages="validationMsg('quantity')"
			label="Quantity 1"
			name="quantity-one"
			type="number"
			min="1"
			class="mb-6"
			hide-spin-buttons
			@blur="onValidate('quantity')"
			@input="onCheckQuantityOrValue"
		/>

		<DataInput
			v-if="displayedFields.value"
			v-model.number="formModel.value"
			:error-messages="validationMsg('value')"
			:label="isModalityVoucher ? 'Total Value of Booklet' : 'Value'"
			:optional="isModalityInKind"
			name="value"
			type="number"
			min="1"
			class="mb-6"
			hide-spin-buttons
			@blur="onValidate('value')"
			@input="onCheckQuantityOrValue"
		/>

		<DataSelect
			v-if="displayedFields.currency"
			v-model="formModel.currency"
			:items="options.currencies"
			:error-messages="validationMsg('currency')"
			:optional="isModalityInKind"
			label="Currency"
			name="currency"
			class="mb-6"
			@update:modelValue="onValidate('currency')"
		/>

		<DataInput
			v-if="displayedFields.secondUnit"
			v-model="formModel.secondUnit"
			:error-messages="validationMsg('secondUnit')"
			label="Unit 2"
			name="unit"
			class="mb-6"
			optional
			@blur="onValidate('secondUnit')"
		/>

		<DataInput
			v-if="displayedFields.secondQuantity"
			v-model.number="formModel.secondQuantity"
			:error-messages="validationMsg('secondQuantity')"
			label="Quantity 2"
			name="quantity-two"
			type="number"
			min="1"
			class="mb-6"
			hide-spin-buttons
			@blur="onValidate('secondQuantity')"
		/>

		<DatePicker
			v-if="displayedFields.dateExpiration"
			v-model="formModel.dateExpiration"
			label="Expiration Date"
			name="expiration-date"
			:min-date="minDateOfDistribution"
			:max-date="maxDateOfAssistance"
		/>

		<DataInput
			v-if="displayedFields.description"
			v-model="formModel.description"
			:error-messages="validationMsg('description')"
			label="Description"
			name="description"
			class="mb-6"
			@blur="onValidate('description')"
		/>

		<v-checkbox
			v-if="displayedFields.remoteDistributionAllowed"
			v-model="formModel.remoteDistributionAllowed"
			:label="$t('Remote Distribution Enabled')"
			hide-details
			class="checkbox"
		/>

		<template v-if="displayedFields.allowedProductCategoryTypes">
			<h6 class="text-subtitle-1 font-weight-bold">{{ $t('Allowed Product Category Types') }}</h6>

			<div
				v-for="(productCategoryType, index) of project.allowedProductCategoryTypes"
				:key="`product-category-type-${productCategoryType}`"
				:class="['category-types', { 'last-type': isLastCategoryType(index) }] "
			>
				<v-checkbox
					v-model="formModel.allowedProductCategoryTypes"
					:label="productCategoryType"
					:value="productCategoryType"
					:error-messages="isLastCategoryType(index)
						&& validationMsg('allowedProductCategoryTypes')"
					:disabled="formDisabled"
					hide-details="auto"
					@blur="onValidate('allowedProductCategoryTypes')"
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
		</template>

		<DataInput
			v-if="formModel.allowedProductCategoryTypes.includes(CASHBACK)"
			v-model.number="formModel.cashbackLimit"
			:error-messages="validationMsg('cashbackLimit')"
			:disabled="cashbackLimitDisabled"
			label="Cashback Limit"
			name="cashback-limit"
			type="number"
			class="mb-6"
			hide-spin-buttons
			@blur="onValidate('cashbackLimit')"
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
import AssistancesService from "@/services/AssistancesService";
import CustomFieldsService from "@/services/CustomFieldsService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DatePicker from "@/components/Inputs/DatePicker";
import SvgIcon from "@/components/SvgIcon";
import assistanceHelper from "@/mixins/assistanceHelper";
import validation from "@/mixins/validation";
import { getCodeAndValueObject } from "@/utils/codeList";
import { getUniqueObjectsInArray } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { ASSISTANCE, CURRENCIES } from "@/consts";
import { maxValue, minValue, required, requiredIf } from "@vuelidate/validators";

export default {
	name: "DistributedCommodityForm",

	components: {
		DataSelect,
		DataInput,
		DatePicker,
		SvgIcon,
	},

	emits: [
		"formSubmitted",
		"formClosed",
	],

	mixins: [validation, assistanceHelper],

	validations() {
		return {
			formModel: {
				modality: { required },
				modalityType: { required },
				division: {
					required: requiredIf(this.displayedFields.division),
				},
				customField: {
					required: requiredIf(this.displayedFields.customField),
				},
				amountMultiplier: {
					required: requiredIf(this.displayedFields.amountMultiplier),
					minValue: minValue(0.01),
				},
				unit: {
					required: requiredIf(this.displayedFields.unit),
				},
				quantity: {
					required: requiredIf(this.displayedFields.quantity),
					minValue: minValue(1),
				},
				value: {
					required: requiredIf(this.displayedFields.value && !this.isModalityInKind),
					minValue: minValue(1),
				},
				currency: {
					required: requiredIf(this.displayedFields.currency && !this.isModalityInKind),
				},
				secondUnit: {
					required: false,
				},
				secondQuantity: {
					required: false,
					minValue: minValue(1),
				},
				// TODO quick fix, we will fix in the future. (no $each in new version of vuelidate)
				divisionNwsFields: {
					firstNwsFields: {
						required: requiredIf(this.displayedFields.householdMembersNwsFields),
					},
					secondNwsFields: {
						required: requiredIf(this.displayedFields.householdMembersNwsFields),
					},
					thirdNwsFields: {
						required: requiredIf(this.displayedFields.householdMembersNwsFields),
					},
					fourthNwsFields: {
						required: requiredIf(this.displayedFields.householdMembersNwsFields),
					},
					fifthNwsFields: {
						required: requiredIf(this.displayedFields.householdMembersNwsFields),
					},
				},
				divisionNesFields: {
					firstNesFields: {
						required: requiredIf(this.displayedFields.householdMembersNesFields),
					},
					secondNesFields: {
						required: requiredIf(this.displayedFields.householdMembersNesFields),
					},
					thirdNesFields: {
						required: requiredIf(this.displayedFields.householdMembersNesFields),
					},
				},
				description: {
					required: requiredIf(this.displayedFields.description),
				},
				allowedProductCategoryTypes: {
					required: requiredIf(this.displayedFields.allowedProductCategoryTypes),
				},
				cashbackLimit: {
					required: requiredIf(this.formModel.allowedProductCategoryTypes.includes(
						this.CASHBACK,
					)),
					minValue: minValue(1),
					maxValue: maxValue(this.maxCashback),
					...(this.maxCashback && { maxValue: maxValue(this.maxCashback) }),
				},
			},
		};
	},

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,

		project: {
			type: Object,
			default: () => {},
		},

		targetType: {
			type: String,
			default: "",
		},

		dateOfAssistance: {
			type: String,
			required: true,
		},

		commodity: {
			type: Array,
			default: () => [],
		},

		dateExpiration: {
			type: String,
		},
	},

	data() {
		return {
			displayedFields: ASSISTANCE.DEFAULT_DISPLAYED_FIELDS,
			CASHBACK: ASSISTANCE.COMMODITY.CASHBACK,
			options: {
				currencies: CURRENCIES,
				modalities: [],
				types: [],
				customFields: [],
			},
			loading: {
				modalities: false,
				types: false,
				customFields: false,
			},
		};
	},

	computed: {
		divisionOptions() {
			return [
				...(this.isTargetHousehold ? [
					{
						code: ASSISTANCE.COMMODITY.DISTRIBUTION.PER_HOUSEHOLD,
						value: this.$t(ASSISTANCE.COMMODITY.DISTRIBUTION.PER_HOUSEHOLD),
					},
					{
						code: ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBER_CODE,
						value: this.$t(ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBER_LABEL),
					},
					{
						code: ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_CODE,
						value: this.$t(ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_LABEL),
					},
					{
						code: ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_CODE,
						value: this.$t(ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_LABEL),
					},
				] : []),
				...(this.isTargetIndividual ? [
					{
						code: ASSISTANCE.COMMODITY.DISTRIBUTION.PER_INDIVIDUAL,
						value: this.$t(ASSISTANCE.COMMODITY.DISTRIBUTION.PER_INDIVIDUAL),
					},
				] : []),
				...(this.isCustomAmountEnabled ? [
					{
						code: ASSISTANCE.COMMODITY.DISTRIBUTION.PER_CUSTOM_AMOUNT_BY_CUSTOM_FIELD,
						value: this.$t(ASSISTANCE.COMMODITY.DISTRIBUTION.PER_CUSTOM_AMOUNT_BY_CUSTOM_FIELD),

					},
				] : []),
			];
		},

		cashbackLimitDisabled() {
			return this.formModel[this.valueOrQuantity] >= 1
				&& this.formModel.cashbackLimit === this.formModel[this.valueOrQuantity]
				&& this.formModel.allowedProductCategoryTypes.length === 1
				&& this.formModel.allowedProductCategoryTypes.includes(this.CASHBACK);
		},

		isProjectTargetsWithModalityType() {
			return this.project.targets.every((target) => target.modalityType);
		},

		cashbackLimitErrorMessage() {
			return `Required minimum is 1, maximum is ${this.maxCashback}`;
		},

		maxCashback() {
			let max = this.formModel[this.valueOrQuantity];

			if (this.formModel.divisionNesFields) {
				max = Math.max(
					...Object.values(this.formModel.divisionNesFields).map((item) => Number(item)),
				);
			}

			if (this.formModel.divisionNwsFields) {
				max = Math.max(
					...Object.values(this.formModel.divisionNwsFields).map((item) => Number(item)),
				);
			}

			return max;
		},

		showDivisionFields() {
			return this.displayedFields.householdMembersNwsFields
				|| this.displayedFields.householdMembersNesFields;
		},

		divisionFieldsValidationString() {
			return this.displayedFields.householdMembersNwsFields
				? "divisionNwsFields"
				: "divisionNesFields";
		},

		divisionFields() {
			return {
				divisionNwsFields: this.divisionNwsFields,
				divisionNesFields: this.divisionNesFields,
			};
		},

		maxDateOfAssistance() {
			const { endDate } = this.project;
			return endDate ? new Date(endDate) : new Date();
		},

		minDateOfDistribution() {
			return this.dateOfAssistance ? new Date(this.dateOfAssistance) : null;
		},

		isTargetHousehold() {
			return this.targetType === ASSISTANCE.TARGET.HOUSEHOLD;
		},

		isTargetIndividual() {
			return this.targetType === ASSISTANCE.TARGET.INDIVIDUAL;
		},

		isModalityCash() {
			return this.formModel?.modality?.code === ASSISTANCE.MODALITY.CASH;
		},

		isModalityVoucher() {
			return this.formModel?.modality?.code === ASSISTANCE.MODALITY.VOUCHER;
		},

		isModalityInKind() {
			return this.formModel?.modality?.code === ASSISTANCE.MODALITY.IN_KIND;
		},

		isModalityTypeSmartCard() {
			return this.formModel?.modalityType?.code === ASSISTANCE.COMMODITY.SMARTCARD;
		},

		divisionNwsFields() {
			return [
				{ label: this.$t(`${this.valueOrQuantityLabel} (1 member)`), fieldName: "quantityNwsField1" },
				{ label: this.$t(`${this.valueOrQuantityLabel} (2 member)`), fieldName: "quantityNwsField2" },
				{ label: this.$t(`${this.valueOrQuantityLabel} (3 member)`), fieldName: "quantityNwsField3" },
				{ label: this.$t(`${this.valueOrQuantityLabel} (4 member)`), fieldName: "quantityNwsField4" },
				{ label: this.$t(`${this.valueOrQuantityLabel} (5+ members)`), fieldName: "quantityNwsField5" },
			];
		},

		divisionNesFields() {
			return [
				{ label: this.$t(`${this.valueOrQuantityLabel} (1 - 3 members)`), fieldName: "quantityNesField1" },
				{ label: this.$t(`${this.valueOrQuantityLabel} (4 - 8 members)`), fieldName: "quantityNesField2" },
				{ label: this.$t(`${this.valueOrQuantityLabel} (9+ members)`), fieldName: "quantityNesField3" },
			];
		},

		valueOrQuantity() {
			return this.isModalityCash ? "value" : "quantity";
		},

		valueOrQuantityLabel() {
			return this.isModalityCash ? "Value" : "Quantity 1";
		},
	},

	watch: {
		"formModel.modalityType.code": function modalityType(value) {
			if (value === ASSISTANCE.COMMODITY.SMARTCARD) {
				this.formModel.dateExpiration = new Date(
					this.dateExpiration || this.project?.endDate,
				);
			}
		},
	},

	async created() {
		if (this.project.targets.length && this.isProjectTargetsWithModalityType) {
			await this.fetchModalitiesWithTypes();
		} else {
			await this.fetchModalities();
		}
	},

	methods: {
		onCheckQuantityOrValue() {
			if (this.displayedFields.allowedProductCategoryTypes
				&& this.formModel.allowedProductCategoryTypes.length === 1
				&& this.formModel.allowedProductCategoryTypes.includes(this.CASHBACK)) {
				this.formModel.cashbackLimit = this.formModel[this.valueOrQuantity];
			}

			if (this.displayedFields.allowedProductCategoryTypes
				&& !this.formModel.allowedProductCategoryTypes.includes(this.CASHBACK)) {
				this.formModel.cashbackLimit = null;
			}
		},

		checkCashbackLimit() {
			if (this.formModel.allowedProductCategoryTypes.length === 1
				&& this.formModel.allowedProductCategoryTypes.includes(this.CASHBACK)
				&& this.formModel[this.valueOrQuantity]
			) {
				this.formModel.cashbackLimit = this.formModel[this.valueOrQuantity];
			}
		},

		checkAllowedProductCategoryTypes() {
			if (this.formModel[this.valueOrQuantity] >= 1) {
				this.formModel.cashbackLimit = this.formModel[this.valueOrQuantity];
			} else {
				this.formModel.cashbackLimit = null;
			}
		},

		getCodeAndValueObject(value) {
			return getCodeAndValueObject(value);
		},

		isLastCategoryType(index) {
			return index === (this.project.allowedProductCategoryTypes.length - 1);
		},

		async onModalitySelect({ code }) {
			this.formModel.modalityType = null;
			this.displayedFields = ASSISTANCE.DEFAULT_DISPLAYED_FIELDS;
			await this.fetchModalityTypes(code);
		},

		onModalityTypeSelect({ code }) {
			this.formModel.division = null;

			switch (code) {
				case ASSISTANCE.COMMODITY.CASH:
				case ASSISTANCE.COMMODITY.MOBILE_MONEY:
					this.displayedFields = {
						...ASSISTANCE.DEFAULT_DISPLAYED_FIELDS,
						division: this.isTargetHousehold || this.isTargetIndividual,
						currency: true,
						value: true,
					};

					break;
				case ASSISTANCE.COMMODITY.SMARTCARD:
					this.displayedFields = {
						...ASSISTANCE.DEFAULT_DISPLAYED_FIELDS,
						division: this.isTargetHousehold || this.isTargetIndividual,
						currency: true,
						value: true,
						remoteDistributionAllowed: true,
						allowedProductCategoryTypes: true,
						dateExpiration: true,
					};

					break;
				case ASSISTANCE.COMMODITY.FOOD_RATIONS:
				case ASSISTANCE.COMMODITY.READY_TO_EAT_RATIONS:
				case ASSISTANCE.COMMODITY.BREAD:
				case ASSISTANCE.COMMODITY.AGRICULTURAL_KIT:
				case ASSISTANCE.COMMODITY.WASH_KIT:
				case ASSISTANCE.COMMODITY.SHELTER_TOOL_KIT:
				case ASSISTANCE.COMMODITY.HYGIENE_KIT:
				case ASSISTANCE.COMMODITY.DIGNITY_KIT:
				case ASSISTANCE.COMMODITY.NFI_KIT:
				case ASSISTANCE.COMMODITY.WINTERIZATION_KIT:
				case ASSISTANCE.COMMODITY.ACTIVITY_ITEM:
					this.displayedFields = {
						...ASSISTANCE.DEFAULT_DISPLAYED_FIELDS,
						division: this.isTargetHousehold || this.isTargetIndividual,
						unit: true,
						quantity: true,
						value: true,
						currency: true,
						secondUnit: true,
						secondQuantity: true,
						description: true,
					};

					break;
				case ASSISTANCE.COMMODITY.QR_CODE_VOUCHER:
				case ASSISTANCE.COMMODITY.PAPER_VOUCHER:
				case ASSISTANCE.COMMODITY.LOAN:
				case ASSISTANCE.COMMODITY.BUSINESS_GRANT:
					this.displayedFields = {
						...ASSISTANCE.DEFAULT_DISPLAYED_FIELDS,
						currency: true,
						value: true,
					};

					break;
				default:
					console.error("Unknown modality type");

					break;
			}
		},

		async onDivisionSelect({ code }) {
			this.displayedFields = {
				...this.displayedFields,
				value: this.isModalityInKind,
				quantity: false,
				householdMembersNwsFields: false,
				householdMembersNesFields: false,
				customField: false,
				amountMultiplier: false,
				currency: true,
			};

			switch (code) {
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_HOUSEHOLD:
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_INDIVIDUAL:
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBER_CODE:
					this.displayedFields.value = true;
					this.displayedFields.quantity = this.isModalityInKind;

					break;
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_CODE:
					this.displayedFields.householdMembersNwsFields = true;

					break;
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_CODE:
					this.displayedFields.householdMembersNesFields = true;

					break;
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_CUSTOM_AMOUNT_BY_CUSTOM_FIELD:
					this.displayedFields.customField = true;
					this.displayedFields.amountMultiplier = true;

					await this.fetchCustomFields();

					break;
				default:
					console.error("Unknown division type");

					break;
			}
		},

		async fetchModalities() {
			try {
				this.loading.modalities = true;

				const { data } = await AssistancesService.getListOfModalities();

				this.options.modalities = data;
			} catch (e) {
				Notification(`${this.$t("Modalities")} ${e.message || e}}`, "error");
			} finally {
				this.loading.modalities = false;
			}
		},

		async fetchModalitiesWithTypes() {
			try {
				this.loading.modalities = true;

				const { data } = await AssistancesService.getListOfModalitiesWithTypes();

				this.prepareModalitiesOptions(data);
			} catch (e) {
				Notification(`${this.$t("Modalities")} ${e.message || e}}`, "error");
			} finally {
				this.loading.modalities = false;
			}
		},

		async fetchModalityTypes(code) {
			try {
				this.loading.types = true;

				const { data } = await AssistancesService.getListOfModalityTypes(code);

				this.prepareModalityTypesOptions(data);
			} catch (e) {
				Notification(`${this.$t("Modality Types")}${e.message || e}`, "error");
			} finally {
				this.loading.types = false;
			}
		},

		async fetchCustomFields() {
			try {
				this.loading.customFields = true;

				const { data } = await CustomFieldsService.getListOfCustomFields(
					null,
					null,
					null,
					null,
					{ type: "number" },
				);

				this.options.customFields = data;
			} catch (e) {
				Notification(`${this.$t("Custom Fields")} ${e.message || e}`, "error");
			} finally {
				this.loading.customFields = false;
			}
		},

		onSubmitForm() {
			this.v$.$touch();

			if (this.v$.$invalid) {
				return;
			}

			// TODO quick fix, we will fix in the future. (no $each in new version of vuelidate)
			if (this.displayedFields.householdMembersNwsFields) {
				this.formModel.payloadDivisionNwsFields[0].value = this.formModel
					.divisionNwsFields.firstNwsFields;
				this.formModel.payloadDivisionNwsFields[1].value = this.formModel
					.divisionNwsFields.secondNwsFields;
				this.formModel.payloadDivisionNwsFields[2].value = this.formModel
					.divisionNwsFields.thirdNwsFields;
				this.formModel.payloadDivisionNwsFields[3].value = this.formModel
					.divisionNwsFields.fourthNwsFields;
				this.formModel.payloadDivisionNwsFields[4].value = this.formModel
					.divisionNwsFields.fifthNwsFields;
			} else {
				this.formModel.payloadDivisionNesFields[0].value = this.formModel
					.divisionNesFields.firstNesFields;
				this.formModel.payloadDivisionNesFields[1].value = this.formModel
					.divisionNesFields.secondNesFields;
				this.formModel.payloadDivisionNesFields[2].value = this.formModel
					.divisionNesFields.thirdNesFields;
			}

			this.$emit("formSubmitted", {
				...this.formModel,
				...(this.isModalityTypeSmartCard && {
					dateExpiration: this.$moment(this.formModel.dateExpiration).format("YYYY-MM-DD"),
				}),
			});
			this.v$.$reset();
		},

		onCloseForm() {
			this.$emit("formClosed");
		},

		prepareModalitiesOptions(modalities) {
			if (this.project.targets.length) {
				this.project.targets.forEach((target) => {
					Object.keys(modalities).forEach((modality) => {
						const matchedModality = modalities[modality].find(
							(modalityType) => modalityType.code === target.modalityType.code,
						);

						if (matchedModality) {
							this.options.modalities.push({ code: modality, value: this.$t(modality) });
						}
					});
				});
				this.options.modalities = getUniqueObjectsInArray(this.options.modalities, "code");
			}
		},

		prepareModalityTypesOptions(modalityTypes) {
			this.options.types = [];

			if (this.project.targets.length && this.isProjectTargetsWithModalityType) {
				this.project.targets.forEach((target) => {
					const { modalityType } = target;

					if (!modalityType) {
						return;
					}

					const matchedModalityType = modalityTypes.find(
						(type) => type.code === modalityType.code,
					);

					if (matchedModalityType) {
						this.options.types.push(modalityType);
					}
				});
				this.options.types = getUniqueObjectsInArray(this.options.types, "code");

				return;
			}

			this.options.types = modalityTypes;
		},
	},
};
</script>
