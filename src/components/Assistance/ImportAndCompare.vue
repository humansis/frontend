<template>
	<div class="d-fex justify-center text-center">
		<strong class="text-body-2 font-weight-bold">
			{{ $t(`
				Import the file that contains the modified assistance.
				The database will be updated with the new list of beneficiaries for this
				assistance when you will click on "update" after importing.
				`) }}
		</strong>

		<FileUpload
			prepend-icon=""
			hide-details="auto"
			variant="outlined"
			density="compact"
			class="mt-5"
		/>
	</div>
</template>

<script>
import FileUpload from "@/components/Inputs/FileUpload";

export default {
	name: "ImportAndCompare",

	components: {
		FileUpload,
	},
};
</script>
