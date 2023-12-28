<template>
	<Modal
		v-model="scoringModal.isOpened"
		header="Add new scoring"
	>
		<ScoringForm
			close-button
			class="modal-card"
			:formModel="scoringModel"
			@formSubmitted="submitScoringForm"
			@formClosed="closeScoringModal"
		/>
	</Modal>

	<div class="d-flex justify-end">
		<v-btn
			v-if="userCan.createScoring"
			class="text-none ml-0 mb-3"
			color="primary"
			size="small"
			prepend-icon="plus"
			@click="addNewScoringOption"
		>
			{{ $t('New') }}
		</v-btn>
	</div>

	<ScoringList
		ref="scoringList"
		@onDelete="removeScoring"
		@download="downloadScoring"
		@statusChange="statusChange"
	/>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import ScoringForm from "@/components/CountrySettings/CountrySpecific/Scoring/ScoringForm";
import ScoringList from "@/components/CountrySettings/CountrySpecific/Scoring/ScoringList";
import Modal from "@/components/Inputs/Modal";
import permissions from "@/mixins/permissions";
import { Notification } from "@/utils/UI";

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
			scoringModel: {
				name: "",
				note: "",
				dropFiles: [],
				content: "",
			},
		};
	},

	methods: {
		closeScoringModal() {
			this.scoringModal.isOpened = false;
		},

		addNewScoringOption() {
			this.scoringModal.isOpened = true;

			this.scoringModel = {
				...this.scoringModel,
				name: "",
				note: "",
				dropFiles: [],
				content: "",
			};
		},

		submitScoringForm(scoringForm) {
			const {
				name,
				note,
				dropFiles,
			} = scoringForm;

			this.createScoring({
				name,
				note,
				dropFiles,
			});
		},

		async createScoring(scoringBody) {
			await AssistancesService.createScoring(scoringBody)
				.then((response) => {
					if (response.status === 201) {
						Notification(this.$t("Scoring Successfully Created"), "success");
						this.$refs.scoringList.fetchData();
						this.closeScoringModal();
					} else if (response.message) {
						Notification(response.message, "error");
					}
				}).catch((e) => {
					Notification(`${this.$t("Scoring")} ${e.message || e}`, "error");
				});
		},

		async removeScoring(id) {
			await AssistancesService.removeScoring(id)
				.then((response) => {
					if (response.status === 204) {
						Notification(this.$t("Scoring Successfully Removed"), "success");
						this.$refs.scoringList.fetchData();
					} else if (response.message) {
						Notification(response.message, "is-danger");
					}
				}).catch((e) => {
					Notification(`${this.$t("Scoring")} ${e.message || e}`, "error");
				});
		},

		async downloadScoring(scoring) {
			await AssistancesService.downloadScoring(scoring.id)
				.then(({ data, status, message }) => {
					if (status === 200) {
						const blob = new Blob([data], { type: data.type });
						const link = document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = `${scoring.name}-ID-${scoring.id}`;
						link.click();
					} else {
						Notification(message, "warning");
					}
				})
				.catch((e) => {
					Notification(`${this.$t("Scoring download")} ${e.message || e}`, "error");
				});
		},

		async statusChange({ id, enabled }) {
			await AssistancesService.updateScoring({ id, enabled })
				.then((response) => {
					if (response.status === 200) {
						Notification(this.$t("Scoring Successfully Updated"), "success");
						this.$refs.scoringList.fetchData();
					}
				}).catch((e) => {
					Notification(`${this.$t("Scoring")} ${e.message || e}`, "error");
				});
		},
	},
};
</script>
