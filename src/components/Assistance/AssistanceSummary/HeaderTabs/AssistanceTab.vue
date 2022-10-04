<template>
	<div class="level">
		<div class="level-item has-text-centered">
			<div class="box">
				<p class="heading">{{ $t('Project') }}</p>
				<p v-if="projectName" class="has-text-weight-bold is-size-5">{{ projectName }}</p>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>

		<div class="level-item has-text-centered">
			<div class="box">
				<p class="heading">{{ $t(admName) }}</p>
				<p v-if="provinceName" class="has-text-weight-bold is-size-5">{{ provinceName }}</p>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>

		<div class="level-item has-text-centered">
			<div class="box">
				<p class="heading">{{ $t('Round') }}</p>
				<p class="has-text-weight-bold is-size-5">{{ round }}</p>
			</div>
		</div>

		<div class="level-item has-text-centered">
			<div class="box">
				<p class="heading">{{ $t('Date of Assistance') }}</p>
				<p
					v-if="dateDistribution"
					class="has-text-weight-bold is-size-5"
				>
					{{ dateDistribution }}
				</p>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>

		<div class="level-item has-text-centered">
			<div class="box">
				<p class="heading">{{ $t('Expiration Date') }}</p>
				<p
					v-if="dateExpiration"
					class="has-text-weight-bold is-size-5"
				>
					{{ dateExpiration }}
				</p>
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
		round: {
			type: String,
			required: true,
		},
		dateDistribution: {
			type: String,
			required: true,
		},
		dateExpiration: {
			type: String,
			required: true,
		},
	},
};
</script>
