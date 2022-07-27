<template>
	<div>
		<h3 class="title is-4 space-between mb-0">
			{{ $t('Distributed Commodity') }}
			<b-button
				class="mb-5"
				type="is-primary"
				icon-left="plus"
				@click="addCriteria"
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
				<b-table-column v-bind="column" sortable :key="column.key">
					<template v-slot="props">
						{{ props.row[column.field] }}
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
				{{ value}}
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
import Modal from "@/components/Modal";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import DistributedCommodityForm from "@/components/AddAssistance/SelectionTypes/DistributedCommodity/DistributedCommodityForm";
import { generateColumns } from "@/utils/datagrid";

export default {
	name: "DistributedCommodity",

	components: {
		Modal,
		DistributedCommodityForm,
		Table,
		ActionButton,
	},

	watch: {
		table: {
			deep: true,
			handler() {
				this.$emit("onDeliveredCommodityValue");
			},
		},

		data(data) {
			if (data.length) {
				this.table.data = data;
			}
		},
	},

	data() {
		return {
			commodityModal: {
				isOpened: false,
			},
			formModel: {
				modalityType: "",
				type: "",
				currency: "",
				unit: "",
				value: "",
				description: "",
				division: null,
				totalValueOfBooklet: null,
				remoteDistributionAllowed: false,
				allowedProductCategoryTypes: ["Food"],
				cashbackLimit: null,
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "modalityType" },
					{ key: "type" },
					{ key: "unit" },
					{ key: "value" },
					{ key: "division", label: "For Each" },
					{ key: "description" },
				],
			},
		};
	},

	props: {
		data: {
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
	},

	created() {
		this.table.columns = generateColumns(this.table.visibleColumns);
	},

	updated() {
		if (this.table.data.length) {
			this.$emit("updatedData", this.preparedCommodities);
		}
	},

	computed: {
		preparedCommodities() {
			return this.modifiedTableData.map((
				{
					type,
					unit,
					value,
					description,
					division,
					remoteDistributionAllowed,
					allowedProductCategoryTypes,
					cashbackLimit,
				},
			) => ({
				modalityType: type,
				unit,
				value,
				description: description || "",
				division,
				remoteDistributionAllowed,
				allowedProductCategoryTypes,
				cashbackLimit,
			}));
		},

		modifiedTableData() {
			const tableData = this.table.data.map((
				{
					modalityType,
					type,
					unit,
					currency,
					value,
					description,
					division,
					totalValueOfBooklet,
					remoteDistributionAllowed,
					allowedProductCategoryTypes,
					cashbackLimit,
				},
			) => ({
				modalityType: modalityType?.value || modalityType,
				type: type?.value || type,
				unit: unit || currency?.value,
				value: Number(value) || Number(totalValueOfBooklet),
				description,
				division: division?.code || division,
				remoteDistributionAllowed,
				allowedProductCategoryTypes,
				cashbackLimit,
			}));

			return tableData || [];
		},

		countOfSelectedBeneficiaries() {
			return this.selectedBeneficiaries;
		},
	},

	methods: {
		submit() {
			return !!this.table.data.length;
		},

		addCriteria() {
			this.commodityModal.isOpened = true;

			this.formModel = {
				modalityType: null,
				type: null,
				currency: null,
				unit: null,
				value: null,
				description: null,
				division: null,
				totalValueOfBooklet: null,
				remoteDistributionAllowed: false,
				allowedProductCategoryTypes: [],
				cashbackLimit: null,
			};
		},

		closeCommodityModal() {
			this.commodityModal.isOpened = false;
		},

		submitCommodityForm(commodityForm) {
			this.table.data.push(commodityForm);
			this.commodityModal.isOpened = false;
			this.$emit("onDeliveredCommodityValue", this.preparedCommodities);
		},

		removeCommodity(index) {
			this.table.data.splice(index, 1);
			this.$emit("onDeliveredCommodityValue", this.preparedCommodities);
		},

		numberWithCommas(number) {
			return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
	},
};
</script>
