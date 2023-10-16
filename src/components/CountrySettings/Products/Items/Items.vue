<template>
	<div>
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
				:categories="categories"
				:formModel="productModel"
				:editing="productModal.isEditing"
				:form-disabled="productModal.isDetail"
				:submit-button-label="productModal.isEditing ? $t('Update') : $t('Create')"
				@formSubmitted="submitProductForm"
				@formClosed="closeProductModal"
			/>
		</Modal>
		<div class="add-config-btn">
			<b-button
				v-if="userCan.addEditProducts"
				class="mb-4"
				type="is-primary"
				icon-left="plus"
				@click="addNewProduct"
			>
				{{ $t('Add') }}
			</b-button>
		</div>
		<ProductsList
			ref="productsList"
			:categories="categories"
			@remove="removeProduct"
			@showEdit="editProduct"
			@showDetail="showDetail"
		/>
	</div>
</template>

<script>
import { mapState } from "vuex";
import ProductService from "@/services/ProductService";
import ProductForm from "@/components/CountrySettings/Products/Items/ProductForm";
import ProductsList from "@/components/CountrySettings/Products/Items/ProductsList";
import Modal from "@/components/Modal";
import permissions from "@/mixins/permissions";
import { Notification, Toast } from "@/utils/UI";
import { CURRENCIES } from "@/consts";

export default {
	name: "Items",

	components: {
		ProductsList,
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
				productCategoryId: null,
				unit: "",
				unitPrice: 0,
				currency: "",
				image: "",
				uploadedImage: null,
			},
			categories: [],
			currencies: CURRENCIES,
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

	created() {
		this.fetchCategories();
	},

	methods: {
		async fetchCategories() {
			await ProductService.getListOfCategories(1, 1000).then(({ data }) => {
				this.categories = data;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Donors")} ${e}`, "is-danger");
			});
		},

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
				productCategoryId,
				image,
				unit,
				unitPrice,
				currency,
				uploadedImage,
			},
		) {
			const productCategory = this.categories.find((item) => productCategoryId === item.id);
			const productCurrency = this.currencies.find((item) => currency === item.value);

			this.productModel = {
				...this.productModel,
				id,
				iso3,
				name,
				productCategoryId: productCategory,
				image,
				unit,
				unitPrice,
				currency: productCurrency,
				uploadedImage,
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
				productCategoryId: null,
				image: null,
				unit: "",
				unitPrice: 0,
				currency: "",
				uploadedImage: null,
			};
		},

		async submitProductForm(productForm) {
			const {
				id,
				iso3,
				name,
				productCategoryId,
				image,
				unit,
				unitPrice,
				currency,
				uploadedImage,
			} = productForm;

			const productBody = {
				name,
				productCategoryId: productCategoryId.id,
				unit,
				unitPrice,
				currency: currency?.value || "",
				iso3: iso3 || this.country.iso3,
			};

			const imageUrl = await this.uploadProductImage(uploadedImage);
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
					this.$refs.productsList.fetchData();
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
					this.$refs.productsList.fetchData();
					this.closeProductModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("Product")} ${e}`, "is-danger");
				this.productModal.isWaiting = false;
			});
		},

		async uploadProductImage(image) {
			if (image) {
				const { data: { url } } = await ProductService.uploadProductImage(image);
				return url;
			}
			return null;
		},

		async removeProduct(id) {
			await ProductService.removeProduct(id).then(({ status }) => {
				if (status === 204) {
					Toast(this.$t("Product Successfully Removed"), "is-success");
					this.$refs.productsList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`${this.$t("Product")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
