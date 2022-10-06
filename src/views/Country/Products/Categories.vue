<template>
	<div>
		<Modal
			can-cancel
			:active="categoryModal.isOpened"
			:header="modalHeader"
			:is-waiting="categoryModal.isWaiting"
			@close="closeCategoryModal"
		>
			<CategoryForm
				close-button
				class="modal-card"
				:formModel="categoryModel"
				:editing="categoryModal.isEditing"
				:form-disabled="categoryModal.isDetail"
				:submit-button-label="categoryModal.isEditing ? $t('Update') : $t('Create')"
				@formSubmitted="submitCategoryForm"
				@formClosed="closeCategoryModal"
			/>
		</Modal>
		<div class="add-config-btn">
			<b-button
				v-if="userCan.addEditProducts"
				class="mb-4"
				type="is-primary"
				icon-left="plus"
				@click="addNewCategory"
			>
				{{ $t('Add') }}
			</b-button>
		</div>
		<CategoriesList
			ref="categoriesList"
			@onRemove="onRemoveCategory"
			@onShowEdit="editCategory"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import { mapState } from "vuex";
import CategoriesList from "@/components/Country/Products/CategoriesList";
import CategoryForm from "@/components/Country/Products/CategoryForm";
import Modal from "@/components/Modal";
import ProductService from "@/services/ProductService";
import { Toast } from "@/utils/UI";
import permissions from "@/mixins/permissions";

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
				result = this.$t("Detail of Category");
			} else if (this.categoryModal.isEditing) {
				result = this.$t("Edit Category");
			} else {
				result = this.$t("Create New Category");
			}
			return result;
		},

		...mapState(["country"]),
	},

	methods: {
		showDetail(category) {
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

		closeCategoryModal() {
			this.categoryModal.isOpened = false;
		},

		editCategory(category) {
			this.categoryModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
			this.mapToFormModel(category);
		},

		addNewCategory() {
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

		async submitCategoryForm(categoryForm) {
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
					Toast(this.$t("Category Successfully Created"), "is-success");
					this.$refs.categoriesList.fetchData();
					this.closeCategoryModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("Category")} ${e}`, "is-danger");
				this.categoryModal.isWaiting = false;
			});
		},

		async updateCategory(id, categoryBody) {
			this.categoryModal.isWaiting = true;

			await ProductService.updateCategory(id, categoryBody).then(({ status }) => {
				if (status === 200) {
					Toast(this.$t("Category Successfully Updated"), "is-success");
					this.$refs.categoriesList.fetchData();
					this.closeCategoryModal();
				}
			}).catch((e) => {
				Toast(`${this.$t("Category")} ${e}`, "is-danger");
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
					Toast(this.$t("Category Successfully Removed"), "is-success");
					this.$refs.categoriesList.removeFromList(id);
				}
			}).catch((e) => {
				Toast(`${this.$t("Category")} ${e}`, "is-danger");
			});
		},
	},
};
</script>
