<template>
	<div class="d-flex align-baseline justify-space-between mt-2 mb-5">
		<h2 class="text-h6 mt-5 text-left font-weight-bold">{{ $t('Distributed Commodity') }}</h2>

		<v-btn
			:disabled="isAlreadyCreatedDistributedCommodity"
			color="primary"
			prepend-icon="plus"
			class="text-none"
			@click="onAddNewCommodity"
		>
			{{ $t('Add') }}
		</v-btn>
	</div>

	<span
		v-if="validationMessages.modalityType?.length"
		class="text-red"
	>
		{{ validationMessages.modalityType }}
	</span>

	<Modal
		v-model="commodityModal.isOpened"
		header="Create New Commodity"
	>
		<DistributedCommodityForm
			:project="project"
			:form-model="formModel"
			:target-type="targetType"
			:date-of-assistance="dateOfAssistance"
			:date-expiration="dateExpiration"
			:commodity="commodity"
			submit-button-label="Create"
			close-button
			@formSubmitted="onSubmitCommodityForm"
			@formClosed="onCloseCommodityModal"
		/>
	</Modal>

	<DataGrid
		v-if="table.data.length"
		:headers="preparedTableColumns"
		:items="modifiedTableData"
		is-row-click-disabled
		is-custom-footer-disabled
	>
		<template v-slot:custom-value="{ row }">
			<span
				v-if="isPerHouseholdMembers(row.division) && isModalityCash"
				v-html-secure="mapDivisionFields(row.divisionFields)"
			/>
			<template v-else>
				{{ row.value }}
			</template>
		</template>

		<template v-slot:custom-quantity="{ row }">
			<span
				v-if="isPerHouseholdMembers(row.division) && isModalityInKind"
				v-html-secure="mapDivisionFields(row.divisionFields)"
			/>
			<template v-else>
				{{ row.quantity }}
			</template>
		</template>

		<template v-slot:actions="{ row }">
			<ButtonAction
				tooltip="Delete"
				icon="trash"
				icon-color="red"
				@actionConfirmed="onRemoveCommodity(row.index)"
			/>
		</template>
	</DataGrid>

	<v-alert
		v-else
		variant="outlined"
		type="warning"
		border="top"
		class="mt-5"
	>
		{{ $t('There Is No Distributed Commodity') }}.
		{{ $t('Please Add One Distributed Commodity') }}.
	</v-alert>

	<p
		v-for="({ modalityType, unit, value }, key) of calculatedCommodityValue"
		:key="`calculated-commodity-item${key}`"
		class="text-h6 text-right mt-5"
	>
		<strong class="is-size-4">
			{{ value }}
		</strong>
		{{ unit }}
		({{ $t(modalityType) }})
		{{ $t("To Be Delivered") }}
	</p>
</template>

<script>
import DistributedCommodityForm from "@/components/Assistance/AddAssistance/SelectionTypes/DistributedCommodity/Form";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import Modal from "@/components/Inputs/Modal";
import countryHelper from "@/mixins/countryHelper";
import { generateColumns } from "@/utils/datagrid";
import { ASSISTANCE } from "@/consts";

