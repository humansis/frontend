<template>
	<div class="assistance-summary">
		<h1 class="text-center text-h4 font-weight-bold mt-3">
			{{ assistanceName }}

			<v-icon
				v-if="validated && !completed"
				class="ml-3 mb-3"
				icon="lock"
				color="warning"
			/>

			<v-icon
				v-if="completed"
				class="ml-3 mb-2"
				icon="check"
				color="success"
			/>
		</h1>

		<p v-if="assistanceDescription" class="text-center text-body-2 font-weight-bold mt-5">
			{{ assistanceDescription }}
		</p>

		<v-tabs
			v-model="activeTab"
			:direction="isMobile ? 'vertical' : 'horizontal'"
			color="primary"
			align-tabs="center"
			class="mt-5"
		>
			<v-tab :value="0" class="text-none">
				<v-icon icon="user" class="mr-2" />

				{{ $t('To Distribute') }}
			</v-tab>

			<v-tab :value="1" class="text-none">
				<v-icon icon="bullseye" class="mr-2" />

				{{ $t('Assistance') }}
			</v-tab>

			<v-tab :value="2" class="text-none">
				<v-icon icon="home" class="mr-2" />

				{{ $t('Selection') }}
			</v-tab>
		</v-tabs>

		<v-window v-model="activeTab">
			<v-window-item class="d-flex justify-center">
				<DistributionTab
					v-if="activeTab === 0"
					:assistance="assistance"
					:is-assistance-loading="isAssistanceLoading"
					:statistics="statistics"
					:is-statistics-loading="isStatisticsLoading"
					:commodity="commodity"
					:commodities="commodities"
				/>

				<AssistanceTab
					v-if="activeTab === 1"
					:assistance="assistance"
					:is-assistance-loading="isAssistanceLoading"
					:project="project"
					:is-project-loading="isProjectLoading"
					:province="province"
					:commodity="commodity"
				/>

				<SelectionTab
					v-if="activeTab === 2"
					:assistance="assistance"
					:is-assistance-loading="isAssistanceLoading"
					:statistics="statistics"
					:is-statistics-loading="isStatisticsLoading"
				/>
			</v-window-item>
		</v-window>
	</div>
</template>

<script>
import AssistanceTab from "@/components/Assistance/AssistanceSummary/HeaderTabs/AssistanceTab";
import DistributionTab from "@/components/Assistance/AssistanceSummary/HeaderTabs/DistributionTab";
import vuetifyHelper from "@/mixins/vuetifyHelper";
import SelectionTab from "@/components/Assistance/AssistanceSummary/HeaderTabs/SelectionTab";
import { normalizeText } from "@/utils/datagrid";
import { ASSISTANCE } from "@/consts";

export default {
	name: "AssistanceSummary",

	components: {
		DistributionTab,
		AssistanceTab,
		SelectionTab,
	},

	mixins: [vuetifyHelper],

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
			province: null,
			activeTab: 0,
			commodity: [],
			isCommodityLoading: false,
		};
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

		isAssistanceTypeActivity() {
			return this.assistance?.type === ASSISTANCE.TYPE.ACTIVITY;
		},
	},

	watch: {
		assistance(newAssistance) {
			if (newAssistance) {
				this.setLocation();
				this.setCommodity();

				if (this.isAssistanceTypeActivity) {
					this.activeTab = 1;
				}
			}
		},
	},

	methods: {
		setLocation() {
			this.province = this.assistance?.adm1;
		},

		async setCommodity() {
			this.commodity = this.commodities
				.map(({ modalityType }) => ({ code: modalityType, value: modalityType }));
		},

	},
};
</script>

<style lang="scss">
.assistance-summary {
	.remote-disribution-flag {
		position: relative;
		top: -10px;
		left: -5px;
	}

	.v-col {
		max-width: fit-content;
	}

	.v-row {
		max-width: 70rem;
	}

	.v-slide-group--vertical .v-slide-group__content {
		margin: auto auto;
	}
}
</style>
