<template>
	<b-tooltip :label="$t(commodity)" :active="commodity !== undefined">
		<svg-icon :items="[commodity]" />
	</b-tooltip>
</template>

<script>
import SvgIcon from "@/components/SvgIcon";

export default {
	name: "CommodityColumn",

	components: { SvgIcon },

	props: {
		commodity: String,
	},
};
</script>
