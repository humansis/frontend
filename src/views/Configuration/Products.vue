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
		<ProductsList
			ref="productsList"
			@onRemove="onRemoveProduct"
			@onShowEdit="editProduct"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import { Toast } from "@/utils/UI";
import ProductsService from "@/services/ProductsService";
import ProductForm from "@/components/Configuration/ProductForm";
import Modal from "@/components/Modal";
import ProductsList from "@/components/Configuration/ProductsList";

export default {
	name: "Products",

	components: {
		ProductsList,
		Modal,
		ProductForm,
	},

	data() {
		return {
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

	methods: {
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

		editProduct(product) {
			this.productModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
			};
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
					this.$refs.productsList.fetchData();
				}
			}).catch((e) => { Toast(e, "is-danger"); });
		},

		async updateProduct(id, productBody) {
			await ProductsService.updateProduct(id, productBody).then((response) => {
				if (response.status === 200) {
					Toast("Product Successfully Updated", "is-success");
					this.$refs.productsList.fetchData();
				}
			}).catch((e) => { Toast(e, "is-danger"); });
		},

		async onRemoveProduct(id) {
			await ProductsService.removeProduct(id).then((response) => {
				if (response.status === 204) {
					Toast("Product successfully removed", "is-success");
					this.$refs.productsList.fetchData();
				}
			}).catch((e) => { Toast(e, "is-danger"); });
		},
	},
};
</script>
