<template>
	<span class="multiselect__tag">
		<span v-text="elementValue" />
		<i
			tabindex="1"
			@keypress.enter.prevent="removeElement(props.option)"
			@mousedown.prevent="removeElement(props.option)"
			class="multiselect__tag-icon"
		/>
	</span>
</template>

<script>
import { normalizeTags, normalizeText } from "@/utils/datagrid";

export default {
	name: "MultiSelectTag",

	props: {
		props: Object,
		items: Array,
		isDataWithUnderscore: {
			type: Boolean,
			default: true,
		},
	},

	methods: {
		normalizeText(value) {
			return normalizeText(value);
		},

		removeElement(option) {
			const slicedItems = this.items.filter((item) => item.code !== option.code);
			this.$emit("optionRemoved", slicedItems);
		},
	},

	computed: {
		elementValue() {
			return this.isDataWithUnderscore
				? normalizeText(this.props.option.value)
				: normalizeTags(this.props.option.value);
		},
	},
};
</script>
