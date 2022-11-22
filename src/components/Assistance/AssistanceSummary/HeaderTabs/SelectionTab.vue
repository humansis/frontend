<template>
	<nav class="level">
		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t('Target') }}</h2>
				<p
					v-if="assistanceTarget"
					class="has-text-weight-bold is-size-5"
				>
					{{ assistanceTarget }}
				</p>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>

		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t('Scoring') }}</h2>
				<p
					v-if="assistanceTarget"
					class="has-text-weight-bold is-size-5"
				>
					{{ assistanceScoringType }}
				</p>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>

		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t('Selected') }}</h2>
				<p
					v-if="beneficiariesCount || beneficiariesCount === 0"
					class="has-text-weight-bold is-size-5"
				>
					{{ beneficiariesCount }}
				</p>
				<Loading v-else type="bubbles" is-normal />
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
			return this.assistance?.scoringBlueprint?.name || this.$t("Default");
		},

		beneficiariesCount() {
			return this.statistics?.beneficiariesTotal || 0;
		},

		beneficiariesDeleted() {
			return this.statistics?.beneficiariesTotal || 0;
		},
	},
};
</script>
