<template>
	<b-field>
		<b-input
			v-model="value"
			icon-right-clickable
			:placeholder="$t('Search')"
			:icon-right="closeIcon"
			@icon-right-click="clearSearch"
			@keyup.native.enter="search"
		/>
		<div class="control">
			<b-button
				icon-left="search"
				class="button is-primary"
				@click="search"
			/>
		</div>
	</b-field>
</template>

<script>
export default {
	name: "Search",

	props: {
		backendSearch: {
			type: Boolean,
			default: true,
		},
		searchPhrase: {
			type: String,
			default: "",
		},
	},

	data() {
		return {
			value: "",
		};
	},

	mounted() {
		if (this.searchPhrase) {
			this.value = this.searchPhrase;
		}
	},

	computed: {
		closeIcon() {
			return this.value.length ? "times" : "";
		},
	},

	methods: {
		search() {
			this.$emit("search", this.value);
		},

		clearSearch() {
			this.value = "";
			this.search();
		},
	},
};
</script>
