<template>
	<b-field>
		<b-input
			v-model="value"
			icon-right-clickable
			icon-right="times"
			:placeholder="$t('Search')"
			:disabled="isDisabled"
			@icon-right-click="clearSearch"
			@keyup.native.enter="search"
		/>
		<div class="control">
			<b-tooltip :label="$t('Search')">
				<b-button
					icon-left="search"
					:disabled="isDisabled"
					class="button is-primary"
					@click="search"
				/>
			</b-tooltip>
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
		isDisabled: {
			type: Boolean,
			default: false,
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
