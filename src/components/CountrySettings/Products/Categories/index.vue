<template>
	<Modal
		v-model="categoryModal.isOpened"
		:header="modalHeader"
	>
		<CategoryForm
			:form-model="categoryModel"
			:editing="categoryModal.isEditing"
			:form-disabled="categoryModal.isDetail"
			:submit-button-label="categoryModal.isEditing ? 'Update' : 'Create'"
			close-button
			@formSubmitted="onSubmitCategoryForm"
			@formClosed="onCloseCategoryModal"
		/>
	</Modal>

	<div class="d-flex justify-end">
		<v-btn
			:disabled="!isUserPermissionGranted(PERMISSIONS.COUNTRY_SETTINGS_PRODUCT_ITEMS_CREATE)"
			:data-cy="identifierBuilder('categories-new-button')"
			class="text-none ml-0 mb-3"
			color="primary"
			prepend-icon="plus"
			@click="onAddNewCategory"
		>
			{{ $t('New') }}
		</v-btn>
	</div>

	<CategoriesList
		ref="categoriesList"
		@delete="onRemoveCategory"
		@showEdit="onEditCategory"
		@showDetail="onShowDetail"
	/>
</template>

<script>
import { mapState } from "vuex";
import ProductService from "@/services/ProductService";
import CategoriesList from "@/components/CountrySettings/Products/Categories/CategoriesList";
import CategoryForm from "@/components/CountrySettings/Products/Categories/CategoryForm";
import Modal from "@/components/Inputs/Modal";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "Categories",

	components: {
		CategoriesList,
		CategoryForm,
		Modal,
	},

	mixins: [permissions, identifierBuilder],

	data() {
		return {
			categoryModal: {
				isWaiting: false,
				isOpened: false,
				isEditing: false,
				isDetail: false,
			},
			categoryModel: {
				id: null,
				iso3: "",
				name: "",
				type: "",
				image: "",
			},
		};
	},

	computed: {
		modalHeader() {
			if (this.categoryModal.isDetail) {
				return "Detail of Category";
			}

			if (this.categoryModal.isEditing) {
				return "Edit Category";
			}

			return "Create New Category";
		},

		...mapState(["country"]),
	},

	methods: {
		onShowDetail(category) {
			this.mapToFormModel(category);
			this.categoryModal = {
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
				type,
			},
		) {
			this.categoryModel = {
				...this.categoryModel,
				id,
				iso3,
				name,
				image,
				type: type?.[0]?.code || "Food",
			};
		},

		onCloseCategoryModal() {
			this.categoryModal.isOpened = false;
		},

		onEditCategory(category) {
			this.categoryModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
			this.mapToFormModel(category);
		},

		onAddNewCategory() {
			this.categoryModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};

			this.categoryModel = {
				...this.categoryModel,
				id: null,
				name: "",
				image: null,
				type: "",
			};
		},

		async onSubmitCategoryForm(categoryForm) {
			const {
				id,
				iso3,
				name,
				image,
				type,
				uploadedImage,
			} = categoryForm;
			const categoryBody = {
				name,
				type,
				iso3: iso3 || this.country.iso3,
			};

			const imageUrl = await this.uploadCategoryImage(uploadedImage);
			categoryBody.image = imageUrl || image;

			if (this.categoryModal.isEditing && id) {
				await this.updateCategory(id, categoryBody);
			} else {
				await this.createCategory(categoryBody);
			}
		},

		async createCategory(categoryBody) {
			try {
				this.categoryModal.isWaiting = true;

				const {
					status,
					message,
				} = await ProductService.createCategory(categoryBody);

				checkResponseStatus(status, message);

				Notification(this.$t("Category Successfully Created"), "success");
				await this.$refs.categoriesList.fetchData();
				this.onCloseCategoryModal();
			} catch (e) {
				Notification(`${this.$t("Category")}: ${e.message || e}`, "error");
			} finally {
				this.categoryModal.isWaiting = false;
			}
		},

		async updateCategory(id, categoryBody) {
			try {
				this.categoryModal.isWaiting = true;

				const {
					status,
					message,
				} = await ProductService.updateCategory({
					body: categoryBody,
					id,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("Category Successfully Updated"), "success");
				await this.$refs.categoriesList.fetchData();
				this.onCloseCategoryModal();
			} catch (e) {
				Notification(`${this.$t("Category")}: ${e.message || e}`, "error");
			} finally {
				this.categoryModal.isWaiting = false;
			}
		},

		async uploadCategoryImage(image) {
			if (!image) return null;

			try {
				const {
					data: { url },
					status,
					message,
				} = await ProductService.uploadCategoryImage(image);

				checkResponseStatus(status, message);

				return url;
			} catch (e) {
				Notification(`${this.$t("Image upload")}: ${e.message || e}`, "error");
				return null;
			}
		},

		async onRemoveCategory(id) {
			try {
				const {
					status,
					message,
				} = await ProductService.removeCategory(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Category Successfully Removed"), "success");
				this.$refs.categoriesList.removeFromList(id);
			} catch (e) {
				Notification(`${this.$t("Category")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
