<template>
	<b-tooltip :label="type" :active="type !== undefined">
		<b-icon :icon="icon" />
	</b-tooltip>
</template>

<script>
export default {
	// TODO edit after real data
	name: "CommodityColumn",

	props: {
		type: String,
	},

	computed: {
		icon() {
			switch (this.type) {
				case "cash": return "money-bill";
				case "mobileMoney": return "mobile";
				case "smartcard": return "credit-card";
				case "inKind": return "seeding";
				case "vouchers": return "ticket-alt";
				case "other": return "ellipsis-h";
				default: return "bug";
			}
		},
	},
};
</script>
