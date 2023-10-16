<template>
	<div>
		<h3 class="title is-4 space-between mb-0">
			{{ $t('Distributed Commodity') }}
			<b-button
				class="mb-5"
				type="is-primary"
				icon-left="plus"
				:disabled="isAlreadyCreatedDistributedCommodity"
				@click="addNewCommodity"
			>
				{{ $t('Add') }}
			</b-button>
		</h3>
		<Modal
			can-cancel
			:header="$t('Create New Commodity')"
			:active.sync="commodityModal.isOpened"
			@close="closeCommodityModal"
		>
			<DistributedCommodityForm
				close-button
				class="modal-card"
				:project="project"
				:submit-button-label="$t('Create')"
				:formModel="formModel"
				:target-type="targetType"
				:date-of-assistance="dateOfAssistance"
				:date-expiration="dateExpiration"
				:commodity="commodity"
				@formSubmitted="submitCommodityForm"
				@formClosed="closeCommodityModal"
			/>
		</Modal>

		<Table
			v-if="table.data.length"
			class="mb-2"
			:data="modifiedTableData"
			:paginated="false"
		>
			<template v-for="column in table.columns">
				<b-table-column
					v-bind="column"
					:sortable="column.sortable"
					:visible="column.visible"
					:key="column.key"
				>
					<template v-slot="props">
						<span
							v-if="isDivisionFields(column, props)"
							v-html-secure="mapDivisionFields(props.row.divisionFields)"
						/>
						<span v-else>
							<span v-if="column.field === 'dateExpiration'">
								{{ formattedDate }}
							</span>
							<span v-else>
								{{ props.row[column.field] }}
							</span>
						</span>
					</template>
				</b-table-column>
			</template>
			<b-table-column
				field="actions"
				:label="$t('Actions')"
				v-slot="props"
			>
				<ActionButton
					icon="trash"
					type="is-danger"
					:tooltip="$t('Delete')"
					@click="removeCommodity(props.index)"
				/>
			</b-table-column>
		</Table>

		<p
			v-for="({modalityType, unit, value}, key) of calculatedCommodityValue"
			:key="`calculated-commodity-item${key}`"
			class="subtitle is-5 mb-2 has-text-right"
		>
			<strong class="is-size-4">
				{{ value }}
			</strong>
			{{ unit }}
			({{ $t(modalityType) }})
			{{ $t("To Be Delivered") }}
		</p>

		<b-notification
			v-if="!table.data.length"
			type="is-light"
			has-icon
			icon="eye-slash"
			:closable="false"
		>
			<p class="mt-3">{{ $t('No data') }}</p>
		</b-notification>
	</div>
</template>

<script>
import ActionButton from "@/components/ActionButton";
import DistributedCommodityForm from "@/components/AddAssistance/SelectionTypes/DistributedCommodity/Form";
import Table from "@/components/DataGrid/Table";
import Modal from "@/components/Modal";
import { generateColumns } from "@/utils/datagrid";
import { ASSISTANCE } from "@/consts";

