<template>
	<span>
		<v-tooltip
			v-for="(icon, key) in filteredIcons"
			:key="key"
			:text="$t(icon.value || '')"
			location="top"
			color="red"
			content-class="tooltip-top"
		>
			<template v-slot:activator="{ props }">
				<svg
					v-bind="props"
					width="30"
					height="30"
					v-html="icon.svg"
				/>
			</template>
		</v-tooltip>
	</span>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "SvgIcon",

	props: {
		items: {
			type: Array,
			required: true,
		},
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
