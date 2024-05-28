<template>
	<div class="d-flex align-center font-weight-bold flex-column ma-6">
		<p class="mb-5">
			{{ $t("Assistance name") }}
		</p>

		<p class="text-h6 mb-5">
			{{ $t("Assistance is being created") }}:

			<strong>{{ progress }} %</strong>
		</p>

		<v-progress-linear
			:model-value="progress"
			color="green"
			height="20"
			rounded
		>
			<template v-slot:default>
				<strong>{{ progress }}%</strong>
			</template>
		</v-progress-linear>

		<p class="mt-10">
			{{ $t("You can leave this screen and return later.") }}
		</p>
	</div>
</template>

<script>
export default {
	name: "AssistanceCreationProgress",

	props: {
		progress: {
			type: Number,
			required: true,
		},
	},
};
</script>