export default {
	name: "DistributedCommodity",

	components: {
		Modal,
		DistributedCommodityForm,
		ButtonAction,
		DataGrid,
	},

	mixins: [countryHelper],

	emits: [
		"deliveredCommodityValue",
		"updatedData",
	],

	props: {
		commodity: {
			type: Array,
			default: () => [],
		},

		selectedBeneficiaries: {
			type: Number,
			required: true,
			default: 0,
		},

		project: {
			type: Object,
			default: () => {},
		},

		calculatedCommodityValue: {
			type: Array,
			default: () => [],
		},

		targetType: {
			type: String,
			default: "",
		},

		dateOfAssistance: {
			type: String,
			required: true,
		},

		isAssistanceDuplicated: {
			type: Boolean,
			default: false,
		},

		validationMessages: {
			type: Object,
			default: () => {},
		},

		isCommodityValueCalculating: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			commodityModal: {
				isOpened: false,
			},
			dateExpiration: "",
			formModel: { ...ASSISTANCE.DEFAULT_FORM_MODEL },
			table: {
				data: [],
				columns: [
					{ key: "modality", sortable: false },
					{ key: "modalityType", sortable: false },
					{ key: "division", title: "For Each", sortable: false },
					{ key: "customFieldName", title: "Custom field" },
					{ key: "amountMultiplier" },
					{ key: "unit", title: "Unit 1", sortable: false },
					{ key: "quantity", title: "Quantity 1", sortable: false },
					{ key: "value", sortable: false },
					{ key: "currency", sortable: false },
					{ key: "secondUnit", title: "Unit 2", sortable: false },
					{ key: "secondQuantity", title: "Quantity 2", sortable: false },
					{ key: "dateExpiration", title: "Expiration Date", visible: false, sortable: false },
					{ key: "description", sortable: false },
					{ key: "actions", value: "actions", sortable: false },
				],
			},
		};
	},

	computed: {
		preparedCommodities() {
			return this.modifiedTableData.map((
				{
					modalityType,
					division,
					customFieldId,
					amountMultiplier,
					unit,
					quantity,
					value,
					divisionFields,
					currency,
					secondUnit,
					secondQuantity,
					description,
					dateExpiration,
					remoteDistributionAllowed,
					allowedProductCategoryTypes,
					cashbackLimit,
				},
			) => {
				const quantitiesSource = this.isModalityCash ? value : quantity;
				const quantities = (quantitiesSource || this.isDivisionPerCustom) ? null : divisionFields;

				return {
					modalityType,
					unit,
					quantity,
					value,
					currency,
					secondUnit,
					secondQuantity,
					dateExpiration,
					description: description || "",
					division: (division === "" || division === null)
						? null
						: {
							code: this.getDivision(division),
							quantities,
							customFieldId: customFieldId || division.customField?.id,
							amountMultiplier: amountMultiplier || division.amountMultiplier,
						},
					remoteDistributionAllowed,
					allowedProductCategoryTypes,
					cashbackLimit,
				};
			});
		},

		modifiedTableData() {
			const tableData = this.table.data.map((
				{
					modality,
					modalityType,
					division,
					customField,
					amountMultiplier,
					unit,
					quantity,
					value,
					payloadDivisionNwsFields,
					payloadDivisionNesFields,
					payloadDivisionCodFields,
					currency,
					secondUnit,
					secondQuantity,
					dateExpiration,
					description,
					remoteDistributionAllowed,
					allowedProductCategoryTypes,
					cashbackLimit,
				},
			) => {
				let payloadDivision = {};

				if (this.isPerMembersNws(division)) {
					payloadDivision = payloadDivisionNwsFields;
				} else if (this.isPerMembersNes(division)) {
					payloadDivision = payloadDivisionNesFields;
				} else {
					payloadDivision = payloadDivisionCodFields;
				}

				return {
					modality: modality?.value || modality,
					modalityType: modalityType?.value || modalityType,
					division: this.getDivisionName(division),
					customFieldId: customField?.id || division?.customField?.id,
					customFieldName: customField?.field || division?.customFieldName,
					amountMultiplier: amountMultiplier || division?.amountMultiplier,
					unit,
					currency: currency?.value || currency,
					quantity: (!this.isModalityCash && this.isPerHouseholdMembers(division))
						? null
						: Number(quantity) || null,
					value: (this.isModalityCash && this.isPerHouseholdMembers(division))
						? null
						: Number(value) || null,
					divisionFields: division?.fields
						|| division?.quantities
						|| payloadDivision,
					secondUnit,
					secondQuantity,
					dateExpiration,
					description,
					remoteDistributionAllowed,
					allowedProductCategoryTypes,
					cashbackLimit,
				};
			});

			return tableData || [];
		},

		isModalityCash() {
			const modality = this.table.data[0]?.modality?.value || this.table.data[0]?.modality;
			return modality === ASSISTANCE.MODALITY.CASH;
		},

		isModalityInKind() {
			const modality = this.table.data[0]?.modality?.value || this.table.data[0]?.modality;
			return modality === ASSISTANCE.MODALITY.IN_KIND;
		},

		isModalityTypeSmartCard() {
			const modalityType = this.table.data[0]?.modalityType?.value
				|| this.table.data[0]?.modalityType;
			return modalityType === ASSISTANCE.COMMODITY.SMARTCARD;
		},

		isDivisionPerCustom() {
			const divisionCode = this.table.data[0]?.division?.code;
			return divisionCode === ASSISTANCE.COMMODITY.DISTRIBUTION.PER_CUSTOM_AMOUNT_BY_CUSTOM_FIELD;
		},

		formattedDate() {
			const date = this.table.data[0]?.dateExpiration;
			return date ? this.$moment(date).format("YYYY-MM-DD") : "";
		},

		isAlreadyCreatedDistributedCommodity() {
			return this.table.data.length > 0;
		},

		preparedTableColumns() {
			return generateColumns(this.table.columns);
		},
	},

	watch: {
		table: {
			deep: true,
			handler() {
				this.$emit("deliveredCommodityValue");
			},
		},

		commodity(data) {
			if (data.length) {
				this.table.data = data;
				this.dateExpiration = data[0]?.dateExpiration;

				if (this.isAssistanceDuplicated) {
					this.toggleColumnsVisibility();
				}
			}
		},
	},

	updated() {
		if (this.table.data.length) {
			this.$emit("updatedData", this.preparedCommodities);
		}
	},

	methods: {
		submit() {
			return !!this.table.data.length;
		},

		getDivisionName({ quantities, code }) {
			if (quantities) {
				const quantitiesLength = quantities?.length;

				if (this.isCountrySYR) {
					return quantitiesLength === 5
						? ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_CODE
						: ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_CODE;
				}

				if (this.isCountryCOD && quantitiesLength === 2) {
					return ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_COD_CODE;
				}
			}

			return code || null;
		},

		getDivision(divisionString) {
			switch (divisionString) {
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_CODE:
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_CODE:
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_CODE:
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_COD_CODE:
					return ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_CODE;
				default:
					return divisionString;
			}
		},

		toggleColumnsVisibility() {
			this.showAllColumns();
			this.hideEmptyColumns();

			if (this.isDivisionPerCustom) {
				this.showColumn("customFieldName");
				this.showColumn("amountMultiplier");
			} else if (this.isModalityCash) {
				this.showColumn("value");
			} else if (this.isModalityInKind) {
				this.showColumn("quantity");
			}

			if (this.isModalityTypeSmartCard) {
				this.showColumn("dateExpiration");
			}
		},

		showAllColumns() {
			this.table.columns.forEach((column, i) => {
				this.table.columns[i].visible = true;
			});
		},

		hideEmptyColumns() {
			this.table.columns.forEach((column, i) => {
				const field = this.table.data[0][column.key];

				if ((field === null || field === undefined || field === "") && column.key !== "actions") {
					this.table.columns[i].visible = false;
				}
			});
		},

		showColumn(columnName) {
			this.table.columns.forEach((column, i) => {
				if (column.key === columnName) {
					this.table.columns[i].visible = true;
				}
			});
		},

		onAddNewCommodity() {
			this.commodityModal.isOpened = true;
			this.formModel = { ...ASSISTANCE.DEFAULT_FORM_MODEL };
		},

		onCloseCommodityModal() {
			this.commodityModal.isOpened = false;
		},

		onSubmitCommodityForm(commodityForm) {
			this.table.data.push(commodityForm);
			this.commodityModal.isOpened = false;

			this.toggleColumnsVisibility();

			this.$emit("deliveredCommodityValue", this.preparedCommodities);
		},

		onRemoveCommodity(index) {
			this.table.data.splice(index, 1);
			this.$emit("deliveredCommodityValue", this.preparedCommodities);
		},

		mapDivisionFields(divisionFields) {
			return divisionFields
				.filter((field) => (field.value))
				.map((field) => (
					field.rangeTo === null
						? `<i>${field.rangeFrom}+:</i> <b>${field.value}</b>`
						: `<i>${field.rangeFrom} - ${field.rangeTo}:</i> <b>${field.value}</b>`
				)).join("<br />");
		},

		isPerHouseholdMembers(division) {
			const divisionStr = this.getDivisionStr(division);

			return divisionStr === ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_CODE
				|| divisionStr === ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_CODE
				|| divisionStr === ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_CODE
				|| divisionStr === ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_COD_CODE;
		},

		isPerMembersNws(division) {
			return this.getDivisionStr(division) === ASSISTANCE
				.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_CODE;
		},

		isPerMembersNes(division) {
			return this.getDivisionStr(division) === ASSISTANCE
				.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_CODE;
		},

		getDivisionStr(division) {
			return division?.code || division;
		},

		clearComponent() {
			this.table.data = [];
			this.formModel = { ...ASSISTANCE.DEFAULT_FORM_MODEL };
			this.$emit("deliveredCommodityValue", this.preparedCommodities);
		},
	},
};
</script>
