<template>
	<DataInput
		v-model="value"
		label="Search"
		name="search"
		append-inner-icon="search"
		clearable
		class="search"
		@click:append-inner="search"
		@click:clear="search"
	/>
</template>

<script>
import DataInput from "@/components/Inputs/DataInput";

export default {
	name: "Search",

	components: {
		DataInput,
	},

	props: {
		searchPhrase: {
			type: String,
			default: "",
		},

		// searchFields: {
		// 	type: Array,
		// 	required: true,
		// },
		//
		// defaultSearchField: {
		// 	type: Object,
		// 	required: () => {},
		// },

		isDisabled: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			value: "",
			// selectedSearchField: this.defaultSearchField,
		};
	},

	computed: {
		isSearchDisabled() {
			return !!(this.searchFields.length && !this.selectedSearchField) || this.isDisabled;
		},
	},

	mounted() {
		if (this.searchPhrase) {
			this.value = this.searchPhrase;
		}
	},

	methods: {
		search() {
			const searchBody = this.searchFields?.length
				? { phrase: this.value, field: this.selectedSearchField }
				: this.value;

			this.$emit("search", searchBody);
		},
	},
};
</script>

<style lang="scss">
.search {
	min-width: 11.25rem;
	max-width: 14.06rem;

	> .v-input__control {
		margin-right: 1.5625rem;
	}
}
</style>
