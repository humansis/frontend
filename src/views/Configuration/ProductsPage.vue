<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">Products</h1>
			</div>

			<div class="level-right">
				<b-button
					type="is-primary"
					icon-left="plus"
					@click="addNewProduct"
				>
					Add
				</b-button>
			</div>
		</div>

		<Modal
			can-cancel
			:active="productModal.isOpened"
			:header="modalHeader"
			:is-waiting="productModal.isWaiting"
			@close="closeProductModal"
		>
			<ProductForm
				close-button
				class="modal-card"
				:formModel="productModel"
				:editing="productModal.isEditing"
				:form-disabled="productModal.isDetail"
				:submit-button-label="productModal.isEditing ? 'Update' : 'Create'"
				@formSubmitted="submitProductForm"
				@formClosed="closeProductModal"
			/>
		</Modal>

		<ProductsList
			ref="productsList"
			@onRemove="onRemoveProduct"
			@onShowEdit="editProduct"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import { mapState } from "vuex";
import ProductsList from "@/components/Configuration/ProductsList";
import ProductForm from "@/components/Configuration/ProductForm";
import Modal from "@/components/Modal";
import ProductsService from "@/services/ProductsService";
import { Toast, Notification } from "@/utils/UI";

export default {
	name: "ProductsPage",

	components: {
		ProductsList,
		Modal,
		ProductForm,
	},

	data() {
		return {
			productModal: {
				isWaiting: false,
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			productModel: {
				id: null,
				iso3: "",
				name: "",
				unit: "",
				image: "",
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

		...mapState(["country"]),
	},

	methods: {
		showDetail(product) {
			this.mapToFormModel(product);
			this.productModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
				isWaiting: false,
			};
		},

		mapToFormModel(
			{
				id,
				iso3,
				name,
				image,
				unit,
			},
		) {
			this.productModel = {
				...this.productModel,
				id,
				iso3,
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
				isWaiting: false,
			};
			this.mapToFormModel(product);
		},

		addNewProduct() {
			this.productModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
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
				iso3,
				name,
				image,
				unit,
			} = productForm;

			const productBody = {
				name,
				image,
				unit,
				iso3: iso3 || this.country.iso3,
			};

			if (this.productModal.isEditing && id) {
				this.updateProduct(id, productBody);
			} else {
				this.createProduct(productBody);
			}
		},

		// TODO Fix after we have image handler, crashes on image
		async createProduct(productBody) {
			this.productModal.isWaiting = true;

			await ProductsService.createProduct(productBody).then((response) => {
				if (response.status === 200) {
					Toast("Product Successfully Created", "is-success");
					this.$refs.productsList.fetchData();
					this.closeProductModal();
				}
			}).catch((e) => {
				Notification(`Product ${e}`, "is-danger");
				this.productModal.isWaiting = false;
			});
		},

		// TODO Fix after we have image handler, crashes on image
		async updateProduct(id, productBody) {
			this.productModal.isWaiting = true;

			await ProductsService.updateProduct(id, productBody).then((response) => {
				if (response.status === 200) {
					Toast("Product Successfully Updated", "is-success");
					this.$refs.productsList.fetchData();
					this.closeProductModal();
				}
			}).catch((e) => {
				Notification(`Product ${e}`, "is-danger");
				this.productModal.isWaiting = false;
			});
		},

		async onRemoveProduct(id) {
			await ProductsService.removeProduct(id).then((response) => {
				if (response.status === 204) {
					Toast("Product Successfully Removed", "is-success");
					this.$refs.productsList.removeFromList(id);
				}
			}).catch((e) => {
				Notification(`Product ${e}`, "is-danger");
			});
		},
	},
};
</script>
