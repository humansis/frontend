<template>
	<nav class="level">
		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t('In assistance') }}</h2>
				<p
					v-if="beneficiariesCount || beneficiariesCount === 0"
					class="has-text-weight-bold is-size-5"
				>
					{{ beneficiariesCount }}
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
					v-if="beneficiariesReached || beneficiariesReached === 0"
					class="has-text-weight-bold is-size-5"
				>
					{{ beneficiariesReached }}
					{{ $t("of") }}
					{{ beneficiariesCount }}
				</p>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>

		<div
			v-if="assistanceType === consts.TYPE.DISTRIBUTION"
			class="level-item has-text-centered"
		>
			<div class="box commodity-item">
				<h2 class="heading">{{ $t('Commodity') }}</h2>
				<p
					v-if="commodity.length"
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
					v-if="amountDistributed || amountDistributed === 0"
					class="has-text-weight-bold is-size-5"
				>
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
		beneficiariesCount() {
			return this.statistics?.beneficiariesTotal || 0;
		},

		beneficiariesReached() {
			return this.statistics?.beneficiariesReached || 0;
		},

		amountDistributed() {
			return this.statistics?.amountDistributed || 0;
		},

		amountTotal() {
			return this.statistics?.amountTotal || 0;
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
	},
};
</script>
