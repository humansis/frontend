<template>
	<h2 class="mb-4">{{ $t('Summary') }}</h2>

	<v-row>
		<v-col
			v-for="{
				id, code, value, icon,
			} in summary"
			:ref="code"
			:key="id"
			cols="6"
		>
			<v-card
				:loading="!(value || value === 0)"
				min-height="76"
			>
				<template v-slot:prepend>
					<v-icon :icon="icon" color="primary" class="pb-2" />
				</template>

				<template v-slot:item>
					<v-card-subtitle class="pt-1 pb-0">{{ $t(normalizeText(code)) }}</v-card-subtitle>
					<v-card-title>{{ value ?? "&nbsp;" }}</v-card-title>
				</template>
			</v-card>
		</v-col>
	</v-row>
</template>

<script>
import HomeService from "@/services/HomeService";
import { normalizeText } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "HomeSummary",

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

	mounted() {
		this.fetchData();
	},

	methods: {
		normalizeText(text) {
			return normalizeText(text);
		},

		async fetchData() {
			await Promise.all(this.summaryCodes.map(async (item, index) => {
				this.summary.push({
					id: index,
					code: item.code,
					icon: item.icon,
					value: "",
				});

				try {
					const {
						data: { data },
						status,
						message,
					} = await HomeService.getSummariesForHomePage(item.code);

					checkResponseStatus(status, message);

					if (data[0]) {
						const summaryIndex = this.summary.findIndex(
							(summary) => summary.code === data[0].code,
						);

						this.summary[summaryIndex].value = data[0].value;
					}
				} catch (e) {
					Notification(`${this.$t("Summaries")}: ${e.message || e}`, "error");
				}
			}));
		},
	},
};
</script>
