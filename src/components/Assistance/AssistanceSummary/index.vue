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
			position="is-centered"
			class="ml-3"
		>
			<b-tab-item :label="$t('To Distribute')" icon="user" class="relative-position">
				<DistributionTab
					:assistance="assistance"
					:is-assistance-loading="isAssistanceLoading"
					:statistics="statistics"
					:is-statistics-loading="isStatisticsLoading"
					:commodity="commodity"
					:commodities="commodities"
				/>
			</b-tab-item>

			<b-tab-item :label="$t('Assistance')" icon="bullseye" class="relative-position">
				<AssistanceTab
					:assistance="assistance"
					:is-assistance-loading="isAssistanceLoading"
					:project="project"
					:is-project-loading="isProjectLoading"
					:province="province"
					:commodity="commodity"
					:is-commodity-loading="isCommodityLoading"
				/>
			</b-tab-item>

			<b-tab-item :label="$t('Selection')" icon="home" class="relative-position">
				<SelectionTab
					:assistance="assistance"
					:is-assistance-loading="isAssistanceLoading"
					:statistics="statistics"
					:is-statistics-loading="isStatisticsLoading"
				/>
			</b-tab-item>
		</b-tabs>
	</div>
</template>

<script>
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
		statistics: {
			type: Object,
			default: () => {},
		},
		isStatisticsLoading: {
			type: Boolean,
			default: false,
		},
		isAssistanceLoading: {
			type: Boolean,
			default: false,
		},
		isCommoditiesLoading: {
			type: Boolean,
			default: false,
		},
		isProjectLoading: {
			type: Boolean,
			default: false,
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
			isCommodityLoading: false,
		};
	},

	watch: {
		assistance(newAssistance) {
			if (newAssistance) {
				this.setLocation();
				this.fetchCommodity(newAssistance.id);
			}
		},
	},

	computed: {
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
		setLocation() {
			this.province = this.assistance?.adm1;
		},

		async fetchCommodity(assistanceId) {
			this.isCommodityLoading = true;

			await AssistancesService.getAssistanceCommodities(
				assistanceId,
			).then(({ data }) => {
				this.commodity = data
					.map(({ modalityType }) => ({ code: modalityType, value: modalityType }));
			}).finally(() => {
				this.isCommodityLoading = false;
			});
		},

	},
};
</script>

<style lang="scss">
.assistance-summary {
	.box {
		font-size: 17px;
		line-height: 30px;
	}

	.tooltip-trigger {
		height: 1.7em;
	}

	.remote-disribution-flag {
		position: relative;
		top: -10px;
		left: -5px;
	}
}
</style>
