<template>
	<span>
		<svg
			v-for="icon in selectedIcons"
			:key="icon.key"
			width="30"
			height="30"
			v-html="icon.svg"
		/>
	</span>
</template>

<script>
import IconService from "@/services/IconService";
import { Notification } from "@/utils/UI";

export default {
	name: "SvgIcon",

	props: {
		items: Array,
	},

	computed: {
		selectedIcons() {
			return this.icons
				.filter((icon) => this.items.find((item) => item === icon.key));
		},
	},

	data() {
		return {
			icons: [],
		};
	},

	mounted() {
		this.fetchIcons();
	},

	methods: {
		async fetchIcons() {
			await IconService.getIcons()
				.then(({ data }) => {
					this.icons = data;
				}).catch((e) => {
					Notification(`Icons ${e}`, "is-danger");
				});
		},
	},
};
</script>
