<template>
	<div>
		<b-collapse class="card" animation="slide" aria-id="selectionCriteriaGroup">
			<div
				slot="trigger"
				slot-scope="props"
				class="card-header"
				role="button"
				aria-controls="selectionCriteriaGroup"
			>
				<p class="card-header-title">
					{{ groupName }}
				</p>
				<a class="card-header-icon">
					<b-icon
						:icon="props.open ? 'arrow-down' : 'arrow-up'"
					/>
				</a>
			</div>
			<div class="card-content">
				<div class="content">
					<Table
						:paginated="false"
						:data="table.data"
					>
						<template v-for="(column, key) in table.columns">
							<b-table-column
								v-bind="column"
								:key="key"
							>
								<template v-slot="props">
									<div v-if="column.field === 'donorIds'">
										{{ props.row[column.field].length }}
									</div>
									<div v-else>
										{{ props.row[column.field] }}
									</div>
								</template>
							</b-table-column>
						</template>

						<b-table-column
							v-slot="props"
							label="Actions"
						>
							<ActionButton
								icon="trash"
								type="is-danger"
								@click.native="remove(props.index)"
							/>
						</b-table-column>
					</Table>
				</div>
			</div>
			<footer class="card-footer">
				<a
					class="card-footer-item"
					@click="addCriteria"
				>
					Add
				</a>
				<div class="card-footer-item" />
				<a
					class="card-footer-item"
					@click="removeGroup"
				>
					Remove
				</a>
			</footer>
		</b-collapse>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import ActionButton from "@/components/ActionButton";

export default {
	name: "SelectionCriteriaGroup",

	components: {
		Table,
		ActionButton,
	},

	props: {
		data: Array,
		groupName: String,
		groupId: Number,
	},

	data() {
		return {
			table: {
				data: this.data,
				columns: [
					{
						field: "criteriaTarget",
						label: "Criteria Target",
					},
					{
						field: "criteria",
						label: "Criteria",
					},
					{
						field: "condition",
						label: "Condition",
					},
					{
						field: "value",
						label: "Value",
					},
					{
						field: "scoreWeight",
						label: "Score Weight",
					},
					{
						field: "action",
						label: "Action",
					},
				],
			},
		};
	},

	methods: {
		remove(index) {
			this.table.data.splice(index, 1);
		},

		addCriteria() {
			this.$emit("addCriteria", this.groupId);
		},

		removeGroup() {
			this.$emit("removeGroup", this.groupId);
		},
	},
};
</script>

<style scoped>

</style>
