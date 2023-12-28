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
			v-if="userCan.addEditProducts"
			class="text-none ml-0 mb-3"
			color="primary"
			size="small"
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
import permissions from "@/mixins/permissions";
import { Notification } from "@/utils/UI";

export default {
	name: "Categories",

	components: {
		CategoriesList,
		CategoryForm,
		Modal,
	},

	mixins: [permissions],

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
			let result = "";
			if (this.categoryModal.isDetail) {
				result = "Detail of Category";
			} else if (this.categoryModal.isEditing) {
				result = "Edit Category";
			} else {
				result = "Create New Category";
			}
			return result;
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
			this.categoryModal.isWaiting = true;

			await ProductService.createCategory(categoryBody).then(({ status }) => {
				if (status === 200) {
					Notification(this.$t("Category Successfully Created"), "success");
					this.$refs.categoriesList.fetchData();
					this.onCloseCategoryModal();
				}
			}).catch((e) => {
				Notification(`${this.$t("Category")} ${e.message || e}`, "error");
				this.categoryModal.isWaiting = false;
			});
		},

		async updateCategory(id, categoryBody) {
			this.categoryModal.isWaiting = true;

			await ProductService.updateCategory(id, categoryBody).then(({ status }) => {
				if (status === 200) {
					Notification(this.$t("Category Successfully Updated"), "success");
					this.$refs.categoriesList.fetchData();
					this.onCloseCategoryModal();
				}
			}).catch((e) => {
				Notification(`${this.$t("Category")} ${e.message || e}`, "error");
				this.categoryModal.isWaiting = false;
			});
		},

		async uploadCategoryImage(image) {
			if (image) {
				const { data: { url } } = await ProductService.uploadCategoryImage(image);
				return url;
			}
			return null;
		},

		async onRemoveCategory(id) {
			await ProductService.removeCategory(id).then(({ status }) => {
				if (status === 204) {
					Notification(this.$t("Category Successfully Removed"), "success");
					this.$refs.categoriesList.removeFromList(id);
				}
			}).catch((e) => {
				Notification(`${this.$t("Category")} ${e.message || e}`, "error");
			});
		},
	},
};
</script>
