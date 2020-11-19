<template>
	<div>
		<template
			v-if="column.type === 'text'"
		>
			{{ data.row[column.field] }}
		</template>

		<template
			v-if="column.type === 'image'"
		>
			<b-image
				v-if="data.row[column.field]"
				style="height: 35px; width: 35px; padding: 1%"
				alt="Image"
				:src="data.row[column.field]"
			/>
			<p v-else>None</p>
		</template>
	</div>

</template>

<script>
export default {
	name: "Column",

	props: {
		column: Object,
		data: Object,
	},
};
</script>
