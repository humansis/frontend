<template>
	<div>
		<div class="add-config-btn">
			<b-button
				v-if="userCan.createScoring"
				type="is-primary"
				icon-left="plus"
				@click="addNewScoringOption"
			>
				{{ $t('Add') }}
			</b-button>
		</div>

		<Modal
			can-cancel
			:active="scoringModal.isOpened"
			:header="$t('Add new scoring')"
			@close="closeScoringModal"
		>
			<ScoringForm
				close-button
				class="modal-card"
				:formModel="scoringModel"
				@formSubmitted="submitScoringForm"
				@formClosed="closeScoringModal"
			/>
		</Modal>

		<ScoringList
			ref="scoringList"
			@remove="removeScoring"
			@download="downloadScoring"
			@statusChange="statusChange"
		/>
	</div>
</template>

<script>
import ScoringForm from "@/components/CountrySettings/CountrySpecific/Scoring/ScoringForm";
import ScoringList from "@/components/CountrySettings/CountrySpecific/Scoring/ScoringList";
import AssistancesService from "@/services/AssistancesService";
import Modal from "@/components/Modal";
import { Toast, Notification } from "@/utils/UI";
import permissions from "@/mixins/permissions";

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
						Toast(this.$t("Scoring Successfully Created"), "is-success");
						this.$refs.scoringList.fetchData();
						this.closeScoringModal();
					} else if (response.message) {
						Notification(response.message, "is-danger");
					}
				}).catch((e) => {
					Toast(`${this.$t("Scoring")} ${e}`, "is-danger");
				});
		},

		async removeScoring(id) {
			try {
				const { status, message } = await AssistancesService.removeScoring(id);

				if (status === 204) {
					Toast(this.$t("Scoring Successfully Removed"), "is-success");
					await this.$refs.scoringList.fetchData();
				} else if (message) {
					Notification(message, "is-danger");
				}
			} catch (e) {
				Toast(`${this.$t("Scoring")} ${e}`, "is-danger");
			}
		},

		async downloadScoring(scoring) {
			try {
				const { data, status, message } = await AssistancesService.downloadScoring(
					scoring.id,
				);

				if (status === 200) {
					const blob = new Blob([data], { type: data.type });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = `${scoring.name}-ID-${scoring.id}`;
					link.click();
				} else {
					Notification(message, "is-warning");
				}
			} catch (e) {
				if (e.message) Notification(`${this.$t("Scoring download")} ${e}`, "is-danger");
			}
		},

		async statusChange({ id, enabled }) {
			try {
				const { status } = await AssistancesService.updateScoring({ id, enabled });

				if (status === 200) {
					Toast(this.$t("Scoring Successfully Updated"), "is-success");
					this.$refs.scoringList.fetchData();
				}
			} catch (e) {
				if (e.message) Notification(`${this.$t("Scoring")} ${e}`, "is-danger");
			}
		},
	},
};
</script>
