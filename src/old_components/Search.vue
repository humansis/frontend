<template>
	<b-field>
		<b-select
			v-if="searchFields.length"
			:placeholder="$t('Select format')"
			v-model="selectedSearchField"
		>
			<option
				v-for="(field, key) of searchFields"
				:value="field"
				:key="key"
			>
				{{ $t(field.value) }}
			</option>
		</b-select>
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
					:disabled="isSearchDisabled"
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
			required: () => {},
		},

		isDisabled: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			value: "",
			selectedSearchField: this.defaultSearchField,
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
			const searchBody = this.searchFields.length
				? { phrase: this.value, field: this.selectedSearchField }
				: this.value;

			this.$emit("search", searchBody);
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
