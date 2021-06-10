<template>
	<div>
		<div>
			<h1 class="title has-text-centered">{{ $t('Transactions') }}</h1>
			<b-tabs v-model="selectedTab" @input="nextTab">
				<b-tab-item icon="hand-holding-water" :label="$t('Assistances')">
					<Distributions v-if="tabs[0]" />
				</b-tab-item>

				<b-tab-item icon="shopping-cart" :label="$t('Purchases')">
					<Purchases v-if="tabs[1]" />
				</b-tab-item>
				<!--
				<b-tab-item icon="balance-scale" :label="$t('Balances')">
					<Balances v-if="tabs[2]" />
				</b-tab-item>
				-->
			</b-tabs>
		</div>
	</div>
</template>

<script>
import Distributions from "@/components/Transactions/Distributions";
import Purchases from "@/components/Transactions/Purchases";

export default {
	name: "TransactionsPage",

	components: {
		Purchases,
		Distributions,
	},

	data() {
		return {
			selectedTab: 0,
			tabs: {
				0: false,
				1: false,
				2: false,
			},
		};
	},

	created() {
		this.selectedTab = this.$route.query?.tab === "purchases" ? 1 : 0;
		this.tabs[this.selectedTab] = true;
	},

	methods: {
		nextTab(data) {
			const tabName = data === 0 ? "distributions" : "purchases";
			this.$router.replace({ name: "Transactions", query: { tab: tabName } });

			this.tabs[data] = true;
		},
	},
};
</script>
