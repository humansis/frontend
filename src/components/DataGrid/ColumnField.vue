<template>
	<div>
		<template
			v-if="!column.type || (column.type === 'text')"
		>
			{{ data.row[column.field] }}
		</template>

		<ImageColumn
			v-if="column.type === 'image'"
			:image="data.row[column.field]"
		/>
	</div>

</template>

<script>
import ImageColumn from "@/components/DataGrid/ImageColumn";

export default {
	name: "TableColumn",

	components: { ImageColumn },

	props: {
		column: Object,
		data: Object,
	},
};
</script>
