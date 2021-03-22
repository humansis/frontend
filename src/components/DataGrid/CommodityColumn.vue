<template>
	<b-tooltip :label="commodity" :active="commodity !== undefined">
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
