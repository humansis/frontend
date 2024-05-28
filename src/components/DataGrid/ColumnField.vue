<template>
	<template v-if="(!column.type || (column.type === 'text'))">
		<div v-html-secure="cellData" />
	</template>

	<template v-if="column.type === 'object'">
		<p v-if="cellData.value">
			{{ cellData.value }}
		</p>

		<pre v-else>{{ cellData }}</pre>
	</template>

	<template v-if="column.type === 'assistancesType'">
		{{ normalizeText($t(cellData)) }}
	</template>

	<template v-if="column.type === 'textOrNone'">
		{{ cellData || this.$t("None") }}
	</template>

	<template v-if="column.type === 'customValue'">
		{{ customValue }}
	</template>

	<template v-if="column.type === 'arrayTextBreak'">
		<div
			v-for="(item, index) in cellData"
			:key="`array-text-break-${index}`"
		>
			{{ item }}
		</div>
	</template>

	<template v-if="column.type === 'productCategoryImage'">
		<SvgIcon v-if="cellData.primary === 'icon' && cellData.icon" :items="cellData.icon" />

		<v-img
			v-else
			:src="cellData.image"
			alt="item-image"
		/>
	</template>

	<template v-if="column.type === 'image' && typeof cellData === 'string'">
		<v-img
			:src="cellData"
			height="35"
			width="35"
			alt="item-image"
		/>
	</template>

	<ColorPicker
		v-if="column.type === 'color'"
		:value="cellData"
		disabled
	/>

	<p v-if="column.type === 'font'" :style="fontFamily">
		{{ cellData }}
	</p>

	<template v-if="column.type === 'tag'">
		<v-chip
			:color="getTagColor(cellData)"
			:class="getTagClass(cellData)"
			variant="flat"
			size="small"
		>
			{{ normalizeText($t(cellData)) }}
		</v-chip>
	</template>

	<template v-if="column.type === 'tagArray'">
		<div
			v-for="(item, index) in cellData"
			:key="`tags-array-item-${index}`"
		>
			<v-chip
				:color="getTagColor(item)"
				:class="getTagClass(item)"
				variant="flat"
				size="small"
			>
				{{ normalizeText($t(cellData[index])) }}
			</v-chip>
		</div>
	</template>

	<template v-if="column.type === 'link'">
		<v-tooltip
			v-if="cellData?.isArchived"
			:text="$t(cellData.tooltip)"
			location="top"
			content-class="tooltip-top"
		>
			<template v-slot:activator="{ props }">
				<p v-bind="props">{{ cellData.name }}</p>
			</template>
		</v-tooltip>

		<p v-else-if="!cellData?.routeName">{{ cellData }}</p>

		<router-link
			v-else
			:to="{
				name: getRouteName(),
				params: getParams(),
			}"
			class="table-link"
		>
			{{ getLinkName() }}
		</router-link>
	</template>

	<template v-if="column.type === 'date'">
		{{ formattedDate }}
	</template>

	<template v-if="column.type === 'datetime'">
		{{ formattedDateTime }}
	</template>

	<v-tooltip
		v-if="column.type === 'IconWithTooltip'"
		:text="$t(cellData.tooltip)"
		location="top"
		content-class="tooltip-top"
	>
		<template v-slot:activator="{ props }">
			<v-icon
				v-bind="props"
				:icon="cellData.type"
				:size="cellData.size || 'is-small'"
			/>
		</template>
	</v-tooltip>

	<template v-if="column.type === 'svgIcon'">
		<span v-if="cellData?.length">
			<SvgIcon
				:items="cellData"
			/>

			<span v-if="isAssistanceRemote(cellData)" class="remote-distribution-flag">R</span>
		</span>

		<p v-else-if="cellData !== null">
			<span>
				{{ $t('None') }}
			</span>
		</p>
	</template>

	<template v-if="column.type === 'arrayTextBreakForDuplicitiesRecords'">
		<div
			v-for="(item, index) in cellData"
			:key="`array-text-break-${index}`"
			:class="{ 'mb-4': isMembersLastRecord(item) }"
		>
			<p
				v-if="item === 'hasBeneficiaryIdDuplicity'"
				class="text-red"
			>
				{{ $t('Beneficiary ID and official ID matches two different Beneficiaries in database and this must be corrected, before data can be imported') }}
			</p>

			<v-chip
				v-if="item === 'hasNoDuplicityDifferences'"
				type="grey-lighten-2"
			>
				{{ $t('No Difference') }}
			</v-chip>

			<span
				v-else-if="isRecordValidToShow(item)"
				:class="{ 'font-weight-bold': column.boldText }"
				v-html-secure="item"
			/>
		</div>
	</template>

	<template v-if="column.type === 'arrayTextBreakForDuplicities'">
		<div
			v-for="(item, index) in cellData"
			:key="`array-text-break-${index}`"
			:class="{
				'font-weight-bold': column.boldText,
				'mb-4': isMembersLastRecord(item),
			}"
		>
			<span v-if="!isMembersLastRecord(item)">
				{{ item }}
			</span>
		</div>
	</template>
</template>

<script>
import ColorPicker from "@/components/Inputs/ColorPicker";
import SvgIcon from "@/components/SvgIcon";
import { normalizeText } from "@/utils/datagrid";

export default {
	name: "ColumnField",

	components: {
		SvgIcon,
		ColorPicker,
	},

	props: {
		column: {
			type: Object,
			required: true,
		},

		cellData: {
			required: true,
		},
	},

	computed: {
		formattedDate() {
			return this.cellData && (typeof this.cellData !== "object" || this.cellData instanceof Date)
				? `${this.$moment.utc(this.cellData).format("YYYY-MM-DD")}`
				: this.$t("N/A");
		},

		formattedDateTime() {
			return this.cellData && typeof this.cellData !== "object"
				? `${this.$moment.utc(this.cellData).format("YYYY-MM-DD HH:mm")}`
				: this.$t("N/A");
		},

		customValue() {
			if (this.cellData.value) {
				return this.cellData.value;
			}

			if (typeof this.cellData === "object") {
				const newDate = this.$moment.utc(this.cellData);

				if (newDate.isValid()) {
					return newDate.format("YYYY-MM-DD HH:mm");
				}
			}

			return this.cellData;
		},

		fontFamily() {
			return `font-family: ${this.cellData}, sans-serif;`;
		},
	},

	methods: {
		normalizeText,

		getParams() {
			return this.cellData.routeParams || {};
		},

		getRouteName() {
			return this.cellData.routeName || "Home";
		},

		getLinkName() {
			return this.cellData.name || "";
		},

		getTagColor(item) {
			return this.column.customTags.find(({ code }) => code === item)?.type;
		},

		getTagClass(item) {
			return this.column.customTags.find(({ code }) => code === item)?.class;
		},

		isAssistanceRemote(data) {
			return !!data[0].remoteDistributionAllowed;
		},

		isMembersLastRecord(item) {
			return item === "memberDuplicitiesLastItem";
		},

		isRecordValidToShow(item) {
			const exceptions = ["hasNoDuplicityDifferences", "hasBeneficiaryIdDuplicity"];

			return !exceptions.includes(item) && !this.isMembersLastRecord(item);
		},
	},
};
</script>
