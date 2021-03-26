<template>
	<div>
		<h2 class="title space-between mb-0">
			Distributed Commodity
			<b-button
				class="mb-5"
				type="is-primary"
				icon-left="plus"
				@click="addCriteria"
			>
				Add
			</b-button>
		</h2>
		<Modal
			can-cancel
			is-small
			header="Create A New Commodity"
			:active.sync="commodityModal.isOpened"
			@close="closeCommodityModal"
		>
			<DistributedCommodityForm
				close-button
				class="modal-card"
				submit-button-label="Create"
				:formModel="formModel"
				@formSubmitted="submitCommodityForm"
				@formClosed="closeCommodityModal"
			/>
		</Modal>
		<div class="mb-2">
			<Table
				v-if="table.data.length"
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
					label="Actions"
					v-slot="props"
				>
					<ActionButton
						icon="trash"
						type="is-danger"
						tooltip="Delete"
						@click.native="removeCommodity(props.index)"
					/>
				</b-table-column>
			</Table>
			<b-notification
				v-else
				type="is-light"
				has-icon
				icon="eye-slash"
				:closable="false"
			>
				<p class="mt-3">No data</p>
			</b-notification>
		</div>
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
	},
};
</script>
