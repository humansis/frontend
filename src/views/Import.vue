<template>
	<div>
		<h1 class="title has-text-centered mb-6">{{ $t('Import') }} import123367_2021</h1>
		<h2 class="subtitle is-5 has-text-centered has-text-weight-bold mb-6">
			Quanti Project
		</h2>

		<b-steps
			v-model="activeStep"
			animated
			rounded
			:has-navigation="false"
		>
			<b-step-item clickable step="1" :label="$t('Start')">
				<StartStep @canceledImport="onCancelImport" />
			</b-step-item>

			<b-step-item clickable step="2" :label="$t('Integrity Check')">
				<IntegrityStep />
			</b-step-item>

			<b-step-item clickable step="3" :label="$t('Duplicity Check')">
				<DuplicityStep />
			</b-step-item>

			<b-step-item clickable step="4" :label="$t('Finalisation')">
				<FinalisationStep />
			</b-step-item>
		</b-steps>
	</div>
</template>

<script>
import StartStep from "@/components/Imports/StartStep";
import IntegrityStep from "@/components/Imports/IntegrityStep";
import DuplicityStep from "@/components/Imports/DuplicityStep";
import FinalisationStep from "@/components/Imports/FinalisationStep";
import { Toast } from "@/utils/UI";

export default {
	name: "Import",

	components: {
		StartStep,
		IntegrityStep,
		DuplicityStep,
		FinalisationStep,
	},

	data() {
		return {
			activeStep: 0,
		};
	},

	methods: {
		onCancelImport() {
			this.$buefy.dialog.confirm({
				title: this.$t("Cancel Import"),
				message: this.$t("Are you sure you want to cancel this import?"),
				confirmText: this.$t("Confirm"),
				type: "is-danger",
				hasIcon: true,
				onConfirm: () => {
					this.cancelImport();
				},
			});
		},

		cancelImport() {
			Toast("Import Canceled", "is-success");
		},
	},
};
</script>
