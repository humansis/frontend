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

		<ProductList
			ref="ProductList"
			@onRemove="onRemoveProduct"
			@onShowEdit="editProduct"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import { mapState } from "vuex";
import ProductList from "@/components/Configuration/ProductList";
import ProductForm from "@/components/Configuration/ProductForm";
import Modal from "@/components/Modal";
import ProductService from "@/services/ProductService";
import { Toast } from "@/utils/UI";

export default {
	name: "ProductPage",

	components: {
		ProductList,
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
				uploadedImage,
			} = productForm;
			const productBody = {
				name,
				image,
				unit,
				iso3: iso3 || this.country.iso3,
			};

			if (this.productModal.isEditing && id) {
				this.updateProduct(id, productBody, uploadedImage);
			} else {
				this.createProduct(productBody, uploadedImage);
			}
		},

		// TODO Fix after we have image handler, crashes on image
		async createProduct(productBody, image) {
			this.productModal.isWaiting = true;

			await ProductService.createProduct(productBody).then(async ({ data, status }) => {
				if (status === 200) {
					await this.uploadImage(data.id, image);
					Toast("Product Successfully Created", "is-success");
					this.$refs.ProductList.fetchData();
					this.closeProductModal();
				}
			}).catch((e) => {
				Toast(`Product ${e}`, "is-danger");
				this.productModal.isWaiting = false;
			});
		},

		// TODO Fix after we have image handler, crashes on image
		async updateProduct(id, productBody, image) {
			this.productModal.isWaiting = true;

			await ProductService.updateProduct(id, productBody).then(async ({ data, status }) => {
				if (status === 200) {
					await this.uploadImage(data.id, image);
					Toast("Product Successfully Updated", "is-success");
					this.$refs.ProductList.fetchData();
					this.closeProductModal();
				}
			}).catch((e) => {
				Toast(`Product ${e}`, "is-danger");
				this.productModal.isWaiting = false;
			});
		},

		async uploadImage(id, image) {
			console.log(image);
			if (image) {
				await ProductService.uploadImage(id, image);
			}
		},

		async onRemoveProduct(id) {
			await ProductService.removeProduct(id).then(({ status }) => {
				if (status === 204) {
					Toast("Product Successfully Removed", "is-success");
					this.$refs.ProductList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`Product ${e}`, "is-danger");
			});
		},
	},
};
</script>
