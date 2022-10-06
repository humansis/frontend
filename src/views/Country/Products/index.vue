<template>
	<div>
		<h1 class="title has-text-centered">{{ $t('Products') }}</h1>

		<b-tabs v-model="selectedTab">
			<b-tab-item icon="list" :label="$t('Items')">
				<Items />
			</b-tab-item>

			<b-tab-item icon="list" :label="$t('Categories')">
				<Categories />
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
import Items from "@/views/Country/Products/Items";
import Categories from "@/views/Country/Products/Categories";

export default {
	name: "Products",

	components: {
		Items,
		Categories,
	},

	data() {
		return {
			selectedTab: 0,
		};
	},
};
</script>
