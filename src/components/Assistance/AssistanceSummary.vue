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
		<nav class="level">
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">{{ $t('Province') }}</p>
					<p v-if="provinceName" class="has-text-weight-bold is-size-5">{{ provinceName }}</p>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">{{ $t('Beneficiaries') }}</p>
					<p v-if="beneficiaries" class="has-text-weight-bold is-size-5">{{
						beneficiariesCount }}
					</p>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">{{ $t('Date of Distribution') }}</p>
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
					<p class="heading">{{ $t('Project') }}</p>
					<p v-if="projectName" class="has-text-weight-bold is-size-5">{{ projectName }}</p>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>

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
				<div class="box commodity-item">
					<p class="heading">{{ $t('Commodity') }}</p>
					<p
						v-if="commodity"
						class="has-text-weight-bold is-size-5"
					>
						<SvgIcon :items="commodity" />
					</p>
					<Loading v-else type="bubbles" is-normal />
				</div>
			</div>
		</nav>
		<hr>
	</div>
</template>

<script>
import Loading from "@/components/Loading";
import LocationsService from "@/services/LocationsService";
import { normalizeText } from "@/utils/datagrid";
import SvgIcon from "@/components/SvgIcon";
import AssistancesService from "@/services/AssistancesService";

export default {
	name: "AssistanceSummary",

	components: {
		SvgIcon,
		Loading,
	},

	props: {
		beneficiaries: Number,
		assistance: Object,
		project: Object,
	},

	data() {
		return {
			province: null,
			commodity: null,
		};
	},

	async mounted() {
		await this.fetchLocation();
		await this.fetchCommodity();
	},

	computed: {
		assistanceName() {
			return this.assistance?.name || "";
		},

		assistanceTarget() {
			return normalizeText(this.assistance?.target);
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
			return this.assistance?.dateDistribution || "";
		},

		beneficiariesCount() {
			return this.beneficiaries || 0;
		},
	},

	methods: {
		async fetchLocation() {
			if (!this.assistance) return;
			await LocationsService.getDetailOfAdm1(
				this.assistance.adm1Id,
			).then(({ data }) => {
				this.province = data;
			});
		},

		async fetchCommodity() {
			if (!this.assistance) return;
			await AssistancesService.getCommodities(
				[this.assistance.id],
			).then(({ data }) => {
				this.commodity = data.map((item) => item.modalityType);
			});
		},
	},
};
</script>

<style scoped>
.box {
	height: 90px;
}
</style>
