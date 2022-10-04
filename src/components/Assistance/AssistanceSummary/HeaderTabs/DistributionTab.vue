<template>
	<nav class="level">
		<div class="level-item has-text-centered">
			<div class="box">
				<p class="heading">{{ $t('In assistance') }}</p>
				<p
					v-if="beneficiariesCount || beneficiariesCount === 0"
					class="has-text-weight-bold is-size-5"
				>
					{{ beneficiariesCount }}
				</p>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>

		<div
			v-if="assistanceType === consts.TYPE.DISTRIBUTION"
			class="level-item has-text-centered"
		>
			<div class="box commodity-item">
				<p class="heading">{{ $t('Commodity') }}</p>
				<p
					v-if="commodity.length"
					class="has-text-weight-bold is-size-5"
				>
					<b-tooltip
						v-if="commodity.length"
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
				</p>
				<Loading v-else type="bubbles" is-normal />
			</div>
		</div>
	</nav>
</template>

<script>
import SvgIcon from "@/components/SvgIcon";
import Loading from "@/components/Loading";
import consts from "@/utils/assistanceConst";

export default {
	name: "DistributionTab",

	components: {
		SvgIcon,
		Loading,
	},

	props: {
		assistanceType: {
			type: String,
			required: true,
		},
		assistanceRemote: {
			type: Boolean,
			required: true,
		},
		commodity: {
			type: Array,
			required: true,
		},
		beneficiariesCount: {
			type: Number,
			required: true,
		},
	},

	data() {
		return {
			consts,
		};
	},
};
</script>
