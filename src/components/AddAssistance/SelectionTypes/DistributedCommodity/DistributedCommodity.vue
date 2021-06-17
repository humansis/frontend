<template>
	<div>
		<h2 class="title space-between mb-0">
			{{ $t('Distributed Commodity') }}
			<b-button
				class="mb-5"
				type="is-primary"
				icon-left="plus"
				@click="addCriteria"
			>
				{{ $t('Add') }}
			</b-button>
		</h2>
		<Modal
			can-cancel
			:header="$t('Create New Commodity')"
			:active.sync="commodityModal.isOpened"
			@close="closeCommodityModal"
		>
			<DistributedCommodityForm
				close-button
				class="modal-card"
				:submit-button-label="$t('Create')"
				:formModel="formModel"
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
			v-for="({unit, quantity, type}, key) of modifiedTableData"
			:key="key"
			class="subtitle is-5 mb-2 has-text-right"
		>
			<strong class="is-size-4">
				{{ numberWithCommas(quantity * countOfSelectedBeneficiaries) }}
			</strong>
			{{ unit }}
			({{ type }})
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

	data() {
		return {
			commodityModal: {
				isOpened: false,
			},
			formModel: {
				modality: "",
				type: "",
				currency: "",
				unit: "",
				quantity: "",
				description: "",
				totalValueOfBooklet: null,
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "modality" },
					{ key: "type" },
					{ key: "unit" },
					{ key: "quantity" },
					{ key: "description" },
				],
			},
		};
	},

	props: {
		selectedBeneficiaries: {
			type: Number,
			required: true,
			default: 0,
		},
	},

	created() {
		this.table.columns = generateColumns(this.table.visibleColumns);
	},

	updated() {
		const commodities = this.modifiedTableData.map(({ type, unit, quantity, description }) => ({
			modalityType: type,
			unit,
			value: quantity,
			description: description || "",
		}));

		if (this.table.data.length) {
			this.$emit("updatedData", commodities);
		}
	},

	computed: {
		modifiedTableData() {
			const tableData = this.table.data.map((
				{ modality, type, unit, currency, quantity, description, totalValueOfBooklet },
			) => ({
				modality: modality?.value || modality,
				type: type?.value || type,
				unit: unit || currency?.value,
				quantity: quantity || totalValueOfBooklet,
				description,
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
				modality: null,
				type: null,
				currency: null,
				unit: null,
				quantity: null,
				description: null,
				totalValueOfBooklet: null,
			};
		},

		closeCommodityModal() {
			this.commodityModal.isOpened = false;
		},

		submitCommodityForm(commodityForm) {
			this.table.data.push(commodityForm);
			this.commodityModal.isOpened = false;
		},

		removeCommodity(index) {
			this.table.data.splice(index, 1);
		},

		numberWithCommas(number) {
			return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
	},
};
</script>
