<template>
	<div class="assistance-summary">
		<h2 class="title is-flex is-justify-content-center is-align-items-center">
			{{ assistanceName }}
			<b-icon
				v-if="validated && !completed"
				class="ml-3"
				size="is-medium"
				icon="lock"
				type="is-warning"
			/>
			<b-icon
				v-if="completed"
				class="ml-3"
				size="is-medium"
				icon="check"
				type="is-success"
			/>
		</h2>
		<p v-if="assistanceDescription" class="has-text-centered mb-6">
			{{ assistanceDescription }}
		</p>
		<b-tabs
			vertical
			class="hide-mobile ml-3"
		>
			<b-tab-item :label="$t('Assistance')" icon="user" class="relative-position">
				<AssistanceTab
					:projectName="projectName"
					:admName="admNames.adm1"
					:provinceName="provinceName"
					:round="assistanceRound"
					:dateDistribution="dateDistribution"
					:dateExpiration="dateExpiration"
				/>
			</b-tab-item>

			<b-tab-item :label="$t('Selection')" icon="home" class="relative-position">
				<SelectionTab
					:assistanceTarget="assistanceTarget"
					:assistanceScoringType="assistanceScoringType"
					:beneficiariesCount="beneficiariesCount"
					:beneficiariesDeleted="beneficiariesDeleted"
				/>
			</b-tab-item>

			<b-tab-item :label="$t('Distribution')" icon="bullseye" class="relative-position">
				<DistributionTab
					:assistanceType="assistanceType"
					:assistanceRemote="assistanceRemote"
					:commodity="commodity"
					:beneficiariesCount="beneficiariesCount"
				/>
			</b-tab-item>
		</b-tabs>

		<nav class="level hide-desktop hide-tablet">
			<AssistanceTab
				:projectName="projectName"
				:admName="admNames.adm1"
				:provinceName="provinceName"
				:round="assistanceRound"
				:dateDistribution="dateDistribution"
				:dateExpiration="dateExpiration"
			/>
			<SelectionTab
				:assistanceTarget="assistanceTarget"
				:assistanceScoringType="assistanceScoringType"
				:beneficiariesCount="beneficiariesCount"
				:beneficiariesDeleted="beneficiariesDeleted"
			/>
			<DistributionTab
				:assistanceType="assistanceType"
				:assistanceRemote="assistanceRemote"
				:commodity="commodity"
				:beneficiariesCount="beneficiariesCount"
			/>
		</nav>
		<hr>
	</div>
</template>

<script>
import { mapState } from "vuex";
import LocationsService from "@/services/LocationsService";
import { normalizeText } from "@/utils/datagrid";
import AssistancesService from "@/services/AssistancesService";
import DistributionTab from "@/components/Assistance/AssistanceSummary/HeaderTabs/DistributionTab";
import AssistanceTab from "@/components/Assistance/AssistanceSummary/HeaderTabs/AssistanceTab";
import SelectionTab from "@/components/Assistance/AssistanceSummary/HeaderTabs/SelectionTab";
import consts from "@/utils/assistanceConst";

export default {
	name: "AssistanceSummary",

	components: {
		DistributionTab,
		AssistanceTab,
		SelectionTab,
	},

	props: {
		assistance: Object,
		project: Object,
	},

	data() {
		return {
			consts,
			province: null,
			commodity: [],
			statistics: null,
		};
	},

	watch: {
		assistance(newAssistance) {
			if (newAssistance) {
				this.fetchLocation(newAssistance.adm1Id);
				this.fetchCommodity(newAssistance.id);
				this.fetchStatistics(newAssistance.id);
			}
		},
	},

	computed: {
		...mapState(["admNames"]),

		assistanceName() {
			return this.assistance?.name || "";
		},

		assistanceRound() {
			const isRoundNaN = Number.isNaN(parseInt(this.assistance?.round, 10));
			return isRoundNaN ? "N/A" : this.assistance.round;
		},

		assistanceType() {
			return this.assistance?.type;
		},

		assistanceTarget() {
			return normalizeText(this.assistance?.target);
		},

		assistanceScoringType() {
			return this.assistance?.scoringBlueprint?.name || this.$t("Default");
		},

		assistanceDescription() {
			return this.assistance?.description;
		},

		assistanceRemote() {
			return !!this.assistance?.remoteDistributionAllowed;
		},

		provinceName() {
			return this.province?.name || "";
		},

		projectName() {
			return this.project?.name || "";
		},

		validated() {
			return this.assistance?.validated || false;
		},

		completed() {
			return this.assistance?.completed || false;
		},

		dateDistribution() {
			return this.$moment(this.assistance?.dateDistribution).format("YYYY-MM-DD hh:mm") || "";
		},

		dateExpiration() {
			return this.$moment(this.assistance?.dateExpiration).format("YYYY-MM-DD hh:mm") || "";
		},

		beneficiariesCount() {
			return this.statistics?.beneficiariesTotal || 0;
		},

		beneficiariesDeleted() {
			return this.statistics?.beneficiariesDeleted || 0;
		},
	},

	methods: {
		async fetchLocation(adm1Id) {
			await LocationsService.getDetailOfAdm1(
				adm1Id,
			).then(({ data }) => {
				this.province = data;
			});
		},

		async fetchCommodity(assistanceId) {
			await AssistancesService.getAssistanceCommodities(
				assistanceId,
			).then(({ data }) => {
				this.commodity = data
					.map(({ modalityType }) => ({ code: modalityType, value: modalityType }));
			});
		},

		async fetchStatistics(assistanceId) {
			await AssistancesService.getAssistanceStatistics(
				assistanceId,
			).then((data) => {
				this.statistics = data;
			});
		},
	},
};
</script>

<style lang="scss">
// Cannot be scoped CSS, we need to adjust .tab-content
.assistance-summary {
	.box {
		height: 90px;
	}

	.tab-content {
		height: 118px;
	}

	.relative-position {
		position: relative !important;
	}

	.level {
		justify-content: flex-start;
		.level-item:not(.is-narrow) {
			flex-grow: 0.05;
		}
	}

	.remote-disribution-flag {
		position: relative;
		top: -18px;
		left: -10px;
	}
}
</style>
