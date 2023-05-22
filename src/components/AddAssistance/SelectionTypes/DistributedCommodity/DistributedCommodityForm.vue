<template>
	<form @submit.prevent="submitForm" class="mb-6">
		<section class="modal-card-body pb-6">
			<b-field
				class="relative-select"
				:type="validateType('modality')"
				:message="validateMsg('modality')"
				:label="$t('Modality')"
			>
				<MultiSelect
					v-model="formModel.modality"
					:placeholder="$t('Click to select')"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					label="value"
					track-by="code"
					:options="options.modalities"
					searchable
					:loading="loading.modalities"
					:class="validateMultiselect('modality')"
					@select="onModalitySelect"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field
				class="relative-select"
				:type="validateType('modalityType')"
				:message="validateMsg('modalityType')"
				:label="$t('Modality Type')"
			>
				<MultiSelect
					v-model="formModel.modalityType"
					label="value"
					track-by="code"
					:placeholder="$t('Click to select')"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					:options="options.types"
					:loading="loading.types"
					searchable
					:class="validateMultiselect('modalityType')"
					@select="onModalityTypeSelect"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field
				v-if="displayedFields.unit"
				:label="$t('Unit')"
				:type="validateType('unit')"
				:message="validateMsg('unit')"
			>
				<b-input
					v-model="formModel.unit"
					@blur="validate('unit')"
				/>
			</b-field>

			<b-field
				v-if="displayedFields.division"
				:type="validateType('division')"
				:message="validateMsg('division')"
				:label="$t('Distribute')"
			>
				<MultiSelect
					v-model="formModel.division"
					label="value"
					track-by="code"
					:placeholder="$t('Click to select')"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					:options="options.division"
					:loading="loading.division"
					searchable
					:class="validateMultiselect('division')"
					@select="onDivisionSelect"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field
				v-if="displayedFields.currency"
				:type="validateType('currency')"
				:message="validateMsg('currency')"
				:label="$t('Currency')"
			>
				<MultiSelect
					v-model="formModel.currency"
					:placeholder="$t('Click to select')"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					label="value"
					track-by="value"
					:options="options.currencies"
					:class="validateMultiselect('currency')"
					searchable
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
				</MultiSelect>
			</b-field>

			<b-field
				v-if="showValue"
				:type="validateType('value')"
				:message="validateMsg('value')"
				:label="$t('Quantity')"
			>
				<b-numberinput
					v-model="formModel.value"
					type="is-dark"
					expanded
					min="0"
					:controls="false"
					@blur="validate('value')"
					@input="checkQuantity"
				/>
			</b-field>

			<b-field v-if="isModalityTypeSmartCard" :label="$t('Expiration Date')">
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

			<div v-if="showDivisionQuantities">
				<b-field
					v-for="(divisionQuantity, i)
						in $v.formModel[divisionQuantitiesValidationString].$each.$iter"
					:key="i"
					:type="validateType(divisionQuantity)"
					:message="validateMsg(divisionQuantity)"
					:label="$t(divisionQuantities[divisionQuantitiesValidationString][i].label)"
				>
					<b-field>
						<b-input
							v-model.number="divisionQuantity.value.$model"
							type="number"
							min="1"
							expanded
							:controls="false"
							:class="validateMultiselect(divisionQuantity)"
							@keydown="validate(divisionQuantity)"
							@blur="validate(divisionQuantity)"
						/>
					</b-field>
				</b-field>
			</div>

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
				v-if="displayedFields.totalValueOfBooklet"
				:type="validateType('totalValueOfBooklet')"
				:message="validateMsg('totalValueOfBooklet')"
				:label="$t('Total Value of Booklet')"
			>
				<b-input
					v-model="formModel.totalValueOfBooklet"
					@blur="validate('totalValueOfBooklet')"
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
import { minValue, maxValue, required, requiredIf } from "vuelidate/lib/validators";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import consts from "@/utils/assistanceConst";
import currencies from "@/utils/currencies";
import Validation from "@/mixins/validation";
import SvgIcon from "@/components/SvgIcon";
import calendarHelper from "@/mixins/calendarHelper";

const DEFAULT_DISPLAYED_FIELDS = {
	currency: false,
	unit: false,
	value: false,
	division: false,
	description: false,
	totalValueOfBooklet: false,
	remoteDistributionAllowed: false,
	allowedProductCategoryTypes: false,
	householdMembersNwsQuantity: false,
	householdMembersNesQuantity: false,
};

