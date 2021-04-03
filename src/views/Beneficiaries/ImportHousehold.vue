<template>
	<b-tabs size="is-medium">
		<b-tab-item icon="file-import" :label="$t('Import from File')">
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
