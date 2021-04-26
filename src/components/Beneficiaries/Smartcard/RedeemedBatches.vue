<template>
	<section class="modal-card-body">
		<Table
			v-show="show"
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:backend-sorting="false"
			:is-loading="isLoadingList"
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
						tooltip="Vendor Redemption Summary"
						@click.native="$emit('showRedemptionSummary', props.row)"
					/>
				</div>
			</b-table-column>
		</Table>
	</section>
</template>

<script>
import grid from "@/mixins/grid";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SmartcardService from "@/services/SmartcardService";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "RedeemedBatches",

	components: { Table, ActionButton },

	mixins: [grid],

	props: {
		projects: Array,
		vendorId: Number,
	},

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "date" },
					{ key: "project" },
					{ key: "quantity" },
					{ key: "total", label: "Total", customSort: this.sortAmount },
				],
				total: 0,
				currentPage: 1,
				sortDirection: "",
				sortColumn: "",
				searchPhrase: "",
			},
		};
	},

	created() {
		this.fetchBatches();
	},

	methods: {
		sortAmount(a, b, c) {
			if (!c) {
				return a.value - b.value;
			}
			return b.value - a.value;
		},

		async fetchBatches() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await SmartcardService.getSmartcardRedemptionBatches([this.vendorId])
				.then(({ data, totalCount }) => {
					this.table.total = totalCount;
					this.prepareDataForTable(data);
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Batches")} ${e}`, "is-danger");
				});

			this.isLoadingList = false;
		},

		prepareDataForTable(data) {
			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].date = this.$moment(item.date).format("DD-MM-YYYY HH:mm");
				this.table.data[key].total = this.formatPrice(item.value, item.currency);
				this.table.data[key].project = this.projects
					.find((project) => project.id === item.projectId)?.name || this.$t("None");
			});
		},

		formatPrice(price, currency) {
			const format = Intl.NumberFormat("en-US", {
				style: "currency",
				currency,
				minimumFractionDigits: 2,
			});
			return format.format(price);
		},
	},
};
</script>
