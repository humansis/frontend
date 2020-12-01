<template>
	<div>
		<h2 class="title space-between mb-0">
			Distributed Commodity
			<b-button
				class="mb-5"
				type="is-success"
				icon-left="plus"
				@click="addCriteria"
			>
				Add
			</b-button>
		</h2>
		<Modal
			can-cancel
			:active.sync="commodityModal.isOpened"
			header="Create A New Commodity"
			@close="closeCommodityModal"
		>
			<DistributedCommodityForm
				close-button
				submit-button-label="Create"
				:formModel="commodityModel"
				@formSubmitted="submitCommodityForm"
				@formClosed="closeCommodityModal"
			/>
		</Modal>

		<div class="mb-2">
			<Table
				v-if="table.data.length"
				:data="table.data"
			>
				<template v-for="(column, key) in table.columns">
					<b-table-column
						v-bind="column"
						:key="key"
					>
						<template v-slot="props">
							<div v-if="column.field === 'donorIds'">
								{{ props.row[column.field].length }}
							</div>
							<div v-else>
								{{ props.row[column.field] }}
							</div>
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
						@click.native="removeCommodity(props.index)"
					/>
				</b-table-column>
			</Table>
			<b-notification
				v-else
				type="is-light"
			>
				No data
			</b-notification>
		</div>
	</div>
</template>

<script>
import Modal from "@/components/Modal";
import DistributedCommodityForm from "@/components/AddAssistance/DistributedCommodityForm";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";

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
			commodityModel: {
				modality: null,
				type: null,
				currency: null,
				unit: null,
				quantity: null,
				description: null,
				totalValueOfBooklet: null,
			},
			table: {
				data: [],
				columns: [
					{
						field: "modality",
						label: "Modality",
					},
					{
						field: "type",
						label: "Type",
					},
					{
						field: "currency",
						label: "Currency",
					},
					{
						field: "unit",
						label: "Unit",
					},
					{
						field: "quantity",
						label: "Quantity",
					},
					{
						field: "description",
						label: "Description",
					},
					{
						field: "totalValueOfBooklet",
						label: "Total Value Of Booklet",
					},
				],
			},
		};
	},

	updated() {
		// TODO Emit only if form is validated else emit false
		if (this.table.data.length > 0) {
			this.$emit("updatedData", this.table.data);
		}
	},

	methods: {
		addCriteria() {
			this.commodityModal.isOpened = true;

			this.commodityModel = {
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
