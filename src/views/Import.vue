<template>
	<div>
		<h1 class="title has-text-centered">{{ $t('Import') }}</h1>

		<b-steps
			v-model="activeStep"
			animated
			rounded
			:has-navigation="false"
		>
			<b-step-item clickable step="1" :label="$t('Integrity')">
				<IntegrityStep />
			</b-step-item>

			<b-step-item clickable step="2" :label="$t('Duplicity')">
				<DuplicityStep />
			</b-step-item>

			<b-step-item clickable step="3" :label="$t('Finalisation')">
				<FinalisationStep />
			</b-step-item>
		</b-steps>
	</div>
</template>

<script>
import IntegrityStep from "@/components/Imports/IntegrityStep";
import DuplicityStep from "@/components/Imports/DuplicityStep";
import FinalisationStep from "@/components/Imports/FinalisationStep";

export default {
	name: "Import",

	components: {
		IntegrityStep,
		DuplicityStep,
		FinalisationStep,
	},

	data() {
		return {
			activeStep: 0,
		};
	},

	methods: {},
};
</script>
