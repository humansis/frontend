<template>
	<span>
		<b-tooltip
			v-for="(icon, key) in filteredIcons"
			:key="key"
			:label="$t(icon.value)" :active="icon !== undefined"
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

		filteredIcons() {
			const icons = this.items.map(({ code, value }) => ({
				code,
				value,
				svg: this.icons.find((icon) => icon.key === code)?.svg,
			}));

			return (this.items?.length && this.icons?.length) ? icons : [];
		},
	},
};
</script>
