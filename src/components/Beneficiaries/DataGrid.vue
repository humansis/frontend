<template>
	<div>
		<div class="columns">
			<div class="column is-two-fifths">
				<b-field>
					<b-input placeholder="Search by keyword"
						type="search"
						icon="search">
					</b-input>
				</b-field>
			</div>
			<div class="column">
				<button
					class="button"
					slot="trigger"
					@click="filtersToggle"
				>
					<span>Advanced search</span>
					<b-icon
						size="is-small"
						:icon="advancedSearchVisible ? 'arrow-up' : 'arrow-down'"
					/>
				</button>
			</div>
		</div>
		<div v-if="advancedSearchVisible" class="mb-5">
			<div class="columns is-multiline">
				<div
					v-for="(filter, key) in gridFilters"
					:key="key"
					class="column"
				>
					<b-field
						:label="normalizeText(filter.name)"
					>
						<b-select
							:placeholder="normalizeText(filter.name)"
						>

							<option
								v-for="(option, key) in filter.options"
								:value="option.value"
								:key="key"
							>
								{{ option.label }}
							</option>

						</b-select>
					</b-field>
				</div>
			</div>
		</div>

		<b-table
			:data="gridData"
			:paginated="true"
			:per-page="'15'"
			:current-page="1"
			:pagination-simple="false"
			:pagination-position="'bottom'"
			:default-sort-direction="'asc'"
			:sort-icon="'arrow-up'"
			:sort-icon-size="'is-small'"
			:striped="true"
			:hoverable="true"
			default-sort="id"
			aria-next-label="Next page"
			aria-previous-label="Previous page"
			aria-page-label="Page"
			aria-current-label="Current page"
			selectable
			checkable
		>

			<template slot-scope="props">

				<template v-for="(entry, keymain) in props.row">

					<b-table-column
						:key="keymain"
						:field="keymain"
						:label="normalizeText(keymain)"
						sortable
					>
						<template>{{ entry }}</template>
					</b-table-column>

				</template>

				<b-table-column
					label="Actions"
				>
					<div class="block">
						<b-icon
							icon="edit"
							type="is-link"
							size="is-medium"
						>
						</b-icon>
						<b-icon
							icon="search"
							type="is-info"
							size="is-medium"
						>
						</b-icon>
						<b-icon
							icon="trash"
							type="is-danger"
							size="is-medium"
						>
						</b-icon>
					</div>
				</b-table-column>

			</template>
		</b-table>
	</div>
</template>

<script>
import { normalizeText } from "@/utils/normalizeText";

export default {
	name: "DataGrid",

	props: {
		gridData: Array,
		gridFilters: Array,
	},

	data() {
		return {
			advancedSearchVisible: false,
		};
	},

	methods: {
		normalizeText(text) {
			return normalizeText(text);
		},

		filtersToggle() {
			this.advancedSearchVisible = !this.advancedSearchVisible;
		},
	},
};
</script>
