<template>
	<div class="level level-center">
		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t('Project') }}</h2>

				<div
					v-if="projectName"
					class="has-text-weight-bold is-size-5"
				>
					{{ projectName }}
				</div>
				<Loading v-else-if="isProjectLoading" type="bubbles" is-normal />
				<div v-else class="level-item">
					<b-tooltip :label="$t('Data not loaded')">
						<b-icon icon="exclamation-circle" size="is-medium" />
					</b-tooltip>
				</div>
			</div>
		</div>

		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t(admNames.adm1) }}</h2>

				<div
					v-if="provinceName"
					class="has-text-weight-bold is-size-5"
				>
					{{ provinceName }}
				</div>
				<Loading v-else-if="isAssistanceLoading" type="bubbles" is-normal />
				<div v-else class="level-item">
					<b-tooltip :label="$t('Data not loaded')">
						<b-icon icon="exclamation-circle" size="is-medium" />
					</b-tooltip>
				</div>
			</div>
		</div>

		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t('Round') }}</h2>

				<div
					v-if="!isRoundNaN"
					class="has-text-weight-bold is-size-5"
				>
					{{ round }}
				</div>
				<Loading v-else-if="isAssistanceLoading" type="bubbles" is-normal />
				<div v-else>
					<small>{{ $t("N/A") }}</small>
				</div>
			</div>
		</div>

		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t('Date of Assistance') }}</h2>

				<div
					v-if="dateDistribution"
					class="has-text-weight-bold is-size-5"
				>
					{{ dateDistribution }}
				</div>
				<Loading v-else-if="isAssistanceLoading" type="bubbles" is-normal />
				<div v-else class="level-item">
					<b-tooltip :label="$t('Data not loaded')">
						<b-icon icon="exclamation-circle" size="is-medium" />
					</b-tooltip>
				</div>
			</div>
		</div>

		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t('Expiration Date') }}</h2>

				<div
					v-if="dateExpiration && isCommoditySmartCard"
					class="has-text-weight-bold is-size-5"
				>
					{{ dateExpiration }}
				</div>
				<div v-else-if="!isExpirationDateLoaded">
					<small>{{ $t("N/A") }}</small>
				</div>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading";
import { ASSISTANCE } from "@/consts";

export default {
	name: "AssistanceTab",

	components: {
		Loading,
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
