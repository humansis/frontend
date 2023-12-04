<template>
	<v-row
		class="mt-2 mb-6 justify-center"
		no-gutters
	>
		<v-col
			v-if="assistanceType === ASSISTANCE.TYPE.DISTRIBUTION && !assistance.validated"
			class="ma-2"
		>
			<v-sheet class="pa-1 text-center elevation-1 rounded-lg box" min-width="max-content" max-width="max-content">
				<p class="text-overline">{{ $t('In assistance')}}</p>

				<div
					v-if="inAssistanceBeneficiariesCount || inAssistanceBeneficiariesCount === 0"
					class="font-weight-bold pa-2 text-subtitle-1"
				>
					{{ inAssistanceBeneficiariesCount }}
				</div>

				<v-progress-circular
					v-else-if="isStatisticsLoading"
					:size="25"
					:indeterminate="isStatisticsLoading"
					color="primary"
				/>

				<v-tooltip
					v-else
					:text="$t('Data not loaded')"
					location="top"
				>
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" icon="exclamation-circle" size="x-large" />
					</template>
				</v-tooltip>
			</v-sheet>
		</v-col>

		<v-col
			v-if="assistanceType === ASSISTANCE.TYPE.DISTRIBUTION && !assistance.validated"
			class="ma-2"
		>
			<v-sheet class="pa-1 text-center elevation-1 rounded-lg box" min-width="max-content" max-width="max-content">
				<p class="text-overline">{{ $t('To distribute')}}</p>

				<div
					v-if="isToDistributeValid"
					class="d-flex align-center justify-center font-weight-bold pa-2 text-subtitle-1"
				>
					<v-tooltip
						v-if="commodity.length"
						:text="$t(commodity.value || '')"
						location="top"
					>
						<template v-slot:activator="{ props }">
							<SvgIcon v-bind="props" :items="commodity" />
						</template>
					</v-tooltip>

					<span
						v-if="assistanceRemote"
						class="remote-disribution-flag"
					>
						R
					</span>

					<span class="pb-2">
						{{ amountTotal }}
						{{ assistanceUnit }}
					</span>
				</div>

				<v-progress-circular
					v-else-if="isStatisticsLoading"
					:size="25"
					:indeterminate="isStatisticsLoading"
					color="primary"
				/>

				<v-tooltip
					v-else
					:text="$t('Data not loaded')"
					location="top"
				>
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" icon="exclamation-circle" size="x-large" />
					</template>
				</v-tooltip>
			</v-sheet>
		</v-col>

		<v-col
			v-if="assistanceType === ASSISTANCE.TYPE.DISTRIBUTION && assistance.validated"
			class="ma-2"
		>
			<v-sheet class="pa-1 text-center elevation-1 rounded-lg box" min-width="max-content">
				<p class="text-overline">{{ $t('Reached')}}</p>

				<div
					v-if="isReachedValid"
					class="d-flex align-center justify-center font-weight-bold pa-2 text-subtitle-1"
				>
					{{ beneficiariesReached }}
					{{ $t("of") }}
					{{ inAssistanceBeneficiariesCount }}
				</div>

				<v-progress-circular
					v-else-if="isStatisticsLoading"
					:size="25"
					:indeterminate="isStatisticsLoading"
					color="primary"
				/>

				<v-tooltip
					v-else
					:text="$t('Data not loaded')"
					location="top"
				>
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" icon="exclamation-circle" size="x-large" />
					</template>
				</v-tooltip>
			</v-sheet>
		</v-col>

		<v-col
			v-if="assistanceType === ASSISTANCE.TYPE.DISTRIBUTION && assistance.validated"
			class="ma-2"
		>
			<v-sheet class="pa-1 text-center elevation-1 rounded-lg box" min-width="max-content">
				<p class="text-overline">{{ $t('Distributed')}}</p>

				<div
					v-if="isReachedValid"
					class="d-flex align-center justify-center font-weight-bold pa-2 text-subtitle-1"
				>
					<v-tooltip
						v-if="commodity.length"
						:text="$t(commodity.value || '')"
						location="top"
					>
						<template v-slot:activator="{ props }">
							<SvgIcon v-bind="props" :items="commodity" />
						</template>
					</v-tooltip>

					<span
						v-if="assistanceRemote"
						class="remote-disribution-flag"
					>
						R
					</span>

					<span class="pb-2">
						{{ amountDistributed }}
						{{ $t("of") }}
						{{ amountTotal }}
						{{ assistanceUnit }}
					</span>
				</div>

				<v-progress-circular
					v-else-if="isStatisticsLoading"
					:size="25"
					:indeterminate="isStatisticsLoading"
					color="primary"
				/>

				<v-tooltip
					v-else
					:text="$t('Data not loaded')"
					location="top"
				>
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" icon="exclamation-circle" size="x-large" />
					</template>
				</v-tooltip>
			</v-sheet>
		</v-col>
	</v-row>
</template>

<script>
import SvgIcon from "@/components/SvgIcon";
import { ASSISTANCE } from "@/consts";

export default {
	name: "DistributionTab",

	components: {
		SvgIcon,
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
			ASSISTANCE,
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
			if (this.assistance?.type === ASSISTANCE.TYPE.DISTRIBUTION) {
				return this.commodities?.[0]?.unit || "";
			}

			if (this.assistance?.type === ASSISTANCE.TYPE.ACTIVITY) return this.$t("Activity");

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

<style lang="scss">
.text-overline {
	font-size: 0.65rem !important;
}
</style>
