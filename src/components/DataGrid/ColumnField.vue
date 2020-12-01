<template>
	<div>
		<template
			v-if="!column.type || (column.type === 'text')"
		>
			{{ data.row[column.field] }}
		</template>

		<template
			v-if="column.type === 'count'"
		>
			{{ data.row[column.field].length }}
		</template>

		<ImageColumn
			v-if="column.type === 'image'"
			:image="data.row[column.field]"
		/>

		<template
			v-if="column.type === 'font'"
		>
			<p :style="fontFamily">{{ data.row[column.field] }}</p>
		</template>

		<template
			v-if="column.type === 'color'"
		>
			<VSwatches
				v-model="data.row[column.field]"
				row-lenght="6"
				popover-x="right"
				popover-y="top"
				swatches="text-advanced"
				disabled
			/>
		</template>

		<template
			v-if="column.type === 'checkbox'"
		>
			<b-checkbox
				v-model="data.row[column.field]"
				disabled
			/>
		</template>

		<template
			v-if="column.type === 'flag'"
		>
			<CountryFlag
				:country="data.row[column.field]"
				size="normal"
				disabled
			/>
		</template>

		<template
			v-if="column.type === 'editable'"
		>
			<b-input
				v-model="data.row[column.field]"
			/>
		</template>
	</div>
</template>

<script>
import ImageColumn from "@/components/DataGrid/ImageColumn";

export default {
	name: "TableColumn",

	components: { ImageColumn },

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
