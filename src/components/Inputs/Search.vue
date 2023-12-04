<template>
	<DataInput
		v-model="value"
		label="Search"
		name="search"
		variant="outlined"
		density="compact"
		hide-details="auto"
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
	min-width: 180px;
	max-width: 225px;

	> .v-input__control {
		margin-right: 25px;
	}
}
</style>
