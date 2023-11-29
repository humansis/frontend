<template>
	<template v-if="(!column.type || (column.type === 'text'))">
		{{ cellData }}
	</template>

	<template v-if="column.type === 'assistancesType'">
		{{ normalizeText($t(cellData)) }}
	</template>

	<template v-if="column.type === 'textOrNone'">
		{{ cellData || this.$t("None") }}
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
	},
	methods: {
		normalizeText,

		getParams() {
			return this.cellData.routeParams || {};
		},

		getRouteName() {
			return "Home";
		},

		getLinkName() {
			return this.cellData.name || "";
		},

		isAssistanceRemote(data) {
			return !!data.remoteDistributionAllowed;
		},
	},
};
</script>
