<template>
	<div class="d-inline-flex ml-4" :class="{ 'flex-column': isMobile }">
		<DataSelect
			v-if="searchFields.length"
			v-model="selectedSearchField"
			:items="searchFields"
			label="Select format"
			name="select-format"
			item-title="value"
			item-value="code"
			clearable
			class="format"
		/>

		<DataInput
			v-model="value"
			label="Search"
			name="search"
			append-inner-icon="search"
			class="search"
			clearable
			@click:appendInner="onSearch"
			@click:clear="onSearch"
		/>
	</div>
</template>

<script>
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import vuetifyHelper from "@/mixins/vuetifyHelper";

export default {
	name: "Search",

	components: {
		DataInput,
		DataSelect,
	},

	mixins: [vuetifyHelper],

	props: {
		searchPhrase: {
			type: String,
			default: "",
		},

		searchFields: {
			type: Array,
			required: true,
		},

		defaultSearchField: {
			type: Object,
			default: () => {},
		},

		isDisabled: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			value: this.searchPhrase,
			selectedSearchField: this.defaultSearchField,
		};
	},

	computed: {
		isSearchDisabled() {
			return !!(this.searchFields.length && !this.selectedSearchField) || this.isDisabled;
		},
	},

	methods: {
		onSearch() {
			const searchBody = this.searchFields?.length
				? { phrase: this.value, field: this.selectedSearchField }
				: this.value;

			this.$emit("search", searchBody);
		},

		clearSearch() {
			if (this.value) {
				this.value = "";
				this.onSearch();
			}
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

.format {
	min-width: 12rem;
	max-width: 15rem;

}
</style>
