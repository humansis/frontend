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
import { mapActions, mapState } from "vuex";
import IconService from "@/services/IconService";
import { Notification } from "@/utils/UI";

export default {
	name: "SvgIcon",

	props: {
		items: Array,
	},

	computed: {
		...mapState(["icons"]),

		selectedIcons() {
			return this.fetchedIcons
				.filter((icon) => this.items.find((item) => item === icon.key));
		},
	},

	data() {
		return {
			fetchedIcons: [],
		};
	},

	mounted() {
		if (this.icons) {
			this.fetchedIcons = this.icons;
		} else {
			this.fetchIcons();
		}
	},

	methods: {
		...mapActions(["loadIconsToState"]),

		async fetchIcons() {
			await IconService.getIcons()
				.then(({ data }) => {
					this.loadIconsToState(data);
				}).catch((e) => {
					Notification(`${this.$t("Icons")} ${e}`, "is-danger");
				});
		},
	},
};
</script>
