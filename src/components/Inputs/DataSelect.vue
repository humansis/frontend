<template>
	<v-select :value="data" :items="options">
		<template v-slot:label>
			<span>{{ $t(label) }}</span>
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

		items: {
			type: Array,
			required: true,
		},
	},

	data() {
		return {
			options: this.items,
			// TODO move later
			data: this.$attrs.modelValue,
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

	methods: {
		search() {
			if (this.searchValue.length) {
				this.options = this.$attrs.items;
			}

			this.options = this.options.filter(
				(item) => item.value.toLowerCase().includes(this.searchValue.toLowerCase()),
			);
		},

		selectAll() {
			this.data = this.selectedAllOptions ? [] : this.options;
			this.$emit("update:modelValue", this.data);
		},
	},

};
</script>
