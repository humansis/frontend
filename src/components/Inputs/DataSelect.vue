<template>
	<v-select
		v-model="data"
		:items="options"
		:readonly="disabled"
		:disabled="disabled"
		:clearable="!disabled && isClearable"
		:item-title="itemTitle"
		:variant="variant"
		:density="density"
		:hide-details="hideDetails"
		return-object
		@update:modelValue="$emit('update:modelValue', $event)"
	>
		<template v-slot:label>
			<span>{{ $t(label) }}
				<i v-if="optional" class="optional-text">- {{ $t('Optional') }}</i>
			</span>
		</template>

		<template v-slot:item="{ props, item }">
			<v-list-item v-bind="props" :title="$t(normalizeFirstLetter(item.title))" />
		</template>

		<template v-slot:selection="{ item }">
			<v-chip v-if="isDataShownAsTag" :closable="!disabled" @click:close="chipClosed(item)">
				<span>{{ $t(item.title) }}</span>
			</v-chip>

			<span v-else>{{ $t(normalizeFirstLetter(item.title)) }}</span>
		</template>

		<template v-if="iconLoading || (!iconLoading && appendIcon)" v-slot:append>
			<v-icon
				v-if="!iconLoading && appendIcon && isAppendIconEnabled"
				:icon="appendIcon"
				@click="$emit('append-icon-clicked')"
			/>

			<v-progress-circular
				v-if="iconLoading"
				:size="25"
				:indeterminate="iconLoading"
				color="primary"
			/>
		</template>

		<template v-slot:prepend-item>
			<v-list v-if="isSearchEnabled || $attrs.multiple">
				<v-list-item v-if="isSearchEnabled">
					<v-text-field
						v-model="searchValue"
						placeholder="Search"
						density="compact"
						hide-details="auto"
						@input="search"
					/>
				</v-list-item>

				<v-list-item
					v-if="$attrs.multiple"
					:title="$t('Select All')"
					@click="selectAll"
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
	</v-select>
</template>

<script>
import { normalizeFirstLetter } from "@/utils/datagrid";

export default {
	props: {
		label: {
			type: String,
			default: "",
		},

		isSearchEnabled: {
			type: Boolean,
			default: false,
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

		isDataShownAsTag: {
			type: Boolean,
			default: false,
		},

		disabled: {
			type: Boolean,
			default: false,
		},

		isClearable: {
			type: Boolean,
			default: true,
		},

		modelValue: {
			type: Object,
			default: () => {},
		},

		itemTitle: {
			type: String,
			default: "value",
		},

		isAppendIconEnabled: {
			type: Boolean,
			default: false,
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
		search() {
			this.options = this.items;
			this.options = this.options.filter(
				(item) => item[this.itemTitle].toLowerCase().includes(this.searchValue.toLowerCase()),
			);
		},

		selectAll() {
			this.data = this.selectedAllOptions ? [] : this.options;
			this.$emit("update:modelValue", this.data);
		},

		chipClosed(item) {
			const updatedModel = this.$attrs.modelValue.filter(
				(removedItem) => removedItem !== item.value,
			);

			this.$emit("update:modelValue", updatedModel);
		},

		normalizeFirstLetter(value) {
			return normalizeFirstLetter(value);
		},
	},

};
</script>
