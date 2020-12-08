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
				<template v-for="(column) in table.columns">
					<b-table-column
						v-bind="column"
						v-slot="props"
						:key="column.id"
					>
						<ColumnField :column="column" :data="props" />
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
			<b-notification v-else type="is-light">
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
import ColumnField from "@/components/DataGrid/ColumnField";

export default {
	name: "DistributedCommodity",

	components: {
		ColumnField,
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
					{ field: "modality" },
					{ field: "type" },
					{ field: "currency" },
					{ field: "unit" },
					{ field: "quantity" },
					{ field: "description" },
					{ field: "totalValueOfBooklet" },
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
