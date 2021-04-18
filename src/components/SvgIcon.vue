<template>
	<span>
		<b-tooltip
			v-for="icon in selectedIcons"
			:key="icon.key"
			:label="$t(icon.key)" :active="icon !== undefined"
		>
			<svg
				width="30"
				height="30"
				v-html="icon.svg"
			/>
		</b-tooltip>
	</span>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "SvgIcon",

	props: {
		items: Array,
	},

	computed: {
		...mapState(["icons"]),

		selectedIcons() {
			return (this.items?.length && this.icons?.length) ? this.icons
				.filter((icon) => this.items.find((item) => item === icon.key)) : [];
		},
	},
};
</script>
