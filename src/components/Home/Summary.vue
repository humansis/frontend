<template>
	<div class="mb-4">
		<h2 class="title">{{ $t('Summary') }}</h2>

		<div class="columns is-multiline" ref="summary">
			<div
				v-for="{ id, code, value, icon } in summary"
				class="column is-half"
				:ref="code"
				:key="id"
			>
				<div class="box">
					<article class="media is-align-items-center">
						<div class="media-left">
							<b-icon
								size="is-medium"
								type="is-primary"
								:icon="icon"
							/>
						</div>
						<div class="level">
							<div class="content">
								<p class="heading mb-0"> {{ $t(normalizeText(code)) }}</p>
								<p v-if="value || value === 0" class="subtitle is-4">{{ value }}</p>
								<Loading v-else type="bubbles" is-small class="subtitle" />
							</div>
						</div>
					</article>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Loading from "@/components/Loading";
import HomeService from "@/services/HomeService";
import { normalizeText } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "Summary",

	components: {
		Loading,
	},

	data() {
		return {
			summary: [],
			summaryCodes: [
				{
					code: "total_registrations",
					icon: "users",
				},
				{
					code: "active_projects",
					icon: "clipboard-list",
				},
				{
					code: "enrolled_beneficiaries",
					icon: "user-plus",
				},
				{
					code: "served_beneficiaries",
					icon: "user-check",
				},
				{
					code: "completed_assistances",
					icon: "clipboard-check",
				},
			],
		};
	},

	watch: {
		$route: "fetchData",
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		normalizeText(text) {
			return normalizeText(text);
		},

		async fetchData() {
			this.summaryCodes.forEach((item, index) => {
				this.summary.push({
					id: index,
					code: item.code,
					icon: item.icon,
					value: "",
				});

				HomeService.getSummariesForHomePage(item.code)
					.then((response) => {
						if (response.data[0]) {
							const summaryIndex = this.summary.findIndex(
								(summary) => summary.code === response.data[0].code,
							);

							this.summary[summaryIndex].value = response.data[0].value;
						}
					}).catch((e) => {
						if (e.message) Notification(`${this.$t("Summaries")} ${e}`, "is-danger");
					});
			});
		},
	},
};
</script>

<style scoped>
.columns {
	position: relative;
	min-height: 64px;
}
</style>
