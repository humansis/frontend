<template>
	<div v-if="projectSummary" ref="projectSummary">
		<h1 class="title has-text-centered">{{ projectSummary.name }}</h1>

		<nav class="level">
			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">{{ $t('Sectors') }}</p>
					<span>
						<svg-icon
							v-if="projectSummary.sectors.length"
							:items="projectSummary.sectors"
						/>
						<p v-else class="has-text-weight-bold is-size-5">
							{{ $t("None") }}
						</p>
					</span>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">{{ $t('Start Date') }}</p>
					<p class="has-text-weight-bold is-size-5">
						{{ $moment(projectSummary.startDate).format("YYYY-MM-DD hh:mm") }}
					</p>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">{{ $t('End Date') }}</p>
					<p class="has-text-weight-bold is-size-5">
						{{ $moment(projectSummary.endDate).format("YYYY-MM-DD hh:mm") }}
					</p>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">{{ $t('Number of Households') }}</p>
					<p class="has-text-weight-bold is-size-5">{{ projectSummary.numberOfHouseholds }}</p>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">{{ $t('Donors') }}</p>
					<p class="has-text-weight-bold is-size-5">{{ projectSummary.donorIds.length }}</p>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading">{{ $t('Total target beneficiaries') }}</p>
					<p class="has-text-weight-bold is-size-5">{{ projectSummary.target }}</p>
				</div>
			</div>

			<div class="level-item has-text-centered">
				<div class="box">
					<p class="heading"> {{ $t('Beneficiaries Reached') }}</p>
					<p class="has-text-weight-bold is-size-5">{{ projectSummary.target }}</p>
				</div>
			</div>
		</nav>
		<hr>
	</div>
</template>

<script>
import ProjectService from "@/services/ProjectService";
import { Notification } from "@/utils/UI";
import SvgIcon from "@/components/SvgIcon";
import { normalizeText } from "@/utils/datagrid";

export default {
	name: "ProjectSummary",

	components: { SvgIcon },

	data() {
		return {
			projectSummary: null,
		};
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		async fetchData() {
			await ProjectService.getDetailOfProject(
				this.$route.params.projectId,
			).then(({ data }) => {
				console.log(data.sectors.map((sector) => normalizeText(sector)));
				this.projectSummary = data;
			}).catch((e) => {
				Notification(`${this.$t("Detail of Project")} ${e}`, "is-danger");
			});
		},

		normalizeText(value) {
			return normalizeText(value);
		},
	},
};
</script>

<style scoped>
.box {
	height: 90px;
}
</style>
