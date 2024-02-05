<template>
	<v-menu
		v-model="isColorPickerOpened"
		:close-on-content-click="false"
		:nudge-right="40"
		:disabled="disabled"
		transition="scale-transition"
	>
		<template v-slot:activator="{ props }">
			<div v-bind="props" :style="blockColor" class="color-picker" />
		</template>

		<v-color-picker
			v-if="!disabled"
			v-model="pickedColor"
			hide-inputs
			hide-sliders
			show-swatches
			flat
			@update:modelValue="$emit('update:modelValue', $event)"
		/>
	</v-menu>
</template>

<script>
export default {
	name: "ColorPicker",

	props: {
		disabled: {
			type: Boolean,
			default: false,
		},

		modelValue: {
			type: String,
			default: "",
		},

		value: {
			type: String,
			default: "",
		},
	},

	data() {
		return {
			isColorPickerOpened: false,
			pickedColor: this.modelValue || this.value,
		};
	},

	computed: {
		blockColor() {
			return { backgroundColor: this.pickedColor?.length > 0 ? this.pickedColor : "#134F5C" };
		},
	},

	watch: {
		modelValue(value) {
			this.pickedColor = value;
		},
	},
};
</script>

<style lang="scss" scoped>
.color-picker {
	cursor: pointer;
	height: 2.5rem;
	width: 2.5rem;
	border-radius: .75rem;
}
</style>
