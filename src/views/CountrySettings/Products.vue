<template>
	<v-container fluid>
		<h2 class="text-center mt-4" data-cy="page-title-text">{{ $t('Products') }}</h2>

		<v-tabs
			v-model="selectedTab"
			color="primary"
			align-tabs="start"
			class="mt-5 mb-5"
		>
			<v-tab
				:disabled="!isItemsVisible"
				:data-cy="identifierBuilder('items-tab-button')"
				value="items"
				class="text-none"
			>
				<v-icon icon="list" class="mr-2" />

				{{ $t('Items') }}
			</v-tab>

			<v-tab
				:disabled="!isCategoriesVisible"
				:data-cy="identifierBuilder('categories-tab-button')"
				value="categories"
				class="text-none"
			>
				<v-icon icon="list" class="mr-2" />

				{{ $t('Categories') }}
			</v-tab>
		</v-tabs>

		<v-window v-model="selectedTab">
			<v-window-item v-if="isItemsVisible" value="items">
				<Items />
			</v-window-item>

			<v-window-item v-if="isCategoriesVisible" value="categories">
				<Categories />
			</v-window-item>
		</v-window>
	</v-container>
</template>

<script>
import Categories from "@/components/CountrySettings/Products/Categories";
import Items from "@/components/CountrySettings/Products/Items";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";

export default {
	name: "Products",

	components: {
		Items,
		Categories,
	},

	mixins: [identifierBuilder, permissions],

	data() {
		return {
			selectedTab: "items",
		};
	},

	computed: {
		isItemsVisible() {
			return this.isUserPermissionGranted(this.PERMISSIONS.COUNTRY_SETTINGS_PRODUCT_ITEMS);
		},

		isCategoriesVisible() {
			return this.isUserPermissionGranted(
				this.PERMISSIONS.COUNTRY_SETTINGS_PRODUCT_ITEMS_CREATE,
			);
		},
	},
};
</script>
