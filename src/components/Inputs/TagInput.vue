<template>
	<v-combobox
		v-model="data"
		:variant="variant"
		:density="density"
		:disabled="disabled"
		:delimiters="[',']"
		:hint="$t(hint)"
		:hide-details="hideDetails"
		:allow-overflow="false"
		@update:modelValue="$emit('update:modelValue', $event)"
	>
		<template v-slot:label>
			<span>{{ $t(label) }}
				<i v-if="optional" class="optional-text">- {{ $t('Optional') }}</i>
			</span>
		</template>

		<template v-slot:selection="{ attrs, item }">
			<v-chip
				v-bind="attrs"
				:closable="!disabled"
				size="small"
				color="primary"
				@click:close="chipClosed(item)"
			>
				<span class="pr-2">
					{{ item.title }}
				</span>
			</v-chip>
		</template>
	</v-combobox>
</template>

<script>
export default {
	name: "TagInput",

	props: {
		variant: {
			type: String,
			default: "outlined",
		},

		density: {
			type: String,
			default: "compact",
		},

		modelValue: {
			type: Array,
			default: () => [],
		},

		disabled: {
			type: Boolean,
			default: false,
		},

		label: {
			type: String,
			required: true,
		},

		optional: {
			type: Boolean,
			default: false,
		},

		hint: {
			type: String,
			default: "",
		},

		hideDetails: {
			type: String,
			default: "auto",
		},
	},

	data() {
		return {
			data: this.modelValue,
		};
	},

	watch: {
		modelValue(value) {
			this.data = value;
		},
	},

	methods: {
		chipClosed(item) {
			const updatedModel = this.modelValue.filter(
				(removedItem) => removedItem !== item.value,
			);

			this.$emit("update:modelValue", updatedModel);
		},
	},
};
</script>
