<template>
	<b-field>
		<b-input
			v-model="value"
			:placeholder="$t('Search')"
			type="search"
			icon="search"
			:loading="loading"
			@keypress.enter.native="onSearch"
		/>
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
			timer: null,
			loading: false,
		};
	},

	watch: {
		value() {
			this.onSearch();
		},
	},

	mounted() {
		if (this.searchPhrase) {
			this.value = this.searchPhrase;
		}
	},

	methods: {
		onSearch(event) {
			if (this.backendSearch) {
				clearTimeout(this.timer);
				this.loading = true;
				if (event) {
					this.$emit("search", this.value);
					this.loading = false;
				} else {
					this.timer = setTimeout(() => {
						this.$emit("search", this.value);
						this.loading = false;
					}, 1000);
				}
			} else {
				this.$emit("search", this.value);
			}
		},
	},
};
</script>
