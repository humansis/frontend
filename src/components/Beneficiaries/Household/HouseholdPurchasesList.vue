<template>
	<Table
		v-show="show"
		ref="purchaseList"
		has-search
		paginated
		:data="table.data"
		:total="table.total"
		:current-page="table.currentPage"
		:is-loading="isLoadingList"
		:search-phrase="table.searchPhrase"
		:backend-pagination="false"
		:backend-sorting="false"
		:backend-searching="false"
		:columns="table.visibleColumns"
		@resetSort="resetSort"
	>
		<template v-for="column in table.columns">
			<b-table-column
				v-bind="column"
				sortable
				:key="column.id"
				:custom-sort="column.customSort"
			>
				<template v-slot="props">
					{{ props.row[column.field] }}
				</template>
			</b-table-column>
		</template>

		<template #progress><span /></template>
	</Table>
</template>

<script>
import grid from "@/mixins/grid";
import { Notification } from "@/utils/UI";
import { generateColumns } from "@/utils/datagrid";
import Table from "@/components/DataGrid/Table";
import BeneficiariesService from "@/services/BeneficiariesService";
import ProductService from "@/services/ProductService";
import baseHelper from "@/mixins/baseHelper";

export default {
	name: "HouseholdPurchasesList",

	components: { Table },

	mixins: [grid, baseHelper],

	data() {
		return {
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{ key: "dateTime", label: "Date", width: "60", searchable: true, customSort: this.sortDate },
					{ key: "product", width: "60", searchable: true },
					{ key: "amount", width: "100", searchable: true, customSort: this.sortAmount },
					{ key: "price", width: "100", searchable: true, customSort: this.sortPrice },
					{ key: "commodity", width: "100", searchable: true },
					{ key: "beneficiary", width: "100", searchable: true },
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
		this.fetchData();
	},

	methods: {
		sortAmount(a, b, c) {
			if (!c) {
				return a.quantity - b.quantity;
			}
			return b.quantity - a.quantity;
		},

		sortPrice(a, b, c) {
			if (!c) {
				return a.value - b.value;
			}
			return b.value - a.value;
		},

		sortDate(a, b, c) {
			if (!c) {
				return new Date(a.date) - new Date(b.date);
			}
			return new Date(b.date) - new Date(a.date);
		},

		async fetchData() {
			this.isLoadingList = true;

			this.table.columns = generateColumns(this.table.visibleColumns);
			await BeneficiariesService.getListOfHouseholdPurchases(this.$route.params.householdId)
				.then(async ({ data, totalCount }) => {
					this.table.total = totalCount;
					this.table.data = [];
					if (totalCount > 0) {
						await this.prepareDataForTable(data);
					}
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Purchases")} ${e}`, "is-danger");
				});

			this.isLoadingList = false;
		},

		prepareDataForTable(data) {
			const beneficiaryIds = [];
			const productIds = [];

			data.forEach((item, key) => {
				this.table.data[key] = item;
				this.table.data[key].dateTime = this.$moment(item.date).format("YYYY-MM-DD hh:mm");
				this.table.data[key].amount = `${item.quantity} Unit`;
				this.table.data[key].price = `${item.value} ${item.currency}`;
				this.table.data[key].commodity = item.source;
				beneficiaryIds.push(item.beneficiaryId);
				productIds.push(item.productId);
			});

			this.prepareProductForTable([...new Set(productIds)]);

			this.prepareBeneficiaryForTable([...new Set(beneficiaryIds)]);
		},

		async prepareProductForTable(productIds) {
			const products = await this.getProducts(productIds);
			this.table.data.forEach((item, key) => {
				this.table.data[key].product = this.prepareEntityForTable(item.productId, products, "name");
			});
			this.reload();
		},

		async prepareBeneficiaryForTable(beneficiaryIds) {
			const beneficiaries = await this.getBeneficiaries(beneficiaryIds);
			this.table.data.forEach((item, key) => {
				const beneficiary = beneficiaries.find(({ id }) => id === item.beneficiaryId);
				this.table.data[key].beneficiary = this
					.prepareName(beneficiary.localGivenName, beneficiary.localFamilyName);
			});
			this.reload();
		},

		async getProducts(ids) {
			if (!ids.length) return [];
			return ProductService.getProducts(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Products")} ${e}`, "is-danger");
				});
		},

		async getBeneficiaries(ids) {
			return BeneficiariesService.getBeneficiaries(ids)
				.then(({ data }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Beneficiaries")} ${e}`, "is-danger");
				});
		},
	},
};
</script>
