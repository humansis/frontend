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
				/>
			</b-tab-item>

			<b-tab-item :label="$t('Selection')" icon="home" class="relative-position">
				<SelectionTab
					:assistance="assistance"
					:statistics="statistics"
				/>
			</b-tab-item>

			<b-tab-item :label="$t('Distribution')" icon="bullseye" class="relative-position">
				<DistributionTab
					:assistance="assistance"
					:statistics="statistics"
					:commodity="commodity"
					:commodities="commodities"
				/>
			</b-tab-item>
		</b-tabs>

		<nav class="level hide-desktop hide-tablet">
			<AssistanceTab
				:projectName="projectName"
				:admName="admNames.adm1"
				:provinceName="provinceName"
			/>
			<SelectionTab
				:assistance="assistance"
				:statistics="statistics"
			/>
			<DistributionTab
				:assistance="assistance"
				:statistics="statistics"
				:commodity="commodity"
				:commodities="commodities"
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
		assistance: {
			type: Object,
			default: () => {},
		},
		project: {
			type: Object,
			default: () => {},
		},
		commodities: {
			type: Array,
			default: () => [],
		},
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

		assistanceTarget() {
			return normalizeText(this.assistance?.target);
		},

		assistanceScoringType() {
			return this.assistance?.scoringBlueprint?.name || this.$t("Default");
		},

		assistanceDescription() {
			return this.assistance?.description;
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

		modalityType() {
			return this.commodities?.[0]?.modalityType;
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
			flex-grow: .05;
		}
	}

	.remote-disribution-flag {
		position: relative;
		top: -18px;
		left: -10px;
	}
}
</style>
