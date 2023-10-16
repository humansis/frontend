<template>
	<b-select
		v-if="!multiple"
		class="custom-select"
		:disabled="disabled"
		:loading="loading"
		:expanded="expanded"
		@select="$emit('select', $event)"
	>
		<option
			v-for="option in options"
			:key="option.code"
			:value="option.code"
		>
			{{ option.value }}
		</option>
	</b-select>
</template>

<script>
export default {
	name: "Multiselect",

	props: {
		options: Array,
		disabled: Boolean,
		placeholder: String,

		multiple: {
			type: Boolean,
			default: false,
		},

		loading: {
			type: Boolean,
			default: false,
		},

		expanded: {
			type: Boolean,
			default: true,
		},
	},
};
</script>
