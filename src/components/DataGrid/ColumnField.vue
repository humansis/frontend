<template>
	<div>
		<!-- Simple Text -->
		<template v-if="!column.type || (column.type === 'text')">
			{{ data.row[column.field] }}
		</template>

		<!-- Count array items -->
		<template v-if="column.type === 'count'">
			<p v-if="data.row[column.field].length">
				{{ data.row[column.field].length }}
			</p>
			<p v-else>
				None
			</p>
		</template>

		<!-- Show image or logo -->
		<ImageColumn v-if="column.type === 'image'" :image="data.row[column.field]" />

		<!-- Text with different font -->
		<p v-if="column.type === 'font'" :style="fontFamily">
			{{ data.row[column.field] }}
		</p>

		<!-- Color -->
		<VSwatches
			v-if="column.type === 'color'"
			v-model="data.row[column.field]"
			row-lenght="6"
			popover-x="right"
			popover-y="top"
			swatches="text-advanced"
			disabled
		/>

		<!-- For Boolean values -->
		<template v-if="column.type === 'checkbox'">
			<b-checkbox v-model="data.row[column.field]" disabled />
		</template>

		<!-- Show Country Flag -->
		<CountryFlag
			v-if="column.type === 'flag'"
			:country="data.row[column.field]"
			size="normal"
			disabled
		/>

		<!-- Editable column -->
		<b-input v-if="column.type === 'editable'" v-model="data.row[column.field]" />

		<!-- Column for commodity  -->
		<CommodityColumn v-if="column.type === 'commodity'" :type="data.row[column.field]" />
	</div>
</template>

<script>
import ImageColumn from "@/components/DataGrid/ImageColumn";
import CommodityColumn from "@/components/DataGrid/CommodityColumn";

export default {
	name: "TableColumn",

	components: {
		CommodityColumn,
		ImageColumn,
	},

	computed: {
		fontFamily() {
			return `font-family: ${this.data.row[this.column.field]}, sans-serif`;
		},
	},

	props: {
		column: Object,
		data: Object,
	},
};
</script>
