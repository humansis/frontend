<template>
	<nav class="level level-center">
		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t('Target') }}</h2>

				<div
					v-if="assistanceTarget"
					class="has-text-weight-bold is-size-5"
				>
					{{ assistanceTarget }}
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
				<h2 class="heading">{{ $t('Scoring') }}</h2>

				<div
					v-if="assistanceTarget && assistanceScoringType"
					class="has-text-weight-bold is-size-5"
				>
					{{ assistanceScoringType }}
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
				<h2 class="heading">{{ $t('Selected') }}</h2>

				<div
					v-if="beneficiariesCount || beneficiariesCount === 0"
					class="has-text-weight-bold is-size-5"
				>
					{{ beneficiariesCount }}
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
import { normalizeText } from "@/utils/datagrid";
import Loading from "@/components/Loading";

export default {
	name: "SelectionTab",

	components: {
		Loading,
	},

	props: {
		assistance: {
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
		statistics: {
			type: Object,
			default: () => {},
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
			if (this.assistance.scoringBlueprint) {
				const { name, id } = this.assistance.scoringBlueprint;

				return name ? `${name} (ID: ${id})` : null;
			}
			return null;
		},

		beneficiariesCount() {
			return this.statistics?.beneficiariesTotal;
		},

		beneficiariesDeleted() {
			return this.statistics?.beneficiariesTotal;
		},
	},
};
</script>
