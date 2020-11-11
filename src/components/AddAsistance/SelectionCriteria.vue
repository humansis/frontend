<template>
	<div class="mb-5">
		<h2 class="title space-between mb-0">
			Selection Criteria
			<b-button
				class="mb-5"
				type="is-success"
				icon-left="plus"
				@click="addCriteria"
			>
				Add
			</b-button>
		</h2>

		<Modal
			:active.sync="criteriaModal.isOpened"
			:can-cancel="true"
			header="Create A New Criteria"
			@close="closeCriteriaModal"
		>
			<SelectionCriteriaForm
				close-button
				submit-button-label="Create"
				:formModel="criteriaModel"
				@formSubmitted="submitCriteriaForm"
				@formClosed="closeCriteriaModal"
			/>
		</Modal>

		<div>
			<Table
				v-if="table.data.length"
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
					label="Actions"
				>
					<ActionButton icon="trash" type="is-danger" />
				</b-table-column>
			</Table>
			<b-notification
				v-else
				type="is-light"
			>
				No data
			</b-notification>
		</div>
	</div>
</template>

<script>
import Table from "@/components/Table";
import Modal from "@/components/Modal";
import SelectionCriteriaForm from "@/components/AddAsistance/SelectionCriteriaForm";
import ActionButton from "@/components/ActionButton";

export default {
	name: "SelectionCriteria",

	components: {
		Modal,
		SelectionCriteriaForm,
		Table,
		ActionButton,
	},

	data() {
		return {
			criteriaModal: {
				isOpened: false,
			},
			criteriaModel: {
				criteriaTarget: null,
				criteria: null,
				condition: null,
				value: null,
				scoreWeight: 1,
			},
			table: {
				data: [],
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

	updated() {
		// TODO Emit only if table data length > 0
		this.$emit("updatedData", this.table.data);
	},

	methods: {
		addCriteria() {
			this.criteriaModal.isOpened = true;

			this.criteriaModel = {
				criteriaTarget: null,
				criteria: null,
				condition: null,
				value: null,
				scoreWeight: 1,
			};
		},

		closeCriteriaModal() {
			this.criteriaModal.isOpened = false;
		},

		submitCriteriaForm(criteriaForm) {
			this.table.data.push(criteriaForm);
			this.criteriaModal.isOpened = false;
		},
	},
};
</script>
