<template>
	<div>
		<h2 class="title">Products</h2>
		<Modal
			can-cancel
			:active="productModal.isOpened"
			:header="modalHeader"
			@close="closeProductModal"
		>
			<ProductForm
				close-button
				:formModel="productModel"
				:submit-button-label="productModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="productModal.isDetail"
				@formSubmitted="submitProductForm"
				@formClosed="closeProductModal"
			/>
		</Modal>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="addNewProduct"
		>
			Add
		</b-button>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search..."
						type="search"
						icon="search"
					/>
				</b-field>
			</div>
		</div>

		<Table
			:data="table.data"
			:total="table.total"
			:current-page="table.currentPage"
			:per-page="table.perPage"
			@clicked="showDetail"
			@pageChanged="onPageChange"
			@sorted="onSort"
		>
			<template v-for="column in table.columns">
				<b-table-column v-bind="column" :key="column.id">
					<template v-slot="props">
						{{ props.row[column.field] }}
					</template>
				</b-table-column>
			</template>

			<b-table-column
				label="Actions"
				v-slot="props"
			>
				<div class="block">
					<ActionButton
						icon="search"
						type="is-info"
						@click.native="showDetailWithId(props.row.id)"
					/>
					<ActionButton
						icon="edit"
						type="is-link"
						@click.native="editProduct(props.row.id)"
					/>
					<SafeDelete
						icon="trash"
						entity="Product"
						:id="props.row.id"
						@submitted="onRemoveProduct"
					/>
				</div>
			</b-table-column>

		</Table>
	</div>
</template>

<script>
import { generateColumns } from "@/utils/datagrid";
import { Toast } from "@/utils/UI";
import ProductsService from "@/services/ProductsService";
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";
import SafeDelete from "@/components/SafeDelete";
import ProductForm from "@/components/Configuration/ProductForm";
import Modal from "@/components/Modal";

export default {
	name: "ProductsList",

	components: {
		Modal,
		ProductForm,
		SafeDelete,
		Table,
		ActionButton,
	},

	data() {
		return {
			fetch: {
				error: null,
			},
			table: {
				data: [],
				columns: [],
				visibleColumns: [
					{
						key: "name",
						label: "Name",
					},
					{
						key: "unit",
						label: "Unit",
					},
					{
						key: "image",
						label: "Image",
					},
				],
				total: 0,
				currentPage: 1,
				perPage: 15,
			},
			productModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			productModel: {
				id: null,
				name: "",
				unit: "",
				image: null,
			},
		};
	},

	watch: {
		$route: "fetchData",
	},

	computed: {
		modalHeader() {
			let result = "";
			if (this.productModal.isDetail) {
				result = "Detail of Product";
			} else if (this.productModal.isEditing) {
				result = "Edit Product";
			} else {
				result = "Create new Product";
			}
			return result;
		},
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				this.fetch.error = null;
				const loadingComponent = this.$buefy.loading.open();

				await ProductsService.getListOfProducts(
					this.table.currentPage,
					this.table.perPage,
					"desc",
				).then((response) => {
					this.table.data = response.data;
					this.table.total = response.totalCount;
					this.table.columns = generateColumns(
						this.table.visibleColumns,
					);
				});

				loadingComponent.close();
			} catch (error) {
				this.handleError(error);
			}
		},

		handleError(error) {
			console.error(error);
			this.fetch.loading = false;
			this.fetch.error = error.toString();
		},

		showDetailWithId(id) {
			const product = this.table.data.find((item) => item.id === id);
			this.showDetail(product);
		},

		showDetail(product) {
			this.mapToFormModel(product);
			this.productModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
			};
		},

		mapToFormModel(
			{
				id,
				name,
				image,
				unit,
			},
		) {
			this.productModel = {
				...this.productModel,
				id,
				name,
				image,
				unit,
			};
		},

		closeProductModal() {
			this.productModal.isOpened = false;
		},

		editProduct(id) {
			this.productModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};

			const product = this.table.data.find((item) => item.id === id);
			product.image = null;
			this.mapToFormModel(product);
		},

		addNewProduct() {
			this.productModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
			};

			this.productModel = {
				...this.productModel,
				id: null,
				name: "",
				image: null,
				unit: "",
			};
		},

		submitProductForm(productForm) {
			const {
				id,
				name,
				image,
				unit,
			} = productForm;

			const productBody = {
				name,
				image,
				unit,
			};

			if (this.productModal.isEditing && id) {
				this.updateProduct(id, productBody);
			} else {
				this.createProduct(productBody);
			}

			this.closeProductModal();
		},

		async createProduct(productBody) {
			await ProductsService.createProduct(productBody).then((response) => {
				if (response.status === 200) {
					Toast("Product Successfully Created", "is-success");
					this.fetchData();
				}
			});
		},

		async updateProduct(id, productBody) {
			await ProductsService.updateProduct(id, productBody).then((response) => {
				if (response.status === 200) {
					Toast("Product Successfully Updated", "is-success");
					this.fetchData();
				}
			});
		},

		async onRemoveProduct(id) {
			await ProductsService.removeProduct(id)
				.then((response) => {
					if (response.status === 204) {
						Toast("Product successfully removed", "is-success");
						this.fetchData();
					}
				});
		},

		onPageChange() {
			// TODO on table page change
		},

		onSort() {
			// TODO on table sort
		},
	},
};
</script>
