<template>
	<v-autocomplete
		v-model="data"
		:items="options"
		:readonly="disabled"
		:disabled="disabled"
		:clearable="!disabled && isClearable"
		:item-title="itemTitle"
		:item-value="itemValue"
		:variant="variant"
		:density="density"
		:hide-details="hideDetails"
		:placeholder="$t(placeholder)"
		:multiple="multiple"
		:chips="multiple"
		:closable-chips="multiple && !disabled"
		:no-data-text="$t('List is empty')"
		autocomplete="off"
		return-object
		@update:modelValue="$emit('update:modelValue', $event)"
	>
		<template v-slot:label>
			<span>{{ $t(label) }}
				<i v-if="optional" class="optional-text">- {{ $t('Optional') }}</i>
			</span>
		</template>

		<template v-if="!multiple" v-slot:item="{ props, item }">
			<slot v-bind="props" name="custom-item" :props="props" :item="item">
				<v-list-item v-bind="props" :title="$t(normalizeFirstLetter(item.title))" />
			</slot>
		</template>

		<template v-if="isAppendIconEnabled" v-slot:append>
			<v-icon
				v-if="!iconLoading"
				:icon="appendIcon"
				:color="appendIconColor"
				@click="$emit('append-icon-clicked')"
			/>

			<v-progress-circular
				v-else
				:size="25"
				:indeterminate="iconLoading"
				color="primary"
			/>
		</template>

		<template v-slot:prepend-item>
			<v-list v-if="multiple">
				<v-list-item
					v-if="multiple"
					:title="$t('Select All')"
					@click="onSelectAll"
				>
					<template v-slot:prepend>
						<v-checkbox-btn
							:color="selectedSomeOptions ? 'indigo-darken-4' : 'white'"
							:indeterminate="selectedSomeOptions && !selectedAllOptions"
							:model-value="selectedSomeOptions"
						/>
					</template>
				</v-list-item>

				<v-divider class="mt-2" />
			</v-list>
		</template>
	</v-autocomplete>
</template>

<script>
import { normalizeFirstLetter } from "@/utils/datagrid";

export default {
	props: {
		modelValue: {
			type: [Object, Number, String],
			default: null,
		},

		label: {
			type: String,
			default: "",
		},

		appendIcon: {
			type: String,
			default: "",
		},

		iconLoading: {
			type: Boolean,
			default: false,
		},

		optional: {
			type: Boolean,
			default: false,
		},

		items: {
			type: Array,
			default: () => [],
		},

		disabled: {
			type: Boolean,
			default: false,
		},

		isClearable: {
			type: Boolean,
			default: true,
		},

		itemTitle: {
			type: String,
			default: "value",
		},

		itemValue: {
			type: String,
			default: "code",
		},

		isAppendIconEnabled: {
			type: Boolean,
			default: false,
		},

		appendIconColor: {
			type: String,
			default: "",
		},

		variant: {
			type: String,
			default: "outlined",
		},

		density: {
			type: String,
			default: "compact",
		},

		hideDetails: {
			type: String,
			default: "auto",
		},

		multiple: {
			type: Boolean,
			default: false,
		},

		placeholder: {
			type: String,
			default: "",
		},
	},

	data() {
		return {
			options: this.items,
			data: this.modelValue,
			searchValue: "",
		};
	},

	computed: {
		selectedAllOptions() {
			return this.data?.length === this.options.length;
		},

		selectedSomeOptions() {
			return this.data?.length > 0;
		},
	},

	watch: {
		items(value) {
			this.options = value;
		},

		modelValue(value) {
			this.data = value;
		},
	},

	methods: {
		onSearch() {
			this.options = this.items;
			this.options = this.options.filter(
				(item) => item[this.itemTitle].toLowerCase().includes(this.searchValue.toLowerCase()),
			);
		},

		onSelectAll() {
			this.data = this.selectedAllOptions ? [] : this.options;
			this.$emit("update:modelValue", this.data);
		},

		normalizeFirstLetter(value) {
			return normalizeFirstLetter(value);
		},
	},

};
</script>
