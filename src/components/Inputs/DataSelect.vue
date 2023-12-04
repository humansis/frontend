<template>
	<v-select
		v-bind="$attrs"
		:value="data"
		:items="options"
	>
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
						@input="searchFruits"
					/>
				</v-list-item>

				<v-list-item
					v-if="$attrs.multiple"
					:title="$t('Select All')"
					@click="toggle"
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
	inheritAttrs: false,

	props: {
		label: {
			type: String,
			default: "",
		},

		isSearchEnabled: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			data: [],
			options: [],
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

	created() {
		this.options = this.$attrs.items;
		this.data = this.$attrs.modelValue;
	},

	methods: {
		searchFruits() {
			if (this.searchValue.length) {
				this.options = this.$attrs.items;
			}

			this.options = this.options.filter(
				(item) => item.value.toLowerCase().includes(this.searchValue.toLowerCase()),
			);
		},

		toggle() {
			if (this.selectedAllOptions) {
				this.data = [];
			} else {
				this.data = this.options.slice();
			}
			this.$emit("update:modelValue", this.data);
		},
	},

};
</script>
