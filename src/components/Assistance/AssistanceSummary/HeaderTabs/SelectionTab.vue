<template>
	<nav class="level">
		<div class="level-item has-text-centered">
			<div class="box">
				<p class="heading">{{ $t('Target') }}</p>
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
				<p class="heading">{{ $t('Scoring') }}</p>
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
				<p class="heading">{{ $t('Selected') }}</p>
				<p
					v-if="beneficiariesCount || beneficiariesCount === 0"
					class="has-text-weight-bold is-size-5"
				>
					{{ beneficiariesCount - beneficiariesDeleted }}
				</p>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>
	</nav>
</template>

<script>
import Loading from "@/components/Loading";

export default {
	name: "SelectionTab",

	components: {
		Loading,
	},

	props: {
		assistanceTarget: {
			type: String,
			default: "",
			required: true,
		},
		assistanceScoringType: {
			type: String,
			default: "",
			required: true,
		},
		beneficiariesCount: {
			type: Number,
			default: 0,
			required: true,
		},
		beneficiariesDeleted: {
			type: Number,
			default: 0,
			required: true,
		},
	},
};
</script>
