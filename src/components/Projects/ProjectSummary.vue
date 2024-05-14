<template>
	<div v-if="projectSummary" class="d-flex justify-center flex-column mx-auto summary-container">
		<h1 class="text-center">{{ projectSummary.name }}</h1>

		<v-row
			class="mt-2 mb-6"
			no-gutters
		>
			<v-col class="ma-2">
				<v-sheet class="pa-1 text-center elevation-1 rounded-lg box sectors" min-width="max-content">
					<p class="text-overline">{{ $t('Sectors')}}</p>

					<div>
						<svg-icon
							v-if="projectSummary.sectors.length"
							:items="projectSummary.sectors"
						/>
						<p v-else class="has-text-weight-bold is-size-5">
							{{ $t("None") }}
						</p>
					</div>
				</v-sheet>
			</v-col>

			<v-col class="ma-2">
				<v-sheet class="pa-1 text-center elevation-1 rounded-lg box" min-width="max-content">
					<p class="text-overline">{{ $t('Start Date')}}</p>

					<p class="text-h6 font-weight-bold">{{ projectSummary.startDate }}</p>
				</v-sheet>
			</v-col>

			<v-col class="ma-2">
				<v-sheet class="pa-1 text-center elevation-1 rounded-lg box" min-width="max-content">
					<p class="text-overline">{{ $t('End Date')}}</p>

					<p class="text-h6 font-weight-bold">{{ projectSummary.endDate }}</p>
				</v-sheet>
			</v-col>

			<v-col class="ma-2">
				<v-sheet class="pa-1 text-center elevation-1 rounded-lg box" min-width="max-content">
					<v-tooltip
						:text="$t('Number of donors.')"
						location="top"
						content-class="tooltip-top"
					>
						<template v-slot:activator="{ props }">
							<div v-bind="props">
								<p class="text-overline">{{ $t('Donors') }}</p>

								<p class="text-h6 font-weight-bold">{{ projectSummary.donors.length }}</p>
							</div>
						</template>
					</v-tooltip>
				</v-sheet>
			</v-col>

			<v-col class="ma-2">
				<v-sheet class="pa-1 text-center elevation-1 rounded-lg box" min-width="max-content">
					<v-tooltip
						:text="$t('Number of households imported to project.')"
						location="top"
						content-class="tooltip-top"
					>
						<template v-slot:activator="{ props }">
							<div v-bind="props">
								<p class="text-overline">{{ $t('Registered Households')}}</p>

								<p class="text-h6 font-weight-bold">{{ projectSummary.numberOfHouseholds }}</p>
							</div>
						</template>
					</v-tooltip>
				</v-sheet>
			</v-col>

			<v-col class="ma-2">
				<v-sheet class="pa-1 text-center elevation-1 rounded-lg box" min-width="max-content">
					<v-tooltip
						:text="$t('Number of beneficiaries imported to project.')"
						location="top"
						content-class="tooltip-top"
					>
						<template v-slot:activator="{ props }">
							<div v-bind="props">
								<p class="text-overline">{{ $t('Registered Individuals')}}</p>

								<p class="text-h6 font-weight-bold">{{ projectSummary.beneficiariesReached }}</p>
							</div>
						</template>
					</v-tooltip>
				</v-sheet>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import ProjectService from "@/services/ProjectService";
import SvgIcon from "@/components/SvgIcon";
import { normalizeText } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "ProjectSummary",

	components: { SvgIcon },

	data() {
		return {
			projectSummary: null,
		};
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			try {
				const {
					data,
					status,
					message,
				} = await ProjectService.getDetailOfProject(
					this.$route.params.projectId,
				);

				checkResponseStatus(status, message);

				const dataCopy = data;
				dataCopy.sectors = data.sectors?.map((sector) => ({ code: sector, value: sector }));
				this.projectSummary = dataCopy;

				this.$emit("projectLoaded", dataCopy);
			} catch (e) {
				Notification(`${this.$t("Detail of Project")}: ${e.message || e}`, "error");
			}
		},

		normalizeText(value) {
			return normalizeText(value);
		},
	},
};
</script>

<style lang="scss" scoped>
.summary-container {
	max-width: 90rem;

	.text-overline {
		font-size: 0.65rem !important;
	}

	.box {
		height: 100%;

		&.sectors {
			@media (max-width: 768px) {
				min-width: 15rem !important;
			}
		}
	}
}

</style>
