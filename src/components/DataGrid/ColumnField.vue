<template>
	<template v-if="(!column.type || (column.type === 'text'))">
		<div v-html-secure="cellData" :data-cy="identifierBuilder()" />
	</template>

	<template v-if="column.type === 'object'">
		<p v-if="cellData.value" :data-cy="identifierBuilder()">
			{{ cellData.value }}
		</p>

		<pre v-else :data-cy="identifierBuilder()">{{ cellData }}</pre>
	</template>

	<template v-if="column.type === 'assistancesType'">
		<p :data-cy="identifierBuilder()">
			{{ normalizeText($t(cellData)) }}
		</p>
	</template>

	<template v-if="column.type === 'textOrNone'">
		<p :data-cy="identifierBuilder()">
			{{ cellData || this.$t("None") }}
		</p>
	</template>

	<template v-if="column.type === 'customValue'">
		<p :data-cy="identifierBuilder()">
			{{ customValue }}
		</p>
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
		<SvgIcon
			v-if="cellData.primary === 'icon' && cellData.icon"
			:items="cellData.icon"
			:data-cy="prepareComponentIdentifier()"
		/>

		<v-img
			v-else
			:src="cellData.image"
			:data-cy="identifierBuilder()"
			alt="item-image"
		/>
	</template>

	<template v-if="column.type === 'image' && typeof cellData === 'string'">
		<v-img
			:src="cellData"
			:data-cy="identifierBuilder()"
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

	<p
		v-if="column.type === 'font'"
		:style="fontFamily"
		:data-cy="identifierBuilder()"
	>
		{{ cellData }}
	</p>

	<template v-if="column.type === 'tag'">
		<v-chip
			:color="getTagColor(cellData)"
			:class="getTagClass(cellData)"
			:data-cy="identifierBuilder()"
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
				:data-cy="identifierBuilder()"
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
				<p
					v-bind="props"
					:data-cy="identifierBuilder()"
				>
					{{ cellData.name }}
				</p>
			</template>
		</v-tooltip>

		<p
			v-else-if="!cellData?.routeName"
			:data-cy="identifierBuilder()"
		>
			{{ cellData }}
		</p>

		<router-link
			v-else
			:to="{
				name: getRouteName(),
				params: getParams(),
			}"
			:data-cy="identifierBuilder()"
			class="table-link"
		>
			{{ getLinkName() }}
		</router-link>
	</template>

	<template v-if="column.type === 'date'">
		<p :data-cy="identifierBuilder()">
			{{ formattedDate }}
		</p>
	</template>

	<template v-if="column.type === 'datetime'">
		<p :data-cy="identifierBuilder()">
			{{ formattedDateTime }}
		</p>
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
				:data-cy="identifierBuilder()"
			/>
		</template>
	</v-tooltip>

	<template v-if="column.type === 'svgIcon'">
		<span v-if="cellData?.length">
			<SvgIcon
				:items="cellData"
				:data-cy="prepareComponentIdentifier()"
			/>

			<span
				v-if="isAssistanceRemote(cellData)"
				:data-cy="identifierBuilder()"
				class="remote-distribution-flag"
			>
				R
			</span>
		</span>

		<p v-else-if="cellData !== null">
			<span :data-cy="identifierBuilder()">
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
				:data-cy="identifierBuilder()"
				class="text-red"
			>
				{{ $t('Beneficiary ID and official ID matches two different Beneficiaries in database and this must be corrected, before data can be imported') }}
			</p>

			<v-chip
				v-if="item === 'hasNoDuplicityDifferences'"
				:data-cy="identifierBuilder()"
				type="grey-lighten-2"
			>
				{{ $t('No Difference') }}
			</v-chip>

			<span
				v-else-if="isRecordValidToShow(item)"
				v-html-secure="item"
				:class="{ 'font-weight-bold': column.boldText }"
				:data-cy="identifierBuilder()"
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
			<span v-if="!isMembersLastRecord(item)" :data-cy="identifierBuilder()">
				{{ item }}
			</span>
		</div>
	</template>
</template>

<script>
import ColorPicker from "@/components/Inputs/ColorPicker";
import SvgIcon from "@/components/SvgIcon";
import identifierBuilder from "@/mixins/identifierBuilder";
import { normalizeText } from "@/utils/datagrid";

export default {
	name: "ColumnField",

	components: {
		SvgIcon,
		ColorPicker,
	},

	mixins: [identifierBuilder],

	props: {
		column: {
			type: Object,
			required: true,
		},

		cellData: {
			required: true,
		},

		columnKey: {
			type: String,
			required: true,
		},

		dataIndex: {
			type: Number,
			required: true,
		},

		tableIdentifier: {
			type: String,
			default: "",
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

		dataCy() {
			return this.tableIdentifier.length
				? `${this.tableIdentifier}-column-${this.columnKey}-row-${this.dataIndex + 1}`
				: `column-${this.columnKey}-row-${this.dataIndex + 1}`;
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
