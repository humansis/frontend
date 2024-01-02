<template>
	<v-row
		class="mt-2 mb-6 justify-center"
		no-gutters
	>
		<v-col class="ma-2">
			<v-sheet class="pa-1 text-center elevation-1 rounded-lg box">
				<p class="text-overline">{{ $t('Target')}}</p>

				<div
					v-if="assistanceTarget"
					class="font-weight-bold pa-2 text-subtitle-1"
				>
					{{ assistanceTarget }}
				</div>

				<v-progress-circular
					v-else-if="isAssistanceLoading"
					:size="25"
					:indeterminate="isAssistanceLoading"
					color="primary"
				/>

				<v-tooltip
					v-else
					:text="$t('Data not loaded')"
					location="top"
				>
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" icon="circle-exclamation" size="x-large" />
					</template>
				</v-tooltip>
			</v-sheet>
		</v-col>

		<v-col class="ma-2">
			<v-sheet class="pa-1 text-center elevation-1 rounded-lg box">
				<p class="text-overline">{{ $t('Scoring')}}</p>

				<div
					v-if="assistanceTarget && assistanceScoringType"
					class="font-weight-bold pa-2 text-subtitle-1"
				>
					{{ assistanceScoringType }}
				</div>

				<v-progress-circular
					v-else-if="isAssistanceLoading"
					:size="25"
					:indeterminate="isAssistanceLoading"
					color="primary"
				/>

				<div v-else class="pa-2 text-subtitle-1">
					{{ $t("N/A") }}
				</div>
			</v-sheet>
		</v-col>

		<v-col class="ma-2">
			<v-sheet class="pa-1 text-center elevation-1 rounded-lg box">
				<p class="text-overline">{{ $t('Selected')}}</p>

				<div
					v-if="beneficiariesCount || beneficiariesCount === 0"
					class="font-weight-bold pa-2 text-subtitle-1"
				>
					{{ beneficiariesCount }}
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
						<v-icon v-bind="props" icon="circle-exclamation" size="x-large" />
					</template>
				</v-tooltip>
			</v-sheet>
		</v-col>

	</v-row>
</template>

<script>
import { normalizeText } from "@/utils/datagrid";

export default {
	name: "SelectionTab",

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
	},
};
</script>
