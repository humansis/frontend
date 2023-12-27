<template>
	<v-row
		class="mt-2 mb-6 justify-center"
		no-gutters
	>
		<v-col class="ma-2">
			<v-sheet class="pa-1 text-center elevation-1 rounded-lg box">
				<p class="text-overline">{{ $t('Project')}}</p>

				<div
					v-if="projectName"
					class="font-weight-bold pa-2 text-subtitle-1"
				>
					{{ projectName }}
				</div>

				<v-progress-circular
					v-else-if="isProjectLoading"
					:size="25"
					:indeterminate="isProjectLoading"
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

		<v-col class="ma-2">
			<v-sheet class="pa-1 text-center elevation-1 rounded-lg box">
				<p class="text-overline">{{ $t(admNames.adm1) }}</p>

				<div
					v-if="provinceName"
					class="font-weight-bold pa-2 text-subtitle-1"
				>
					{{ provinceName }}
				</div>

				<v-progress-circular
					v-else-if="isAssistanceLoading"
					:indeterminate="isAssistanceLoading"
					:size="25"
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

		<v-col class="ma-2">
			<v-sheet class="pa-1 text-center elevation-1 rounded-lg box">
				<p class="text-overline">{{ $t('Round') }}</p>

				<div
					v-if="!isRoundNaN"
					class="font-weight-bold pa-2 text-subtitle-1"
				>
					{{ round }}
				</div>

				<v-progress-circular
					v-else-if="isAssistanceLoading"
					:indeterminate="isAssistanceLoading"
					:size="25"
					color="primary"
				/>

				<div v-else class="pa-2 text-subtitle-1">
					{{ $t("N/A") }}
				</div>
			</v-sheet>
		</v-col>

		<v-col class="ma-2">
			<v-sheet class="pa-1 text-center elevation-1 rounded-lg box">
				<p class="text-overline">{{ 'Date of Assistance' }}</p>

				<div
					v-if="dateDistribution"
					class="font-weight-bold pa-2 text-subtitle-1"
				>
					{{ dateDistribution }}
				</div>

				<v-progress-circular
					v-else-if="isAssistanceLoading"
					:indeterminate="isAssistanceLoading"
					:size="25"
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

		<v-col class="ma-2">
			<v-sheet class="pa-1 text-center elevation-1 rounded-lg box">
				<p class="text-overline">{{ 'Expiration Date' }}</p>

				<div
					v-if="dateExpiration && isCommoditySmartCard"
					class="font-weight-bold pa-2 text-subtitle-1"
				>
					{{ dateExpiration }}
				</div>

				<div v-else-if="!isExpirationDateLoaded" class="pa-2 text-subtitle-1">
					{{ $t("N/A") }}
				</div>

				<v-progress-circular
					v-else
					:indeterminate="isAssistanceLoading"
					:size="25"
					color="primary"
				/>
			</v-sheet>
		</v-col>
	</v-row>
</template>

<script>
import { mapState } from "vuex";
import { ASSISTANCE } from "@/consts";

export default {
	name: "AssistanceTab",

	props: {
		assistance: {
			type: Object,
			default: () => {},
		},

		project: {
			type: Object,
			default: () => {},
		},

		province: {
			type: Object,
			default: () => {},
		},

		isAssistanceLoading: {
			type: Boolean,
			default: false,
		},

		isProjectLoading: {
			type: Boolean,
			default: false,
		},

		isCommodityLoading: {
			type: Boolean,
			default: false,
		},

		commodity: {
			type: Array,
			default: () => [],
		},
	},

	computed: {
		...mapState(["admNames"]),

		round() {
			return this.assistance?.round;
		},

		dateDistribution() {
			return this.$moment(this.assistance?.dateDistribution).format("YYYY-MM-DD");
		},

		dateExpiration() {
			return this.$moment(this.assistance?.dateExpiration).format("YYYY-MM-DD");
		},

		provinceName() {
			return this.province?.name;
		},

		projectName() {
			return this.project?.name;
		},

		isRoundNaN() {
			return Number.isNaN(parseInt(this.assistance?.round, 10));
		},

		isCommoditySmartCard() {
			return this.commodity[0]?.code === ASSISTANCE.COMMODITY.SMARTCARD;
		},

		isExpirationDateLoaded() {
			return this.isAssistanceLoading;
		},

	},
};
</script>
