<template>
	<v-expansion-panels v-model="openedGroups" class="mt-5 criteria-group">
		<v-expansion-panel :title="groupName">
			<v-expansion-panel-text>
				<DataGrid
					:headers="table.columns"
					:items="criteriaGroups"
					is-row-click-disabled
					is-footer-disabled
				>
					<template v-slot:actions="{ row }">
						<ButtonAction
							tooltip="Delete"
							icon="trash"
							icon-color="red"
							@actionConfirmed="remove(row.index)"
						/>
					</template>
				</DataGrid>

				<v-row>
					<v-col>
						<v-btn
							class="text-none"
							@click="addCriteria"
						>
							{{ $t('Add') }}
						</v-btn>
					</v-col>

					<v-col>
						<v-btn
							v-if="countOfCriteriaBeneficiaries"
							class="text-none"
						>
							{{ countOfCriteriaBeneficiaries }} {{ $t(targetType) }}
						</v-btn>
					</v-col>

					<v-col>
						<v-btn
							class="text-none"
							@click="removeGroup"
						>
							{{ $t('Remove') }}
						</v-btn>
					</v-col>
				</v-row>
			</v-expansion-panel-text>
		</v-expansion-panel>
	</v-expansion-panels>
</template>

<script>
import LocationsService from "@/services/LocationsService";
import ButtonAction from "@/components/ButtonAction";
import DataGrid from "@/components/DataGrid";
import { generateColumns } from "@/utils/datagrid";
import { Notification } from "@/utils/UI";

export default {
	name: "SelectionCriteriaGroup",

	components: {
		DataGrid,
		ButtonAction,
	},

	props: {
		groupId: Number,
		targetType: String,
		count: Number,

		data: {
			type: Array,
			default: () => [],
		},

		loading: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			table: {
				columns: generateColumns([
					{ key: "criteriaTarget", label: "Criteria Target", sortable: false },
					{ key: "criteria", label: "Criteria", sortable: false },
					{ key: "condition", label: "Condition", type: "textOrNone", sortable: false },
					{ key: "value", label: "Value", type: "customValue", sortable: false },
					{ key: "scoreWeight", label: "Score Weight", sortable: false },
					{ key: "actions", value: "actions", sortable: false },
				]),
			},
			criteriaLocation: "",
			openedGroups: [0],
		};
	},

	computed: {
		groupName() {
			return `${this.$t("Group")} ${(this.groupId + 1)}`;
		},

		countOfCriteriaBeneficiaries() {
			return this.count;
		},

		criteriaGroups() {
			const criteriaGroups = this.data.map((
				{ criteria, criteriaTarget, value, scoreWeight, condition },
			) => ({
				criteriaTarget: criteriaTarget?.value || criteriaTarget?.code,
				criteria: criteria?.value || criteria?.code,
				value: this.prepareCriteriaValue(value),
				scoreWeight,
				condition: condition?.code,
			}));

			return criteriaGroups || [];
		},
	},

	methods: {
		prepareCriteriaValue(value) {
			let newValue = value?.code || value;

			if (!value) {
				return value;
			}

			if (typeof newValue === "string" && newValue.indexOf("locationId-") > -1) {
				const locationId = Number(newValue.replace("locationId-", ""));
				this.fetchLocation(locationId);
				newValue = this.criteriaLocation;
			}

			return newValue;
		},

		async fetchLocation(id) {
			await LocationsService.getLocation(id)
				.then((data) => {
					this.criteriaLocation = data?.code;
				})
				.catch((e) => {
					if (e.message) Notification(`Location ${e}`, "is-danger");
				});
		},

		remove(index) {
			this.data.splice(index, 1);
			this.$emit("updatedCriteria", { groupKey: this.groupId });
		},

		addCriteria() {
			this.$emit("addCriteria", this.groupId);
		},

		removeGroup() {
			this.$emit("removeGroup");
		},

		showDetail() {
			if (this.countOfCriteriaBeneficiaries) {
				this.$emit("showDetail", this.data);
			}
		},
	},
};
</script>

<style lang="scss">
.criteria-group .v-expansion-panel-text__wrapper {
	padding: 0;

	.v-card {
		z-index: 999;
	}

	.v-row .v-col > button {
		width: 100%;
	}
}
</style>
