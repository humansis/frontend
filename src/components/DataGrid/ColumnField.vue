<template>
	<div>
		<!-- Simple Text -->
		<template v-if="(!column.type || (column.type === 'text')) && simpleText">
			<div v-html-secure="simpleText" />
		</template>

		<template v-if="column.type === 'assistancesType'">
			{{ normalizeText($t(cellData)) }}
		</template>

		<!-- Simple Text -->
		<template v-if="column.type === 'textOrNone'">
			{{ cellData || this.$t("None") }}
		</template>

		<!-- Array Text Break -->
		<template v-if="column.type === 'arrayTextBreak'">
			<div
				v-for="(item, index) in  cellData"
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
					v-html-secure="item"
				/>
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
				:to="{
					name: getRouteName(),
					params: getParams(),
				}"
			>
				{{ getLinkName() }}
			</router-link>
		</template>

		<!-- Count array items -->
		<template v-if="column.type === 'count'">
			<p v-if="cellData.length">
				{{ cellData.length }}
			</p>
			<p v-else>
				{{ $t('None') }}
			</p>
		</template>

		<!-- Show image or logo -->
		<ImageColumn v-if="column.type === 'image' && typeof cellData === 'string'" :image="cellData" />

		<!-- Text with different font -->
		<p v-if="column.type === 'font'" :style="fontFamily">
			{{ cellData }}
		</p>

		<!-- Color -->
		<VSwatches
			v-if="column.type === 'color'"
			v-model="cellData"
			row-lenght="6"
			popover-x="right"
			popover-y="top"
			swatches="text-advanced"
			disabled
		/>

		<!-- For Boolean values -->
		<template v-if="column.type === 'checkbox'">
			<b-checkbox v-model="cellData" disabled />
		</template>

		<!-- Show Country Flag -->
		<CountryFlag
			v-if="column.type === 'flag'"
			:country="cellData"
			size="normal"
			disabled
		/>

		<!-- Show Object Value -->
		<template v-if="column.type === 'object'">
			<p v-if="cellData.value">
				{{ cellData.value }}
			</p>
			<pre v-else>{{ cellData }}</pre>
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
				v-for="(item, index) in  cellData"
				:key="`tags-array-item-${index}`"
			>
				<b-tag :type="getTagTypeByItem(item)">
					{{ $t(cellData[index]) }}
				</b-tag>
			</div>
		</template>

		<!-- Editable column -->
		<b-input v-if="column.type === 'editable'" v-model="cellData" />

		<!-- Column for icons with tooltip  -->
		<b-tooltip :label="$t(cellData.tooltip)" v-if="column.type === 'IconWithTooltip'">
			<b-icon
				:icon="cellData.type"
				:size="cellData.size || 'is-small'"
			/>
		</b-tooltip>

		<!-- Column for svg icons  -->
		<template v-if="column.type === 'svgIcon'">
			<span v-if="cellData.length">
				<SvgIcon
					:items="cellData"
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
			<SvgIcon v-if="cellData.primary === 'icon' && cellData.icon" :items="cellData.icon" />
			<ImageColumn
				v-else
				:image="cellData.image"
			/>
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
		cellData() {
			return this.data.row[this.column.field] ?? {};
		},

		simpleText() {
			return this.isCellDataString || this.isCellDataNumber ? this.cellData : "";
		},

		isCellDataNumber() {
			return typeof this.cellData === "number";
		},

		isCellDataString() {
			return typeof this.cellData === "string" && this.cellData.length;
		},

		fontFamily() {
			return this.isCellDataString
				? `font-family: ${this.cellData}, sans-serif;`
				: "";
		},

		customValue() {
			if (this.cellData.value) {
				return this.cellData.value;
			}

			if (typeof this.cellData === "object") {
				const newDate = this.$moment(this.cellData);

				if (newDate.isValid()) {
					return newDate.format("YYYY-MM-DD hh:mm");
				}
			}

			return this.cellData;
		},

		formattedDate() {
			return `${this.$moment(this.cellData).format("YYYY-MM-DD")}`;
		},

		formattedDateTime() {
			return this.cellData && typeof this.cellData !== "object"
				? `${this.$moment(this.cellData).format("YYYY-MM-DD hh:mm")}`
				: this.$t("N/A");
		},

		getTagType() {
			const tag = this.column.customTags
				.find(({ code }) => code === this.cellData);
			return tag?.type || "is-light";
		},
	},

	methods: {
		isAssistanceRemote(data) {
			return !!data.remoteDistributionAllowed;
		},

		getParams() {
			return this.cellData.routeParams || {};
		},

		getRouteName() {
			return this.cellData.routeName || "Home";
		},

		getLinkName() {
			return this.cellData.name || "";
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
