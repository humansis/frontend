<template>
	<div>
		<!-- Simple Text -->
		<template v-if="!column.type || (column.type === 'text')">
			<span v-html="data.row[column.field]" />
		</template>

		<template v-if="column.type === 'assistancesType'">
			{{ normalizeText($t(data.row[column.field])) }}
		</template>

		<!-- Simple Text -->
		<template v-if="column.type === 'textOrNone'">
			{{ data.row[column.field] || this.$t("None") }}
		</template>

		<!-- Array Text Break -->
		<template v-if="column.type === 'arrayTextBreak'">
			<div
				v-for="(item, index) in  data.row[column.field]"
				:key="`array-text-break-${index}`"
			>
				{{ item }}
			</div>
		</template>

		<!-- Array Text Break (especially for duplicates)-->
		<template v-if="column.type === 'arrayTextBreakForDuplicitiesRecords'">
			<div
				v-for="(item, index) in data.row[column.field]"
				:key="`array-text-break-${index}`"
				:class="{ 'mb-4': isMembersLastRecord(item) }"
			>
				<b-tag
					v-if="item === 'hasNoDuplicityDifferences'"
					type="is-light"
				>
					{{ $t('No Difference') }}
				</b-tag>

				<span
					v-else-if="item !== 'hasNoDuplicityDifferences' && !isMembersLastRecord(item)"
					:class="{ 'has-text-weight-bold': column.boldText }"
				>
					{{ item }}
				</span>
			</div>
		</template>

		<!-- Array Text Break (especially for duplicates)-->
		<template v-if="column.type === 'arrayTextBreakForDuplicities'">
			<div
				v-for="(item, index) in  data.row[column.field]"
				:key="`array-text-break-${index}`"
				:class="{
					'has-text-weight-bold': column.boldText,
					'mb-4': isMembersLastRecord(item),
				}"
			>
				<span v-if="!isMembersLastRecord(item)">
					{{ item }}
				</span>
			</div>
		</template>

		<!-- Link to detail -->
		<template v-if="column.type === 'link'">
			<router-link
				class="table-link"
				:to="getLink(data.row[column.field])" target="_blank"
			>
				{{ getLinkName(data.row[column.field]) }}
			</router-link>
		</template>

		<!-- Count array items -->
		<template v-if="column.type === 'count'">
			<p v-if="data.row[column.field].length">
				{{ data.row[column.field].length }}
			</p>
			<p v-else>
				{{ $t('None') }}
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

		<!-- Show DateTime -->
		<template v-if="column.type === 'datetime'">
			{{ formattedDateTime }}
		</template>

		<!-- Show Custom Field for Selection Criteria Group -->
		<template v-if="column.type === 'customValue'">
			{{ customValue }}
		</template>

		<!-- Show Custom Tag with background color -->
		<template v-if="column.type === 'tag'">
			<b-tag :type="getTagType">
				{{ normalizeText($t(data.row[column.field])) }}
			</b-tag>
		</template>

		<!-- Show Custom Tags Array with background color -->
		<template v-if="column.type === 'tagArray'">
			<div
				v-for="(item, index) in  data.row[column.field]"
				:key="`tags-array-item-${index}`"
			>
				<b-tag :type="getTagTypeByItem(item)">
					{{ $t(data.row[column.field][index]) }}
				</b-tag>
			</div>
		</template>

		<!-- Editable column -->
		<b-input v-if="column.type === 'editable'" v-model="data.row[column.field]" />

		<!-- Column for svg icons  -->
		<template v-if="column.type === 'svgIcon'">
			<span v-if="data.row[column.field] && data.row[column.field].length > 0">
				<SvgIcon
					:items="data.row[column.field]"
				/>
				<!-- Special case for assistances grid -->
				<span v-if="isAssistanceRemote(data.row)" class="remote-disribution-flag">R</span>
			</span>

			<p v-else>
				<span v-if="data.row.loading">
					{{ $t('Loading...') }}
				</span>
				<span v-else>
					{{ $t('None') }}
				</span>
			</p>
		</template>

		<!-- Column for product category image/icon  -->
		<template v-if="column.type === 'productCategoryImage'">
			<ImageColumn
				v-if="data.row[column.field] && data.row[column.field].image"
				:image="data.row[column.field].image"
			/>
			<SvgIcon v-else :items="data.row[column.field].icon" />
		</template>
	</div>
</template>

<script>
import ImageColumn from "@/components/DataGrid/ImageColumn";
import SvgIcon from "@/components/SvgIcon";
import { normalizeText } from "@/utils/datagrid";

export default {
	name: "TableColumn",

	components: {
		SvgIcon,
		ImageColumn,
	},

	computed: {
		fontFamily() {
			return `font-family: ${this.data.row[this.column.field]}, sans-serif`;
		},

		customValue() {
			const value = this.data.row[this.column.field];

			if (!value) {
				return value;
			}

			if (typeof value === "object") {
				if (value.value) return value.value;

				const newDate = this.$moment(this.data.row[this.column.field]);

				if (newDate.isValid()) return newDate.format("YYYY-MM-DD hh:mm");
			}

			return value;
		},

		formattedDate() {
			return `${this.$moment(this.data.row[this.column.field]).format("YYYY-MM-DD")}`;
		},

		formattedDateTime() {
			const date = this.data.row[this.column.field];

			return date ? `${this.$moment(date).format("YYYY-MM-DD hh:mm")}` : "";
		},

		getTagType() {
			const tag = this.column.customTags
				.find(({ code }) => code === this.data.row[this.column.field]);
			return tag?.type || "is-light";
		},
	},

	methods: {
		isAssistanceRemote(data) {
			return !!data.remoteDistributionAllowed;
		},

		getLink(field) {
			return field?.link || "";
		},

		getLinkName(field) {
			return field?.name || "";
		},

		getTagTypeByItem(item) {
			return this.column.customTags.find(({ code }) => code === item)?.type;
		},

		isMembersLastRecord(item) {
			return item === "memberDuplicitiesLastItem";
		},

		normalizeText,
	},

	props: {
		column: Object,
		data: Object,
	},
};
</script>

<style scoped>
.remote-disribution-flag {
	position: relative;
	top: -20px;
	left: -5px;
}
</style>
