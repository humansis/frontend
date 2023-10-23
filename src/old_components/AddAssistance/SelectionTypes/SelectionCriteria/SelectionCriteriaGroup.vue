<template>
	<b-collapse class="card" animation="slide" aria-id="selectionCriteriaGroup">
		<template #trigger="props">
			<div
				class="card-header"
				role="button"
				aria-controls="selectionCriteriaGroup"
			>
				<p class="card-header-title">
					{{ groupName }}
				</p>
				<a class="card-header-icon">
					<b-icon :icon="props.open ? 'arrow-down' : 'arrow-up'" />
				</a>
			</div>
		</template>
		<div class="card-content">
			<div class="content">
				<Table
					:paginated="false"
					:data="criteriaGroups"
				>
					<template v-for="(column) in table.columns">
						<b-table-column
							sortable
							v-bind="column"
							:key="column.id"
							v-slot="props"
						>
							<ColumnField :data="props" :column="column" />
						</b-table-column>
					</template>
					<b-table-column
						v-slot="props"
						field="actions"
						:label="$t('Actions')"
					>
						<ActionButton
							icon="trash"
							type="is-danger"
							:tooltip="$t('Delete')"
							@click="remove(props.index)"
						/>
					</b-table-column>
				</Table>
			</div>
		</div>
		<footer class="card-footer">
			<a class="card-footer-item" @click="addCriteria">
				{{ $t('Add') }}
			</a>
			<a class="card-footer-item loading-ref" @click="showDetail">
				<b-loading
					v-model="loading"
					:is-full-page="false"
					:can-cancel="false"
				/>

				<span v-if="countOfCriteriaBeneficiaries">
					{{ countOfCriteriaBeneficiaries }} {{ $t(targetType) }}
				</span>
			</a>
			<a class="card-footer-item" @click="removeGroup">
				{{ $t('Remove') }}
			</a>
		</footer>
	</b-collapse>
</template>

<script>
import LocationsService from "@/services/LocationsService";
import ActionButton from "@/components/ActionButton";
import ColumnField from "@/components/DataGrid/ColumnField";
import Table from "@/components/DataGrid/Table";
import { Notification } from "@/utils/UI";

export default {
	name: "SelectionCriteriaGroup",

	components: {
		Table,
		ActionButton,
		ColumnField,
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
				columns: [
					{ field: "criteriaTarget", label: this.$t("Criteria Target") },
					{ field: "criteria", label: this.$t("Criteria") },
					{ field: "condition", label: this.$t("Condition"), type: "textOrNone" },
					{ field: "value", label: this.$t("Value"), type: "customValue" },
					{ field: "scoreWeight", label: this.$t("Score Weight") },
				],
			},
			criteriaLocation: "",
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