export default {
	name: "DistributedCommodity",

	components: {
		Modal,
		DistributedCommodityForm,
		Table,
		ActionButton,
	},

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
				columns: generateColumns([
					{ key: "modality" },
					{ key: "modalityType" },
					{ key: "division", label: "For Each" },
					{ key: "unit", label: "Unit 1" },
					{ key: "quantity", label: "Quantity 1" },
					{ key: "value" },
					{ key: "currency" },
					{ key: "secondUnit", label: "Unit 2" },
					{ key: "secondQuantity", label: "Quantity 2" },
					{ key: "dateExpiration", label: "Expiration Date", visible: false },
					{ key: "description" },
				]),
			},
		};
	},

	computed: {
		preparedCommodities() {
			return this.modifiedTableData.map((
				{
					modalityType,
					division,
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
				const quantities = quantitiesSource ? null : divisionFields;

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
					unit,
					quantity,
					value,
					divisionNwsFields,
					divisionNesFields,
					currency,
					secondUnit,
					secondQuantity,
					dateExpiration,
					description,
					remoteDistributionAllowed,
					allowedProductCategoryTypes,
					cashbackLimit,
				},
			) => ({
				modality: modality?.value || modality,
				modalityType: modalityType?.value || modalityType,
				division: this.getDivisionName(division),
				unit,
				currency: currency?.value || currency,
				quantity: (!this.isModalityCash && this.isPerHouseholdMembers(division))
					? null
					: Number(quantity) || null,
				value: (this.isModalityCash && this.isPerHouseholdMembers(division))
					? null
					: Number(value) || null,
				divisionFields: division?.fields || division?.quantities
						|| (this.isPerMembersNws(division) ? divisionNwsFields : divisionNesFields),
				secondUnit,
				secondQuantity,
				dateExpiration,
				description,
				remoteDistributionAllowed,
				allowedProductCategoryTypes,
				cashbackLimit,
			}));

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

		formattedDate() {
			const date = this.table.data[0]?.dateExpiration;
			return date ? this.$moment(date).format("YYYY-MM-DD") : "";
		},

		isAlreadyCreatedDistributedCommodity() {
			return this.table.data.length > 0;
		},
	},

	watch: {
		table: {
			deep: true,
			handler() {
				this.$emit("onDeliveredCommodityValue");
			},
		},

		commodity(data) {
			if (data.length) {
				this.table.data = data;
				this.dateExpiration = data[0]?.dateExpiration;

				if (this.isAssistanceDuplicated) {
					this.showAllColumns();
					this.hideEmptyColumns();

					if (this.isModalityCash) {
						this.showColumn("value");
					} else if (this.isModalityInKind) {
						this.showColumn("quantity");
					}

					this.table.columns.forEach((column, i) => {
						if (column.field === "dateExpiration") {
							this.table.columns[i].visible = this.isModalityTypeSmartCard;
						}
					});
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

		getDivisionName(division) {
			if (division?.quantities) {
				if (division.quantities?.length === 4) {
					return ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_CODE;
				}

				return ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_CODE;
			}

			return division?.code || null;
		},

		getDivision(divisionString) {
			switch (divisionString) {
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_CODE:
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_CODE:
				case ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_CODE:
					return ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_CODE;
				default:
					return divisionString;
			}
		},

		showAllColumns() {
			this.table.columns.forEach((column, i) => {
				this.table.columns[i].visible = true;
			});
		},

		hideEmptyColumns() {
			this.table.columns.forEach((column, i) => {
				const field = this.table.data[0][column.field];

				if (field === null || field === undefined || field === "") {
					this.table.columns[i].visible = false;
				}
			});
		},

		showColumn(columnName) {
			this.table.columns.forEach((column, i) => {
				if (column.field === columnName) {
					this.table.columns[i].visible = true;
				}
			});
		},

		addNewCommodity() {
			this.commodityModal.isOpened = true;
			this.formModel = { ...ASSISTANCE.DEFAULT_FORM_MODEL };
		},

		closeCommodityModal() {
			this.commodityModal.isOpened = false;
		},

		submitCommodityForm(commodityForm) {
			this.table.data.push(commodityForm);
			this.commodityModal.isOpened = false;

			this.showAllColumns();
			this.hideEmptyColumns();

			if (this.isModalityCash) {
				this.showColumn("value");
			} else if (this.isModalityInKind) {
				this.showColumn("quantity");
			}

			if (this.isModalityTypeSmartCard) {
				this.showColumn("dateExpiration");
			}

			this.$emit("onDeliveredCommodityValue", this.preparedCommodities);
		},

		removeCommodity(index) {
			this.table.data.splice(index, 1);
			this.$emit("onDeliveredCommodityValue", this.preparedCommodities);
		},

		isDivisionFields(column, props) {
			return (this.isModalityCash ? column.field === "value" : column.field === "quantity") && this.isPerHouseholdMembers(props.row.division);
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
				|| divisionStr === ASSISTANCE.COMMODITY.DISTRIBUTION.PER_MEMBERS_NES_CODE;
		},

		isPerMembersNws(division) {
			return this.getDivisionStr(division) === ASSISTANCE
				.COMMODITY.DISTRIBUTION.PER_MEMBERS_NWS_CODE;
		},

		getDivisionStr(division) {
			return division?.code || division;
		},

		clearComponent() {
			this.table.data = [];
			this.formModel = { ...ASSISTANCE.DEFAULT_FORM_MODEL };
			this.$emit("onDeliveredCommodityValue", this.preparedCommodities);
		},
	},
};
</script>
