<template>
	<span class="multiselect__tag">
		<span v-text="normalizeText(props.option.value)" />
		<i
			tabindex="1"
			@keypress.enter.prevent="removeElement(props.option)"
			@mousedown.prevent="removeElement(props.option)"
			class="multiselect__tag-icon"
		/>
	</span>
</template>

<script>
import { normalizeText } from "@/utils/datagrid";

export default {
	name: "MultiSelectTag",

	props: {
		props: Object,
		items: Array,
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
};
</script>
