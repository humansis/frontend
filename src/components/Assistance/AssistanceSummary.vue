<template>
	<div>
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
		<nav class="level level-center">
			<div class="level-item has-text-centered">
				<div class="box">
					<h2 class="heading">{{ $t(admNames.adm1) }}</h2>

					<div v-if="provinceName" class="has-text-weight-bold is-size-5">{{ provinceName }}</div>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<h2 class="heading">{{ $t('Round') }}</h2>

					<div class="has-text-weight-bold is-size-5">{{ assistanceRound }}</div>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<h2 class="heading">{{ $t('Beneficiaries') }}</h2>

					<div
						v-if="beneficiariesCount || beneficiariesCount === 0"
						class="has-text-weight-bold is-size-5"
					>
						{{ beneficiariesCount }}
					</div>
					<Loading v-else type="bubbles" is-normal />
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
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<h2 class="heading">{{ $t('Expiration Date') }}</h2>

					<div
						v-if="dateExpiration"
						class="has-text-weight-bold is-size-5"
					>
						{{ dateExpiration }}
					</div>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<h2 class="heading">{{ $t('Project') }}</h2>

					<div v-if="projectName" class="has-text-weight-bold is-size-5">{{ projectName }}</div>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<h2 class="heading">{{ $t('Target') }}</h2>

					<div
						v-if="assistanceTarget"
						class="has-text-weight-bold is-size-5"
					>
						{{ $t(assistanceTarget) }}
					</div>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<h2 class="heading">{{ $t('Scoring') }}</h2>

					<div
						v-if="assistanceTarget"
						class="has-text-weight-bold is-size-5"
					>
						{{ assistanceScoringType }}
					</div>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div
				v-if="assistanceType === consts.TYPE.DISTRIBUTION"
				class="level-item has-text-centered"
			>
				<div class="box commodity-item">
					<h2 class="heading">{{ $t('Commodity') }}</h2>

					<div
						v-if="commodity"
						class="is-flex is-align-items-center has-text-weight-bold is-size-5"
					>
						<b-tooltip
							v-if="commodity"
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
					</div>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>
		</nav>
		<hr>
	</div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "@/components/Loading";
import LocationsService from "@/services/LocationsService";
import { normalizeText } from "@/utils/datagrid";
import SvgIcon from "@/components/SvgIcon";
import AssistancesService from "@/services/AssistancesService";
import consts from "@/utils/assistanceConst";

export default {
	name: "AssistanceSummary",

	components: {
		SvgIcon,
		Loading,
	},

	props: {
		assistance: Object,
		project: Object,
	},

	data() {
		return {
			consts,
			province: null,
			commodity: null,
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
			return this.commodity?.[0].code === consts.COMMODITY.SMARTCARD
				? this.$moment(this.assistance?.dateExpiration).format("YYYY-MM-DD hh:mm") || ""
				: "N/A";
		},

		beneficiariesCount() {
			return this.statistics?.numberOfBeneficiaries || 0;
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

<style scoped>
.box {
	height: 90px;
}

.remote-disribution-flag {
	position: relative;
	top: -18px;
	left: -10px;
}
</style>
