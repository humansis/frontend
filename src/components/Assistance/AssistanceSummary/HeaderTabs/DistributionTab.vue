<template>
	<nav class="level">
		<div
			v-if="assistanceType === consts.TYPE.DISTRIBUTION && !assistance.validated"
			class="level-item has-text-centered"
		>
			<div class="box">
				<h2 class="heading">{{ $t('In assistance') }}</h2>
				<p
					v-if="inAssistanceBeneficiariesCount || inAssistanceBeneficiariesCount === 0"
					class="has-text-weight-bold is-size-5"
				>
					{{ inAssistanceBeneficiariesCount }}
				</p>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>

		<div
			v-if="assistanceType === consts.TYPE.DISTRIBUTION && !assistance.validated"
			class="level-item has-text-centered"
		>
			<div class="box">
				<h2 class="heading">{{ $t('To distribute') }}</h2>
				<p
					v-if="isToDistributeValid"
					class="has-text-weight-bold is-size-5"
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
				</p>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>

		<div
			v-if="assistanceType === consts.TYPE.DISTRIBUTION && assistance.validated"
			class="level-item has-text-centered"
		>
			<div class="box">
				<h2 class="heading">{{ $t('Reached') }}</h2>
				<p
					v-if="isReachedValid"
					class="has-text-weight-bold is-size-5"
				>
					{{ beneficiariesReached }}
					{{ $t("of") }}
					{{ inAssistanceBeneficiariesCount }}
				</p>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>

		<div
			v-if="assistanceType === consts.TYPE.DISTRIBUTION && assistance.validated"
			class="level-item has-text-centered"
		>
			<div class="box">
				<h2 class="heading">{{ $t('Distributed') }}</h2>
				<p
					v-if="isDistributedValid"
					class="has-text-weight-bold is-size-5"
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
				</p>
				<Loading v-else type="bubbles" is-normal />
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
				return this.commodities?.[0]?.unit;
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
