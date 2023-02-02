<template>
	<nav class="level level-center">
		<div
			v-if="assistanceType === consts.TYPE.DISTRIBUTION && !assistance.validated"
			class="level-item has-text-centered"
		>
			<div class="box">
				<h2 class="heading">{{ $t('In assistance') }}</h2>

				<div
					v-if="inAssistanceBeneficiariesCount || inAssistanceBeneficiariesCount === 0"
					class="has-text-weight-bold is-size-5"
				>
					{{ inAssistanceBeneficiariesCount }}
				</div>
				<Loading v-else-if="isStatisticsLoading" type="bubbles" is-normal />
				<div v-else class="level-item">
					<b-tooltip :label="$t('Data not loaded')">
						<b-icon icon="exclamation-circle" size="is-medium" />
					</b-tooltip>
				</div>
			</div>
		</div>

		<div
			v-if="assistanceType === consts.TYPE.DISTRIBUTION && !assistance.validated"
			class="level-item has-text-centered"
		>
			<div class="box">
				<h2 class="heading">{{ $t('To distribute') }}</h2>

				<div
					v-if="isToDistributeValid"
					class="is-flex is-align-items-center has-text-weight-bold is-size-5"
				>
					<b-tooltip
						v-if="commodity.length"
						:label="$t(commodity.value)"
					>
						<SvgIcon :items="commodity" />
					</b-tooltip>
					<span
						v-if="assistanceRemote"
						class="remote-disribution-flag"
					>
						R
					</span>
					{{ amountTotal }}
					{{ assistanceUnit }}
				</div>
				<Loading v-else-if="isStatisticsLoading" type="bubbles" is-normal />
				<div v-else class="level-item">
					<b-tooltip :label="$t('Data not loaded')">
						<b-icon icon="exclamation-circle" size="is-medium" />
					</b-tooltip>
				</div>
			</div>
		</div>

		<div
			v-if="assistanceType === consts.TYPE.DISTRIBUTION && assistance.validated"
			class="level-item has-text-centered"
		>
			<div class="box">
				<h2 class="heading">{{ $t('Reached') }}</h2>

				<div
					v-if="isReachedValid"
					class="is-flex is-justify-content-center has-text-weight-bold is-size-5"
				>
					{{ beneficiariesReached }}
					{{ $t("of") }}
					{{ inAssistanceBeneficiariesCount }}
				</div>
				<Loading v-else-if="isStatisticsLoading" type="bubbles" is-normal />
				<div v-else class="level-item">
					<b-tooltip :label="$t('Data not loaded')">
						<b-icon icon="exclamation-circle" size="is-medium" />
					</b-tooltip>
				</div>
			</div>
		</div>

		<div
			v-if="assistanceType === consts.TYPE.DISTRIBUTION && assistance.validated"
			class="level-item has-text-centered"
		>
			<div class="box">
				<h2 class="heading">{{ $t('Distributed') }}</h2>

				<div
					v-if="isDistributedValid"
					class="is-flex is-align-items-center has-text-weight-bold is-size-5"
				>
					<b-tooltip
						v-if="commodity.length"
						:label="$t(commodity.value)"
					>
						<SvgIcon :items="commodity" />
					</b-tooltip>
					<span
						v-if="assistanceRemote"
						class="remote-disribution-flag"
					>
						R
					</span>
					{{ amountDistributed }}
					{{ $t("of") }}
					{{ amountTotal }}
					{{ assistanceUnit }}
				</div>
				<Loading v-else-if="isStatisticsLoading" type="bubbles" is-normal />
				<div v-else class="level-item">
					<b-tooltip :label="$t('Data not loaded')">
						<b-icon icon="exclamation-circle" size="is-medium" />
					</b-tooltip>
				</div>
			</div>
		</div>
	</nav>
</template>

<script>
import SvgIcon from "@/components/SvgIcon";
import Loading from "@/components/Loading";
import consts from "@/utils/assistanceConst";

export default {
	name: "DistributionTab",

	components: {
		SvgIcon,
		Loading,
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
		commodity: {
			type: Array,
			default: () => [],
		},
		commodities: {
			type: Array,
			default: () => [],
		},
	},

	data() {
		return {
			consts,
		};
	},

	computed: {
		inAssistanceBeneficiariesCount() {
			return this.statistics?.beneficiariesTotal - this.statistics?.beneficiariesDeleted;
		},

		beneficiariesReached() {
			return this.statistics?.beneficiariesReached;
		},

		amountDistributed() {
			return this.statistics?.amountDistributed;
		},

		amountTotal() {
			return this.statistics?.amountTotal;
		},

		assistanceUnit() {
			if (this.assistance?.type === consts.TYPE.DISTRIBUTION) {
				return this.commodities?.[0]?.unit || "";
			}

			if (this.assistance?.type === consts.TYPE.ACTIVITY) return this.$t("Activity");

			return "";
		},

		assistanceType() {
			return this.assistance?.type || "";
		},

		assistanceRemote() {
			return !!this.assistance?.remoteDistributionAllowed;
		},

		isToDistributeValid() {
			return (this.amountTotal || this.amountTotal === 0)
				&& (this.assistanceUnit || this.assistanceUnit === "");
		},

		isReachedValid() {
			return (this.beneficiariesReached || this.beneficiariesReached === 0)
				&& (this.inAssistanceBeneficiariesCount
					|| this.inAssistanceBeneficiariesCount === 0);
		},

		isDistributedValid() {
			return (this.amountDistributed || this.amountDistributed === 0)
				&& (this.amountTotal || this.amountTotal === 0)
					&& (this.assistanceUnit || this.assistanceUnit === "");
		},
	},
};
</script>
