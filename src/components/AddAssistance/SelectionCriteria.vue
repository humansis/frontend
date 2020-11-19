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
			can-cancel
			header="Create A New Criteria"
			:active.sync="criteriaModal.isOpened"
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

		<div class="mb-2">
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
					v-slot="props"
					label="Actions"
				>
					<ActionButton
						icon="trash"
						type="is-danger"
						@click.native="removeCriteria(props.index)"
					/>
				</b-table-column>
			</Table>
			<b-notification
				v-else
				type="is-light"
			>
				No data
			</b-notification>
		</div>
		<b-field label="Minimum Selection Score">
			<b-numberinput :value="0" />
		</b-field>
		<p>
			The system will only select beneficiaries/households that have a score higher
			than the minimum selection score
		</p>
	</div>
</template>

<script>
import Table from "@/components/DataGrid/Table";
import Modal from "@/components/Modal";
import SelectionCriteriaForm from "@/components/AddAssistance/SelectionCriteriaForm";
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

		removeCriteria(index) {
			this.table.data.splice(index, 1);
		},
	},
};
</script>
