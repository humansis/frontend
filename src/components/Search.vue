<template>
	<b-field>
		<b-input
			v-model="value"
			icon-right-clickable
			icon-right="times"
			:placeholder="$t('Search')"
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

	methods: {
		search() {
			this.$emit("search", this.value);
		},

		clearSearch() {
			if (this.value) {
				this.value = "";
				this.search();
			}
		},
	},
};
</script>
