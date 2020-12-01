<template>
	<b-tabs size="is-medium">
		<b-tab-item
			label="Import From File"
			icon="file-import"
		>
			<ImportFromFile />
		</b-tab-item>
	</b-tabs>
</template>

<script>
import ImportFromFile from "@/components/Beneficiaries/Household/ImportFromFile";

export default {
	name: "ImportHousehold",

	components: { ImportFromFile },
};
</script>