export default {
	name: "DistributedCommodityForm",

	components: { SvgIcon },

	mixins: [Validation, calendarHelper],

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

	watch: {
		"formModel.modalityType.code": function modalityType(value) {
			if (value === consts.COMMODITY.SMARTCARD) {
				this.formModel.dateExpiration = new Date(
					this.dateExpiration || this.project?.endDate,
				);
			}
		},
	},

	data() {
		return {
			displayedFields: DEFAULT_DISPLAYED_FIELDS,
			CASHBACK: consts.COMMODITY.CASHBACK,
			options: {
				modalities: [],
				types: [],
				currencies,
				division: [
					{
						code: consts.COMMODITY.DISTRIBUTION.PER_HOUSEHOLD,
						value: this.$t(consts.COMMODITY.DISTRIBUTION.PER_HOUSEHOLD),
					},
					{
						code: consts.COMMODITY.DISTRIBUTION.PER_MEMBER_CODE,
						value: this.$t(consts.COMMODITY.DISTRIBUTION.PER_MEMBER_LABEL),
					},
					{
						code: consts.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_CODE,
						value: this.$t(consts.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_LABEL),
					},
					{
						code: consts.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_CODE,
						value: this.$t(consts.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_LABEL),
					},
				],
			},
			divisionNwsQuantities: [
				{ label: this.$t("Quantity (1 - 3 members)"), fieldName: "quantityNwsValue1" },
				{ label: this.$t("Quantity (4 - 5 members)"), fieldName: "quantityNwsValue2" },
				{ label: this.$t("Quantity (6 - 8 members)"), fieldName: "quantityNwsValue3" },
				{ label: this.$t("Quantity (9+ members)"), fieldName: "quantityNwsValue4" },
			],
			divisionNesQuantities: [
				{ label: this.$t("Quantity (1 - 3 members)"), fieldName: "quantityNesValue1" },
				{ label: this.$t("Quantity (4 - 8 members)"), fieldName: "quantityNesValue2" },
				{ label: this.$t("Quantity (9+ members)"), fieldName: "quantityNesValue3" },
			],
			loading: {
				modalities: false,
				types: false,
			},
		};
	},

	computed: {
		cashbackLimitDisabled() {
			return this.formModel.value >= 1
				&& this.formModel.cashbackLimit === this.formModel.value
				&& this.formModel.allowedProductCategoryTypes.length === 1
				&& this.formModel.allowedProductCategoryTypes.includes(this.CASHBACK);
		},

		cashbackLimitErrorMessage() {
			return `Required minimum is 1, maximum is ${this.maxCashback}`;
		},

		maxCashback() {
			let max = this.formModel.value;

			if (this.formModel.divisionNesQuantities) {
				max = Math.max(...this.formModel.divisionNesQuantities.map((item) => item.value), max);
			}

			if (this.formModel.divisionNwsQuantities) {
				max = Math.max(...this.formModel.divisionNwsQuantities.map((item) => item.value), max);
			}

			return max;
		},

		showDivisionQuantities() {
			return this.displayedFields.householdMembersNwsQuantity
				|| this.displayedFields.householdMembersNesQuantity;
		},

		divisionQuantitiesValidationString() {
			return this.displayedFields.householdMembersNwsQuantity
				? "divisionNwsQuantities"
				: "divisionNesQuantities";
		},

		divisionQuantities() {
			return {
				divisionNwsQuantities: this.divisionNwsQuantities,
				divisionNesQuantities: this.divisionNesQuantities,
			};
		},

		showValue() {
			return this.displayedFields.value
				&& !this.displayedFields.householdMembersNwsQuantity
				&& !this.displayedFields.householdMembersNesQuantity;
		},

		maxDateOfAssistance() {
			const { endDate } = this.project;
			return endDate ? new Date(endDate) : new Date();
		},

		minDateOfDistribution() {
			return this.dateOfAssistance ? new Date(this.dateOfAssistance) : null;
		},

		isModalityTypeSmartCard() {
			return this.formModel?.modalityType?.code === consts.COMMODITY.SMARTCARD;
		},
	},

	validations() {
		return {
			formModel: {
				modality: { required },
				modalityType: { required },
				// eslint-disable-next-line func-names
				currency: { required: requiredIf(function () {
					return this.displayedFields.currency;
				}) },
				// eslint-disable-next-line func-names
				unit: { required: requiredIf(function () {
					return this.displayedFields.unit;
				}) },
				value: {
					// eslint-disable-next-line func-names
					required: requiredIf(function () {
						return this.showValue;
					}),
					minValue: minValue(1),
				},
				// eslint-disable-next-line func-names
				division: { required: requiredIf(function () {
					return this.displayedFields.division;
				}) },
				divisionNwsQuantities: {
					$each: {
						value: {
							// eslint-disable-next-line func-names
							required: requiredIf(function () {
								return this.displayedFields.householdMembersNwsQuantity;
							}),
						},
					},
				},
				divisionNesQuantities: {
					$each: {
						value: {
							// eslint-disable-next-line func-names
							required: requiredIf(function () {
								return this.displayedFields.householdMembersNesQuantity;
							}),
						},
					},
				},
				// eslint-disable-next-line func-names
				description: { required: requiredIf(function () {
					return this.displayedFields.description;
				}) },
				// eslint-disable-next-line func-names
				totalValueOfBooklet: { required: requiredIf(function () {
					return this.displayedFields.totalValueOfBooklet;
				}) },
				// eslint-disable-next-line func-names
				allowedProductCategoryTypes: { required: requiredIf(function () {
					return this.displayedFields.allowedProductCategoryTypes;
				}) },
				cashbackLimit: {
					required: requiredIf((form) => form.allowedProductCategoryTypes.includes(this.CASHBACK)),
					minValue: minValue(1),
					maxValue: maxValue(this.maxCashback),
				},
			},
		};
	},

	created() {
		this.fetchModalities();
	},

	methods: {
		checkQuantity() {
			if (this.displayedFields.allowedProductCategoryTypes
				&& this.formModel.allowedProductCategoryTypes.length === 1
				&& this.formModel.allowedProductCategoryTypes.includes(this.CASHBACK)) {
				this.formModel.cashbackLimit = this.formModel.value;
			}

			if (this.displayedFields.allowedProductCategoryTypes
				&& !this.formModel.allowedProductCategoryTypes.includes(this.CASHBACK)) {
				this.formModel.cashbackLimit = null;
			}
		},

		checkCashbackLimit() {
			if (this.formModel.allowedProductCategoryTypes.length === 1
				&& this.formModel.allowedProductCategoryTypes.includes(this.CASHBACK)
				&& this.formModel.value
			) {
				this.formModel.cashbackLimit = this.formModel.value;
			}
		},

		checkAllowedProductCategoryTypes() {
			if (this.formModel.value >= 1) {
				this.formModel.cashbackLimit = this.formModel.value;
			} else {
				this.formModel.cashbackLimit = null;
			}
		},

		onModalitySelect({ code }) {
			this.formModel.type = "";
			this.formModel.modalityType = null;
			this.fetchModalityTypes(code);

			this.displayedFields = DEFAULT_DISPLAYED_FIELDS;
		},

		async onModalityTypeSelect({ code }) {
			this.formModel.division = "";
			this.displayedFields = await this.getFormFieldsToShow(code);
		},

		async onDivisionSelect({ code }) {
			this.displayedFields = await this.getDivisionFormFieldsToShow(code);
		},

		async getDivisionFormFieldsToShow(code) {
			this.displayedFields.householdMembersNwsQuantity = false;
			this.displayedFields.householdMembersNesQuantity = false;

			switch (code) {
				case consts.COMMODITY.DISTRIBUTION.PER_HOUSEHOLD:
				case consts.COMMODITY.DISTRIBUTION.PER_MEMBER_CODE:
					this.displayedFields.currency = true;
					this.displayedFields.division = true;
					this.displayedFields.value = true;

					break;
				case consts.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_CODE:
					this.displayedFields.currency = true;
					this.displayedFields.division = true;
					this.displayedFields.householdMembersNwsQuantity = true;

					break;
				case consts.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_CODE:
					this.displayedFields.currency = true;
					this.displayedFields.division = true;
					this.displayedFields.householdMembersNesQuantity = true;

					break;
				default:
					return this.displayedFields;
			}

			return this.displayedFields;
		},

		async getFormFieldsToShow(code) {
			switch (code) {
				case consts.COMMODITY.CASH:
				case consts.COMMODITY.MOBILE_MONEY:
					this.displayedFields = {
						...DEFAULT_DISPLAYED_FIELDS,
						currency: true,
						value: true,
						division: this.targetType === "household",
					};
					break;
				case consts.COMMODITY.LOAN:
					this.displayedFields = {
						...DEFAULT_DISPLAYED_FIELDS,
						currency: true,
						value: true,
					};
					break;
				case consts.COMMODITY.SMARTCARD:
					this.displayedFields = {
						...DEFAULT_DISPLAYED_FIELDS,
						currency: true,
						value: true,
						division: this.targetType === "household",
						remoteDistributionAllowed: true,
						allowedProductCategoryTypes: true,
					};
					break;
				case consts.COMMODITY.FOOD_RATIONS:
				case consts.COMMODITY.READY_TO_EAT_RATIONS:
				case consts.COMMODITY.BREAD:
				case consts.COMMODITY.AGRICULTURAL_KIT:
				case consts.COMMODITY.WASH_KIT:
				case consts.COMMODITY.SHELTER_TOOL_KIT:
				case consts.COMMODITY.HYGIENE_KIT:
				case consts.COMMODITY.DIGNITY_KIT:
				case consts.COMMODITY.NFI_KIT:
				case consts.COMMODITY.WINTERIZATION_KIT:
				case consts.COMMODITY.ACTIVITY_ITEM:
					this.displayedFields = {
						...DEFAULT_DISPLAYED_FIELDS,
						unit: true,
						value: true,
						description: true,
					};
					break;
				case consts.COMMODITY.BUSINESS_GRANT:
					this.displayedFields = {
						...DEFAULT_DISPLAYED_FIELDS,
						unit: true,
						value: true,
					};
					break;
				case consts.COMMODITY.QR_CODE_VOUCHER:
				case consts.COMMODITY.PAPER_VOUCHER:
					this.displayedFields = {
						...DEFAULT_DISPLAYED_FIELDS,
						currency: true,
						totalValueOfBooklet: true,
					};
					break;
				default:
					return this.displayedFields;
			}

			return this.displayedFields;
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
					dateExpiration: this.$moment(this.formModel.dateExpiration).format("YYYY-MM-DD") }),
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
