<template>
	<div v-if="projectSummary" ref="projectSummary">
		<h1 class="title has-text-centered">{{ projectSummary.name }}</h1>

		<nav class="level level-center">
			<div class="level-item has-text-centered">
				<div class="box">
					<h2 class="heading">{{ $t('Sectors') }}</h2>

					<div>
						<svg-icon
							v-if="projectSummary.sectors.length"
							:items="projectSummary.sectors"
						/>
						<p v-else class="has-text-weight-bold is-size-5">
							{{ $t("None") }}
						</p>
					</div>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<h2 class="heading">{{ $t('Start Date') }}</h2>

					<div class="has-text-weight-bold is-size-5">
						{{ $moment(projectSummary.startDate).format("YYYY-MM-DD") }}
					</div>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<h2 class="heading">{{ $t('End Date') }}</h2>

					<div class="has-text-weight-bold is-size-5">
						{{ $moment(projectSummary.endDate).format("YYYY-MM-DD") }}
					</div>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<b-tooltip :label="$t('Number of donors.')">
						<h2 class="heading">{{ $t('Donors') }}</h2>

						<div class="has-text-weight-bold is-size-5">
							{{ projectSummary.donorIds.length }}
						</div>
					</b-tooltip>

				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<h2 class="heading">{{ $t('Target Households') }}</h2>

					<div class="has-text-weight-bold is-size-5">{{ projectSummary.target }}</div>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<b-tooltip :label="$t('Number of households imported to project.')">
						<h2 class="heading">{{ $t('Registered Households') }}</h2>

						<div class="has-text-weight-bold is-size-5">
							{{ projectSummary.numberOfHouseholds }}
						</div>
					</b-tooltip>

				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<b-tooltip :label="$t('Number of beneficiaries imported to project.')">
						<h2 class="heading"> {{ $t('Registered Individuals') }}</h2>

						<div class="has-text-weight-bold is-size-5">
							{{ projectSummary.beneficiariesReached }}
						</div>
					</b-tooltip>

				</div>
			</div>

		</nav>
		<hr>
	</div>
</template>

<script>
import ProjectService from "@/services/ProjectService";
import { Notification } from "@/utils/UI";
import SvgIcon from "@/components/SvgIcon";
import { normalizeText } from "@/utils/datagrid";

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
			await ProjectService.getDetailOfProject(
				this.$route.params.projectId,
			).then(({ data }) => {
				const dataCopy = data;
				dataCopy.sectors = data.sectors?.map((sector) => ({ code: sector, value: sector }));
				this.projectSummary = dataCopy;

				this.$emit("projectLoaded", dataCopy);
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Detail of Project")} ${e}`, "is-danger");
			});
		},

		normalizeText(value) {
			return normalizeText(value);
		},
	},
};
</script>

<style scoped>
.box {
	height: 90px;
}
</style>
