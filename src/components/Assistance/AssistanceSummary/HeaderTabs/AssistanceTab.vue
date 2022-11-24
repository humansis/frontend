<template>
	<div class="level level-center">
		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t('Project') }}</h2>

				<div v-if="projectName" class="has-text-weight-bold is-size-5">{{ projectName }}</div>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>

		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t(admName) }}</h2>

				<div v-if="provinceName" class="has-text-weight-bold is-size-5">{{ provinceName }}</div>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>

		<div class="level-item has-text-centered">
			<div class="box">
				<h2 class="heading">{{ $t('Round') }}</h2>

				<div class="has-text-weight-bold is-size-5">{{ round }}</div>
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
	</div>
</template>

<script>
import Loading from "@/components/Loading";

export default {
	name: "AssistanceTab",

	components: {
		Loading,
	},

	props: {
		projectName: {
			type: String,
			required: true,
		},
		admName: {
			type: String,
			required: true,
		},
		provinceName: {
			type: String,
			required: true,
		},
	},

	computed: {
		round() {
			const isRoundNaN = Number.isNaN(parseInt(this.assistance?.round, 10));
			return isRoundNaN ? "N/A" : this.assistance.round;
		},

		dateDistribution() {
			return this.$moment(this.assistance?.dateDistribution).format("YYYY-MM-DD hh:mm") || "";
		},

		dateExpiration() {
			return this.$moment(this.assistance?.dateExpiration).format("YYYY-MM-DD hh:mm") || "";
		},
	},
};
</script>
