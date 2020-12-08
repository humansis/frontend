<template>
	<b-tabs size="is-medium">
		<b-tab-item
			label="Imports"
			icon="file-upload"
		>
			<Imports />
		</b-tab-item>
		<b-tab-item
			label="Vouchers"
			icon="ticket-alt"
		>
			<Vouchers />
		</b-tab-item>
	</b-tabs>
</template>

<script>
import Imports from "@/views/Jobs/Imports";
import Vouchers from "@/views/Jobs/Vouchers";

export default {
	name: "Jobs",

	components: {
		Vouchers,
		Imports,
	},
};
</script>
