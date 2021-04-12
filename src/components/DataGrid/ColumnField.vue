<template>
	<div>
		<!-- Simple Text -->
		<template v-if="!column.type || (column.type === 'text')">
			{{ data.row[column.field] }}
		</template>

		<!-- Simple Text -->
		<template v-if="column.type === 'textOrNone'">
			{{ data.row[column.field] || "none" }}
		</template>

		<!-- Count array items -->
		<template v-if="column.type === 'count'">
			<p v-if="data.row[column.field].length">
				{{ data.row[column.field].length }}
			</p>
			<p v-else>
				{{ $t('none') }}
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

		<!-- Show Object Value -->
		<template v-if="column.type === 'object'">
			<p v-if="data.row[column.field].value">
				{{ data.row[column.field].value }}
			</p>
			<p v-else>
				{{ data.row[column.field] }}
			</p>
		</template>

		<!-- Show Date -->
		<template v-if="column.type === 'date'">
			{{ formattedDate }}
		</template>

		<!-- Show Custom Field for Selection Criteria Group -->
		<template v-if="column.type === 'customValue'">
			{{ customValue }}
		</template>

		<!-- Editable column -->
		<b-input v-if="column.type === 'editable'" v-model="data.row[column.field]" />

		<!-- Column for commodity  -->
		<CommodityColumn v-if="column.type === 'commodity'" :commodity="data.row[column.field]" />
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

		customValue() {
			const value = this.data.row[this.column.field];

			if (!value) return "";

			if (typeof value === "object") {
				if (value.value) return value.value;

				const newDate = this.$moment(this.data.row[this.column.field])
					.format("YYYY-MM-DD hh:mm");

				if (newDate.isValid()) return newDate;
			}

			return value;
		},

		formattedDate() {
			return `${this.$moment(this.data.row[this.column.field]).format("YYYY-MM-DD hh:mm")}`;
		},
	},

	props: {
		column: Object,
		data: Object,
	},
};
</script>
