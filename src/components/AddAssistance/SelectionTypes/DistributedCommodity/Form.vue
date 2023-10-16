<template>
	<form @submit.prevent="submitForm" class="mb-6">
		<section class="modal-card-body pb-6">
			<MultiSelectWithLabel
				v-model="formModel.modality"
				name="modality"
				label="Modality"
				validated-field-name="modality"
				:options="options.modalities"
				:loading="loading.modalities"
				:validation="getValidations"
				@select="onModalitySelect"
			/>

			<MultiSelectWithLabel
				v-model="formModel.modalityType"
				name="modality-type"
				label="Modality Type"
				validated-field-name="modalityType"
				:options="options.types"
				:loading="loading.types"
				:validation="getValidations"
				@select="onModalityTypeSelect"
			/>

			<MultiSelectWithLabel
				v-if="displayedFields.division"
				name="division"
				label="Distribute"
				validated-field-name="division"
				v-model="formModel.division"
				:options="options.division"
				:validation="getValidations"
				@select="onDivisionSelect"
			/>

			<b-field
				v-if="displayedFields.unit"
				label-for="unit"
				:label="$t('Unit 1')"
				:type="validateType('unit')"
				:message="validateMsg('unit')"
			>
				<b-input
					v-model="formModel.unit"
					id="unit"
					name="unit"
					@blur="validate('unit')"
				/>
			</b-field>

			<template v-if="showDivisionFields">
				<b-field
					v-for="(divisionField, i) in $v.formModel[divisionFieldsValidationString].$each.$iter"
					:key="i"
					:type="validateType(divisionField)"
					:message="validateMsg(divisionField)"
					:label="divisionFields[divisionFieldsValidationString][i].label"
				>
					<b-field>
						<b-input
							v-model.number="divisionField.value.$model"
							type="number"
							min="1"
							expanded
							:controls="false"
							:class="validateMultiselect(divisionField)"
							@keydown="validate(divisionField)"
							@blur="validate(divisionField)"
						/>
					</b-field>
				</b-field>
			</template>

			<b-field
				v-if="displayedFields.quantity"
				label-for="quantity"
				:label="$t('Quantity 1')"
				:type="validateType('quantity')"
				:message="validateMsg('quantity')"
			>
				<b-numberinput
					v-model="formModel.quantity"
					id="quantity"
					name="quantity"
					type="is-dark"
					expanded
					min="1"
					:controls="false"
					@blur="validate('quantity')"
					@input="checkQuantityOrValue"
				/>
			</b-field>

			<b-field
				v-if="displayedFields.value"
				label-for="value"
				:type="validateType('value')"
				:message="validateMsg('value')"
			>
				<template #label>
					{{ $t(isModalityVoucher ? "Total Value of Booklet" : "Value") }}
					<span v-if="isModalityInKind" class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>

				<b-numberinput
					v-model="formModel.value"
					id="value"
					name="value"
					type="is-dark"
					expanded
					min="1"
					:controls="false"
					@blur="validate('value')"
					@input="checkQuantityOrValue"
				/>
			</b-field>

			<MultiSelectWithLabel
				v-if="displayedFields.currency"
				v-model="formModel.currency"
				name="currency"
				label="Currency"
				validated-field-name="currency"
				:options="options.currencies"
				:is-optional="isModalityInKind"
				:validation="getValidations"
			/>

			<b-field
				v-if="displayedFields.secondUnit"
				label-for="second-unit"
				:type="validateType('secondUnit')"
				:message="validateMsg('secondUnit')"
			>
				<template #label>
					{{ $t("Unit 2") }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>

				<b-input
					v-model="formModel.secondUnit"
					id="second-unit"
					name="second-unit"
					@blur="validate('secondUnit')"
				/>
			</b-field>

			<b-field
				v-if="displayedFields.secondQuantity"
				label-for="second-quantity"
				:label="$t('Quantity 2')"
				:type="validateType('secondQuantity')"
				:message="validateMsg('secondQuantity')"
			>
				<template #label>
					{{ $t("Quantity 2") }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>

				<b-numberinput
					v-model="formModel.secondQuantity"
					id="second-quantity"
					name="second-quantity"
					type="is-dark"
					expanded
					min="1"
					:controls="false"
					@blur="validate('secondQuantity')"
				/>
			</b-field>

			<b-field
				v-if="displayedFields.dateExpiration"
				:label="$t('Expiration Date')"
			>
				<b-datepicker
					v-model="formModel.dateExpiration"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					:min-date="minDateOfDistribution"
					:max-date="maxDateOfAssistance"
					:month-names="months()"
					:placeholder="$t('Click to select')"
				/>
			</b-field>

			<b-field
				v-if="displayedFields.description"
				:type="validateType('description')"
				:message="validateMsg('description')"
				:label="$t('Description')"
			>
				<b-input
					v-model="formModel.description"
					@blur="validate('description')"
				/>
			</b-field>

			<b-field
				v-if="displayedFields.remoteDistributionAllowed"
				:label="$t('Remote Distribution Enabled')"
			>
				<b-checkbox v-model="formModel.remoteDistributionAllowed" />
			</b-field>

			<b-field
				v-if="displayedFields.allowedProductCategoryTypes"
				:label="$t('Allowed Product Category Types')"
				:type="validateType('allowedProductCategoryTypes')"
				:message="validateMsg('allowedProductCategoryTypes')"
				:addons="false"
			>
				<div
					v-for="item of project.allowedProductCategoryTypes"
					class="mb-3"
					:key="`product-category-type-${item}`"
				>
					<b-checkbox
						v-model="formModel.allowedProductCategoryTypes"
						:native-value="item"
						@blur="validate('allowedProductCategoryTypes')"
						@input="checkAllowedProductCategoryTypes"
					>
						<div class="is-flex is-align-items-center">
							{{ item }}
							<SvgIcon class="ml-2" :items="[{code: item, value: item}]" />
						</div>
					</b-checkbox>
				</div>
			</b-field>

			<b-field
				v-if="formModel.allowedProductCategoryTypes.includes(CASHBACK)"
				:type="validateType('cashbackLimit')"
				:message="validateMsg('cashbackLimit', this.cashbackLimitErrorMessage)"
				:label="$t('Cashback Limit')"
			>
				<b-numberinput
					v-model="formModel.cashbackLimit"
					type="is-dark"
					expanded
					:disabled="cashbackLimitDisabled"
					:controls="false"
					@blur="validate('cashbackLimit')"
					@input="checkCashbackLimit"
				/>
			</b-field>
		</section>

		<footer class="modal-card-foot">
			<b-button @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				class="is-primary"
				native-type="submit"
			>
				{{ $t(submitButtonLabel) }}
			</b-button>
		</footer>
	</form>
</template>

<script>
import { maxValue, minValue, required, requiredIf } from "vuelidate/lib/validators";
import AssistancesService from "@/services/AssistancesService";
import MultiSelectWithLabel from "@/components/Inputs/MultiSelectWithLabel";
import SvgIcon from "@/components/SvgIcon";
import calendarHelper from "@/mixins/calendarHelper";
import validation from "@/mixins/validation";
import { Notification } from "@/utils/UI";
import { ASSISTANCE, CURRENCIES } from "@/consts";

export default {
	name: "DistributedCommodityForm",

	components: {
		SvgIcon,
		MultiSelectWithLabel,
	},

	mixins: [validation, calendarHelper],

	validations() {
		/* eslint-disable func-names */
		return {
			formModel: {
				modality: { required },
				modalityType: { required },
				division: {
					required: requiredIf(function () {
						return this.displayedFields.division;
					}),
				},
				unit: {
					required: requiredIf(function () {
						return this.displayedFields.unit;
					}),
				},
				quantity: {
					required: requiredIf(function () {
						return this.displayedFields.quantity;
					}),
					minValue: minValue(1),
				},
				value: {
					required: requiredIf(function () {
						return this.displayedFields.value && !this.isModalityInKind;
					}),
					minValue: minValue(1),
				},
				currency: {
					required: requiredIf(function () {
						return this.displayedFields.currency && !this.isModalityInKind;
					}),
				},
				secondUnit: {
					required: false,
				},
				secondQuantity: {
					required: false,
					minValue: minValue(1),
				},
				divisionNwsFields: {
					$each: {
						value: {
							required: requiredIf(function () {
								return this.displayedFields.householdMembersNwsFields;
							}),
						},
					},
				},
				divisionNesFields: {
					$each: {
						value: {
							required: requiredIf(function () {
								return this.displayedFields.householdMembersNesFields;
							}),
						},
					},
				},
				description: {
					required: requiredIf(function () {
						return this.displayedFields.description;
					}),
				},
				allowedProductCategoryTypes: {
					required: requiredIf(function () {
						return this.displayedFields.allowedProductCategoryTypes;
					}),
				},
				cashbackLimit: {
					required: requiredIf((form) => form.allowedProductCategoryTypes.includes(this.CASHBACK)),
					minValue: minValue(1),
					maxValue: maxValue(this.maxCashback),
				},
			},
		};
		/* eslint-enable func-names */
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
				division: [
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
				],
			},
			loading: {
				modalities: false,
				types: false,
			},
		};
	},

	computed: {
		cashbackLimitDisabled() {
			return this.formModel[this.valueOrQuantity] >= 1
				&& this.formModel.cashbackLimit === this.formModel[this.valueOrQuantity]
				&& this.formModel.allowedProductCategoryTypes.length === 1
				&& this.formModel.allowedProductCategoryTypes.includes(this.CASHBACK);
		},

		cashbackLimitErrorMessage() {
			return `Required minimum is 1, maximum is ${this.maxCashback}`;
		},

		maxCashback() {
			let max = this.formModel[this.valueOrQuantity];

			if (this.formModel.divisionNesFields) {
				max = Math.max(...this.formModel.divisionNesFields.map((item) => item.value), max);
			}

			if (this.formModel.divisionNwsFields) {
				max = Math.max(...this.formModel.divisionNwsFields.map((item) => item.value), max);
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
				{ label: this.$t(`${this.valueOrQuantityLabel} (1 - 3 members)`), fieldName: "quantityNwsField1" },
				{ label: this.$t(`${this.valueOrQuantityLabel} (4 - 5 members)`), fieldName: "quantityNwsField2" },
				{ label: this.$t(`${this.valueOrQuantityLabel} (6 - 8 members)`), fieldName: "quantityNwsField3" },
				{ label: this.$t(`${this.valueOrQuantityLabel} (9+ members)`), fieldName: "quantityNwsField4" },
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

		getValidations() {
			return this.$v;
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

	created() {
		this.fetchModalities();
	},

	methods: {
		checkQuantityOrValue() {
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
						division: this.targetType === ASSISTANCE.TARGET.HOUSEHOLD,
						currency: true,
						value: true,
					};

					break;
				case ASSISTANCE.COMMODITY.SMARTCARD:
					this.displayedFields = {
						...ASSISTANCE.DEFAULT_DISPLAYED_FIELDS,
						division: this.targetType === ASSISTANCE.TARGET.HOUSEHOLD,
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
						division: this.targetType === ASSISTANCE.TARGET.HOUSEHOLD,
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

		onDivisionSelect({ code }) {
			this.displayedFields.value = this.isModalityInKind;
			this.displayedFields.quantity = false;
			this.displayedFields.householdMembersNwsFields = false;
			this.displayedFields.householdMembersNesFields = false;

			switch (code) {
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_HOUSEHOLD:
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBER_CODE:
					this.displayedFields.currency = true;
					this.displayedFields.value = true;
					this.displayedFields.quantity = this.isModalityInKind;

					break;
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_CODE:
					this.displayedFields.currency = true;
					this.displayedFields.householdMembersNwsFields = true;

					break;
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_CODE:
					this.displayedFields.currency = true;
					this.displayedFields.householdMembersNesFields = true;

					break;
				default:
					console.error("Unknown division type");

					break;
			}
		},

		async fetchModalities() {
			this.loading.modalities = true;

			await AssistancesService.getListOfModalities()
				.then(({ data }) => { this.options.modalities = data; })
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Modalities")} ${e}`, "is-danger");
				});

			this.loading.modalities = false;
		},

		async fetchModalityTypes(code) {
			this.loading.types = true;

			await AssistancesService.getListOfModalityTypes(code)
				.then(({ data }) => {
					this.options.types = data;
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Modality Types")}${e}`, "is-danger");
				});

			this.loading.types = false;
		},

		submitForm() {
			this.$v.$touch();

			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", {
				...this.formModel,
				...(this.isModalityTypeSmartCard && {
					dateExpiration: this.$moment(this.formModel.dateExpiration).format("YYYY-MM-DD"),
				}),
			});
			this.$v.$reset();
		},

		closeForm() {
			this.$emit("formClosed");
		},
	},
};
</script>

<style lang="scss">
.relative-select {
	.multiselect__content-wrapper {
		position: relative;
	}
}

.b-numberinput input[type=number] {
	text-align: left !important;
}
</style>
