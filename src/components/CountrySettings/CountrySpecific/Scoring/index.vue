<template>
	<Modal
		v-model="scoringModal.isOpened"
		header="Add new scoring"
	>
		<ScoringForm
			:form-model="scoringModel"
			close-button
			@formSubmitted="onSubmitScoringForm"
			@formClosed="onCloseScoringModal"
		/>
	</Modal>

	<div class="d-flex justify-end">
		<v-btn
			:disabled="!isUserPermissionGranted(PERMISSIONS.COUNTRY_SETTINGS_SCORING)"
			class="text-none ml-0 mb-3"
			color="primary"
			prepend-icon="plus"
			@click="onAddNewScoringOption"
		>
			{{ $t('New') }}
		</v-btn>
	</div>

	<ScoringList
		ref="scoringList"
		@delete="onRemoveScoring"
		@statusChange="onStatusChange"
	/>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import ScoringForm from "@/components/CountrySettings/CountrySpecific/Scoring/ScoringForm";
import ScoringList from "@/components/CountrySettings/CountrySpecific/Scoring/ScoringList";
import Modal from "@/components/Inputs/Modal";
import permissions from "@/mixins/permissions";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { COUNTRY_SETTINGS } from "@/consts";

export default {
	name: "Scoring",

	components: {
		ScoringForm,
		ScoringList,
		Modal,
	},

	mixins: [permissions],

	data() {
		return {
			scoringModal: {
				isOpened: false,
			},
			scoringModel: COUNTRY_SETTINGS.SCORING.SCORING_MODEL,
		};
	},

	methods: {
		onCloseScoringModal() {
			this.scoringModal.isOpened = false;
		},

		onAddNewScoringOption() {
			this.scoringModal.isOpened = true;

			this.scoringModel = { ...COUNTRY_SETTINGS.SCORING.SCORING_MODEL };
		},

		onSubmitScoringForm(scoringForm) {
			const {
				name,
				note,
				dropFile,
			} = scoringForm;

			this.createScoring({
				name,
				note,
				dropFile,
			});
		},

		async createScoring(scoringBody) {
			try {
				const { status, message } = await AssistancesService.createScoring(scoringBody);

				checkResponseStatus(status, message, 201);

				Notification(this.$t("Scoring Successfully Created"), "success");
				await this.$refs.scoringList.fetchData();
				this.onCloseScoringModal();
			} catch (e) {
				Notification(`${this.$t("Scoring")}: ${e.message || e}`, "error");
			}
		},

		async onRemoveScoring(id) {
			try {
				const { status, message } = await AssistancesService.removeScoring(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Scoring Successfully Removed"), "success");
				await this.$refs.scoringList.fetchData();
			} catch (e) {
				Notification(`${this.$t("Scoring")}: ${e.message || e}`, "error");
			}
		},

		async onStatusChange({ id, enabled }) {
			try {
				const { status, message } = await AssistancesService.updateScoring(
					{
						id,
						enabled,
					},
				);

				checkResponseStatus(status, message);

				Notification(this.$t("Scoring Successfully Updated"), "success");
				await this.$refs.scoringList.fetchData();
			} catch (e) {
				Notification(`${this.$t("Scoring")}: ${e.message || e}`, "error");
			}
		},
	},
};
</script>
