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
				:data-cy="identifierBuilder('items-tab-button')"
				value="items"
				class="text-none"
			>
				<v-icon icon="list" class="mr-2" />

				{{ $t('Items') }}
			</v-tab>

			<v-tab
				:data-cy="identifierBuilder('categories-tab-button')"
				value="categories"
				class="text-none"
			>
				<v-icon icon="list" class="mr-2" />

				{{ $t('Categories') }}
			</v-tab>
		</v-tabs>

		<v-window v-model="selectedTab">
			<v-window-item value="items">
				<Items />
			</v-window-item>

			<v-window-item value="categories">
				<Categories />
			</v-window-item>
		</v-window>
	</v-container>
</template>

<script>
import Categories from "@/components/CountrySettings/Products/Categories";
import Items from "@/components/CountrySettings/Products/Items";
import identifierBuilder from "@/mixins/identifierBuilder";

export default {
	name: "Products",

	components: {
		Items,
		Categories,
	},

	mixins: [identifierBuilder],

	data() {
		return {
			selectedTab: "items",
		};
	},
};
</script>
