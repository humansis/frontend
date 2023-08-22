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
import { normalizeSelectorValue, normalizeText } from "@/utils/datagrid";

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
		removeElement(option) {
			const slicedItems = this.items.filter((item) => item.code !== option.code);
			this.$emit("optionRemoved", slicedItems);
		},
	},

	computed: {
		elementValue() {
			return this.isDataWithUnderscore
				? normalizeText(this.props.option.value)
				: normalizeSelectorValue(this.props.option.value);
		},
	},
};
</script>
