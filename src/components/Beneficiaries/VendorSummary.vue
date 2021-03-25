<template>
	<div>
		<section v-if="!history" class="modal-card-body">
			<span>
				<span class="has-text-weight-bold">Total No. Transactions: </span>
				{{ numberOfTransactions }}
			</span>
			<span>
				<b-button class="is-right is-pulled-right" @click="showHistory">
					See History
				</b-button>
			</span>
		</section>
		<section v-else class="modal-card-body">
			<Table
				:data="table.data"
				:total="table.total"
				:current-page="table.currentPage"
				:is-loading="isLoadingList"
				@pageChanged="onPageChange"
				@sorted="onSort"
				@changePerPage="onChangePerPage"
			>
				<template v-for="column in table.columns">
					<b-table-column v-bind="column" sortable :key="column.id">
						<template v-slot="props">
							{{ props.row[column.field] }}
						</template>
					</b-table-column>
				</template>
				<b-table-column
					v-slot="props"
					label="Actions"
					width="50"
					centered
				>
					<div class="buttons is-right">
						<ActionButton
							icon="search"
							type="is-primary"
							tooltip="View"
							@click.native="showRedemptionSummary(props.row.id)"
						/>
					</div>
				</b-table-column>
			</Table>
		</section>
		<footer class="modal-card-foot level">
			<span class="level-item is-justify-content-start">
				<b-button v-if="history" @click.native="history = false">
					Back
				</b-button>
			</span>
			<span class="level-right">
				<b-button @click.native="$emit('close')">
					Close
				</b-button>
			</span>
		</footer>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import grid from "@/mixins/grid";
import { generateColumns } from "@/utils/datagrid";

export default {
	name: "VendorSummary",

	components: { Table },

	props: {
		vendorId: Number,
	},

	mixins: [grid],

	data() {
		return {
			numberOfTransactions: 150,
			history: false,
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "date" },
					{ key: "project" },
					{ key: "quantity" },
					{ key: "total" },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
			},
			isLoadingList: false,
		};
	},

	methods: {
		showHistory() {
			this.history = true;
			this.fetchBatches();
		},
		showRedemptionSummary(id) {
			console.log(id);
		},
		fetchBatches() {
			this.isLoadingList = true;

			console.log("Fetching Batches");
			this.table.columns = generateColumns(this.table.visibleColumns);

			this.isLoadingList = false;
		},
	},
};
</script>

<style scoped>
.modal-card-foot {
	justify-content: unset !important;
}
</style>
