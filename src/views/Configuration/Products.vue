<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">{{ $t('Products') }}</h1>
			</div>

			<div class="level-right">
				<b-button
					v-if="userCan.addEditProducts"
					type="is-primary"
					icon-left="plus"
					@click="addNewProduct"
				>
					{{ $t('Add') }}
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
				:submit-button-label="productModal.isEditing ? $t('Update') : $t('Create')"
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
import permissions from "@/mixins/permissions";

export default {
	name: "ProductPage",

	components: {
		ProductList,
		Modal,
		ProductForm,
	},

	mixins: [permissions],

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
				result = this.$t("Detail of Product");
			} else if (this.productModal.isEditing) {
				result = this.$t("Edit Product");
			} else {
				result = this.$t("Create New Product");
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

		async submitProductForm(productForm) {
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
				unit,
				iso3: iso3 || this.country.iso3,
			};

			const imageUrl = await this.uploadImage(uploadedImage);
			productBody.image = imageUrl || image;

			if (this.productModal.isEditing && id) {
				await this.updateProduct(id, productBody);
			} else {
				await this.createProduct(productBody);
			}
		},

		async createProduct(productBody) {
			this.productModal.isWaiting = true;

			await ProductService.createProduct(productBody).then(({ status }) => {
				if (status === 200) {
					Toast(this.$t("Product Successfully Created"), "is-success");
					this.$refs.ProductList.fetchData();
					this.closeProductModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("Product")} ${e}`, "is-danger");
				this.productModal.isWaiting = false;
			});
		},

		async updateProduct(id, productBody) {
			this.productModal.isWaiting = true;

			await ProductService.updateProduct(id, productBody).then(({ status }) => {
				if (status === 200) {
					Toast(this.$t("Product Successfully Updated"), "is-success");
					this.$refs.ProductList.fetchData();
					this.closeProductModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("Product")} ${e}`, "is-danger");
				this.productModal.isWaiting = false;
			});
		},

		async uploadImage(image) {
			if (image) {
				const { data: { url } } = await ProductService.uploadImage(image);
				return url;
			}
			return null;
		},

		async onRemoveProduct(id) {
			await ProductService.removeProduct(id).then(({ status }) => {
				if (status === 204) {
					Toast(this.$t("Product Successfully Removed"), "is-success");
					this.$refs.ProductList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`${this.$t("Product")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
