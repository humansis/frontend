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
					label="value"
					track-by="code"
					:options="options.modalities"
					:searchable="false"
					:loading="loading.modalities"
					:class="validateMultiselect('modality')"
					@select="onModalitySelect"
				/>
			</b-field>

			<b-field
				class="relative-select"
				:type="validateType('type')"
				:message="validateMsg('type')"
				:label="$t('Type')"
			>
				<MultiSelect
					v-model="formModel.type"
					label="value"
					track-by="code"
					:placeholder="$t('Click to select')"
					:options="options.types"
					:loading="loading.types"
					:searchable="false"
					:class="validateMultiselect('type')"
					@select="onModalityTypeSelect"
				/>
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
					label="value"
					track-by="value"
					:options="options.currencies"
					:class="validateMultiselect('currency')"
					searchable
				/>
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
				v-if="displayedFields.quantity"
				:type="validateType('quantity')"
				:message="validateMsg('quantity')"
				:label="$t('Quantity')"
			>
				<b-numberinput
					v-model="formModel.quantity"
					type="is-dark"
					expanded
					min="0"
					:controls="false"
					@blur="validate('quantity')"
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
					>
						<div class="is-flex is-align-items-center">
							{{ item }}
							<SvgIcon class="ml-2" :items="[{code: item, value: item}]" />
						</div>
					</b-checkbox>
				</div>
			</b-field>

			<b-field
				v-if="formModel.allowedProductCategoryTypes.includes('Cashback')"
				:type="validateType('cashbackLimit')"
				:message="validateMsg('cashbackLimit')"
				:label="$t('Cashback Limit')"
			>
				<b-numberinput
					v-model="formModel.cashbackLimit"
					type="is-dark"
					expanded
					min="1"
					:max="formModel.quantity"
					:controls="false"
					@input="validate('cashbackLimit')"
				/>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				tag="input"
				class="is-primary"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import { minValue, required, requiredIf } from "vuelidate/lib/validators";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import consts from "@/utils/assistanceConst";
import currencies from "@/utils/currencies";
import Validation from "@/mixins/validation";
import SvgIcon from "@/components/SvgIcon";

export default {
	name: "DistributedCommodityForm",

	components: { SvgIcon },

	mixins: [Validation],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		project: {
			type: Object,
			default: () => {},
		},
	},

	data() {
		return {
			displayedFields: {
				currency: false,
				unit: false,
				quantity: false,
				description: false,
				totalValueOfBooklet: false,
				remoteDistributionAllowed: false,
				allowedProductCategoryTypes: false,
			},
			options: {
				modalities: [],
				types: [],
				currencies,
				allowedProductCategoryTypes: [
					"Food", "Non-Food", "Cashback",
				],
			},
			loading: {
				modalities: false,
				types: false,
			},
		};
	},

	validations: {
		formModel: {
			modality: { required },
			type: { required },
			// eslint-disable-next-line func-names
			currency: { required: requiredIf(function () {
				return this.displayedFields.currency;
			}) },
			// eslint-disable-next-line func-names
			unit: { required: requiredIf(function () {
				return this.displayedFields.unit;
			}) },
			quantity: {
				// eslint-disable-next-line func-names
				required: requiredIf(function () {
					return this.displayedFields.quantity;
				}),
				minValue: minValue(1),
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
				required: requiredIf((form) => form.allowedProductCategoryTypes.includes("Cashback")),
				minValue: minValue(1),
			},
		},
	},

	created() {
		this.fetchModalities();
	},

	methods: {
		onModalitySelect({ code }) {
			this.formModel.type = "";
			this.fetchModalityTypes(code);

			this.displayedFields = {
				currency: false,
				unit: false,
				quantity: false,
				description: false,
				totalValueOfBooklet: false,
			};
		},

		async onModalityTypeSelect({ code }) {
			this.displayedFields = await this.getFormFieldsToShow(code);
		},

		async getFormFieldsToShow(code) {
			switch (code) {
				case consts.COMMODITY.CASH:
				case consts.COMMODITY.MOBILE_MONEY:
				case consts.COMMODITY.LOAN:
					this.displayedFields = {
						unit: false,
						description: false,
						totalValueOfBooklet: false,
						currency: true,
						quantity: true,
						remoteDistributionAllowed: false,
						allowedProductCategoryTypes: false,
					};
					break;
				case consts.COMMODITY.SMARTCARD:
					this.displayedFields = {
						unit: false,
						description: false,
						totalValueOfBooklet: false,
						currency: true,
						quantity: true,
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
						currency: false,
						totalValueOfBooklet: false,
						unit: true,
						quantity: true,
						description: true,
						remoteDistributionAllowed: false,
						allowedProductCategoryTypes: false,
					};
					break;
				case consts.COMMODITY.BUSINESS_GRANT:
					this.displayedFields = {
						currency: false,
						description: false,
						totalValueOfBooklet: false,
						unit: true,
						quantity: true,
						remoteDistributionAllowed: false,
						allowedProductCategoryTypes: false,
					};
					break;
				case consts.COMMODITY.QR_CODE_VOUCHER:
				case consts.COMMODITY.PAPER_VOUCHER:
					this.displayedFields = {
						unit: false,
						quantity: false,
						description: false,
						currency: true,
						totalValueOfBooklet: true,
						remoteDistributionAllowed: false,
						allowedProductCategoryTypes: false,
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

			console.log(this.$v);
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
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
