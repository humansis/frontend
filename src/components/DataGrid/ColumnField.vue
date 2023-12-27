<template>
	<template v-if="(!column.type || (column.type === 'text'))">
		<div v-html-secure="cellData" />
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

	<template v-if="column.type === 'tag'">
		<v-chip
			variant="flat"
			:color="getTagColor"
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
				:color="getTagTypeByItem(item)"
				variant="flat"
				size="small"
			>
				{{ normalizeText($t(cellData[index])) }}
			</v-chip>
		</div>
	</template>

	<template v-if="column.type === 'link'">
		<v-tooltip v-if="cellData.isArchived" :text="$t(cellData.tooltip)">
			<p>{{ cellData.name }}</p>
		</v-tooltip>

		<p v-else-if="!cellData.routeName">{{ cellData }}</p>

		<router-link
			v-else
			class="table-link"
			:to="{
				name: getRouteName(),
				params: getParams(),
			}"
		>
			{{ getLinkName() }}
		</router-link>
	</template>

	<template v-if="column.type === 'date'">
		{{ formattedDate }}
	</template>

	<template v-if="column.type === 'svgIcon'">
		<span v-if="cellData.length">
			<SvgIcon
				:items="cellData"
			/>
		</span>

		<p v-else>
			<span>
				{{ $t('None') }}
			</span>
		</p>
	</template>
</template>

<script>
import SvgIcon from "@/components/SvgIcon";
import { normalizeText } from "@/utils/datagrid";

export default {
	components: {
		SvgIcon,
	},

	props: {
		column: {
			type: Object,
			required: true,
		},

		cellData: {},
	},

	computed: {
		getTagColor() {
			const tag = this.column.customTags
				.find(({ code }) => code === this.cellData);
			return tag?.type || "primary";
		},

		formattedDate() {
			return this.cellData && (typeof this.cellData !== "object" || this.cellData instanceof Date)
				? this.cellData
				: this.$t("N/A");
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

		getTagTypeByItem(item) {
			return this.column.customTags.find(({ code }) => code === item)?.type;
		},

		isAssistanceRemote(data) {
			return !!data.remoteDistributionAllowed;
		},
	},
};
</script>
