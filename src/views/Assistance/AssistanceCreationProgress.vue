<template>
	<div class=" mt-16 mx-8">
		<div v-if="isProgressStatisticsLoading" class="d-flex flex-column align-center">
			<Loading is-large />
		</div>

		<div v-else class="d-flex flex-column align-center font-weight-bold">
			<h1 class="mb-5">
				{{ assistanceName }}
			</h1>

			<p class="text-h6 mb-5">
				{{ $t("Assistance is being created") }}:

				<strong>{{ creationProgress }} %</strong>
			</p>

			<v-progress-linear
				:model-value="creationProgress"
				color="green"
				height="20"
				rounded
			>
				<template v-slot:default>
					<strong>{{ creationProgress }}%</strong>
				</template>
			</v-progress-linear>

			<p class="mt-10">
				{{ $t("You can leave this screen and return later.") }}
			</p>

			<v-btn
				:to="{ name: 'Project' }"
				size="large"
				color="light-blue-lighten-4"
				prepend-icon="clipboard-list"
				class="text-none mt-10"
			>
				{{ $t('Go to Project') }}
			</v-btn>
		</div>
	</div>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import Loading from "@/components/Loading";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	components: {
		Loading,
	},

	data() {
		return {
			assistanceName: "",
			beneficiariesCreated: 0,
			beneficiariesTotal: 0,
			isAssistanceCreated: false,
			isProgressStatisticsLoading: false,
			statisticsInterval: null,
		};
	},

	computed: {
		creationProgress() {
			const progress = this.beneficiariesCreated / this.beneficiariesTotal;

			return Math.round((progress + Number.EPSILON) * 10000) / 100;
		},
	},

	mounted() {
		this.setIntervalForAssistanceCreationProgress();
	},

	methods: {
		async setIntervalForAssistanceCreationProgress() {
			this.isProgressStatisticsLoading = true;

			await this.fetchAssistanceCreationProgress();

			this.isProgressStatisticsLoading = false;
			this.tryToNavigateToAssistanceEdit();

			this.statisticsInterval = setInterval(async () => {
				if (this.isAssistanceCreated || !this.$route.params.assistanceId) {
					clearInterval(this.statisticsInterval);

					this.tryToNavigateToAssistanceEdit();
				} else {
					await this.fetchAssistanceCreationProgress();
				}
			}, 5000);
		},

		async fetchAssistanceCreationProgress() {
			try {
				const {
					data: {
						name,
						createdBeneficiariesCount,
						totalBeneficiariesCount,
						isCreated,
					},
					message,
					status,
				} = await AssistancesService.getAssistanceCreationProgress(
					this.$route.params.assistanceId,
				);

				checkResponseStatus(status, message);

				this.assistanceName = name;
				this.beneficiariesCreated = createdBeneficiariesCount;
				this.beneficiariesTotal = totalBeneficiariesCount;
				this.isAssistanceCreated = isCreated;

				if (this.isAssistanceCreated) {
					clearInterval(this.statisticsInterval);
					this.tryToNavigateToAssistanceEdit();
				}
			} catch (e) {
				Notification(`${this.$t("Assistance creation progress")}: ${e.message || e}`, "error");
			}
		},

		tryToNavigateToAssistanceEdit() {
			if (this.isAssistanceCreated) {
				this.$router.push({
					name: "AssistanceEdit",
					params: {
						assistanceId: this.$route.params.assistanceId,
					},
				});
			}
		},
	},
};
</script>
