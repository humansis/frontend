<template>
	<Modal
		v-model="productModal.isOpened"
		:header="modalHeader"
	>
		<ProductForm
			:categories="categories"
			:form-model="productModel"
			:editing="productModal.isEditing"
			:form-disabled="productModal.isDetail"
			:submit-button-label="productModal.isEditing ? 'Update' : 'Create'"
			close-button
			@formSubmitted="onSubmitProductForm"
			@formClosed="onCloseProductModal"
		/>
	</Modal>

	<div class="d-flex justify-end">
		<v-btn
			v-if="userCan.addEditProducts"
			:data-cy="identifierBuilder('items-new-button')"
			class="text-none ml-0 mb-3"
			color="primary"
			prepend-icon="plus"
			@click="onAddNewProduct"
		>
			{{ $t('New') }}
		</v-btn>
	</div>

	<ProductsList
		ref="productsList"
		:categories="categories"
		@delete="onRemoveProduct"
		@showEdit="onEditProduct"
		@showDetail="onShowDetail"
	/>
</template>

<script>
import { mapState } from "vuex";
import ProductService from "@/services/ProductService";
import ProductForm from "@/components/CountrySettings/Products/Items/ProductForm";
import ProductsList from "@/components/CountrySettings/Products/Items/ProductsList";
import Modal from "@/components/Inputs/Modal";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { CURRENCIES } from "@/consts";

export default {
	name: "Items",

	components: {
		ProductsList,
		Modal,
		ProductForm,
	},

	mixins: [permissions, identifierBuilder],

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
				image: [],
				uploadedImage: null,
			},
			categories: [],
			currencies: CURRENCIES,
		};
	},

	computed: {
		modalHeader() {
			if (this.productModal.isDetail) {
				return "Detail of Product";
			}

			if (this.productModal.isEditing) {
				return "Edit Product";
			}

			return "Create New Product";
		},

		...mapState(["country"]),
	},

	created() {
		this.fetchCategories();
	},

	methods: {
		async fetchCategories() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await ProductService.getListOfCategories({
					page: 1,
					size: 1000,
				});

				checkResponseStatus(status, message);

				this.categories = data;
			} catch (e) {
				Notification(`${this.$t("Categories")}: ${e.message || e}`, "error");
			}
		},

		onShowDetail(product) {
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

		onCloseProductModal() {
			this.productModal.isOpened = false;
		},

		onEditProduct(product) {
			this.productModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
			this.mapToFormModel(product);
		},

		onAddNewProduct() {
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

		async onSubmitProductForm(productForm) {
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
				unitPrice: unitPrice || null,
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
			try {
				this.productModal.isWaiting = true;

				const {
					status,
					message,
				} = await ProductService.createProduct(productBody);

				checkResponseStatus(status, message);

				Notification(this.$t("Product Successfully Created"), "success");
				await this.$refs.productsList.fetchData();
				this.onCloseProductModal();
			} catch (e) {
				Notification(`${this.$t("Product")}: ${e.message || e}`, "error");
			} finally {
				this.productModal.isWaiting = false;
			}
		},

		async updateProduct(id, productBody) {
			try {
				this.productModal.isWaiting = true;

				const {
					status,
					message,
				} = await ProductService.updateProduct({
					id,
					body: productBody,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("Product Successfully Updated"), "success");
				await this.$refs.productsList.fetchData();
				this.onCloseProductModal();
			} catch (e) {
				Notification(`${this.$t("Product")}: ${e.message || e}`, "error");
			} finally {
				this.productModal.isWaiting = false;
			}
		},

		async uploadProductImage(image) {
			if (image) {
				try {
					const {
						data: { url },
						status,
						message,
					} = await ProductService.uploadProductImage(image);

					checkResponseStatus(status, message);

					return url;
				} catch (e) {
					Notification(`${this.$t("Image upload")}: ${e.message || e}`, "error");
				}
			}
			return null;
		},

		async onRemoveProduct(id) {
			try {
				const {
					status,
					message,
				} = await ProductService.removeProduct(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Product Successfully Removed"), "success");
				this.$refs.productsList.removeFromList(id);
			} catch (e) {
				Notification(`${this.$t("Product")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
