<template>
	<div class="mb-5">
		<Modal
			can-cancel
			:active="detailModal.isOpened"
			@close="closeCriteriaGroupModal"
		>
			<CriteriaModalList
				close-button
				:criteria="criteriaGroupData"
			/>
		</Modal>
		<h2 class="title space-between mb-0">
			Selection Criteria
			<b-button
				class="mb-5"
				type="is-success"
				icon-left="plus"
				@click="addCriteria()"
			>
				Add Group
			</b-button>
		</h2>
		<Modal
			can-cancel
			is-small
			header="Create A New Criteria"
			:active.sync="criteriaModal.isOpened"
			@close="closeCriteriaModal"
		>
			<SelectionCriteriaForm
				close-button
				class="modal-card"
				ref="criteriaForm"
				submit-button-label="Create"
				:formModel="criteriaModel"
				@formSubmitted="submitCriteriaForm"
				@formClosed="closeCriteriaModal"
			/>
		</Modal>
		<div class="mb-2">
			<SelectionCriteriaGroup
				v-for="(group, key) of groups"
				:data="group.data"
				:key="key"
				:group-id="key"
				:target-type="targetType"
				@addCriteria="addCriteria"
				@removeGroup="removeCriteriaGroup(key)"
				@showDetail="showDetail"
			/>
			<b-notification
				v-if="!groups.length"
				type="is-light"
			>
				No data
			</b-notification>
		</div>
		<b-field label="Minimum Selection Score">
			<b-numberinput
				v-model="minimumSelectionScore"
				expanded
				controls-alignment="right"
				controls-position="compact"
			/>
		</b-field>

		<b-field>
			<b-button
				class="is-pulled-right"
				icon="detail"
				type="is-link"
				@click="showDetailWithAllCriteria"
			>
				Details
			</b-button>
		</b-field>

		<b-field>
			<p>
				The system will only select beneficiaries/households that have a score higher
				than the minimum selection score
			</p>
		</b-field>
	</div>
</template>

<script>
import Modal from "@/components/Modal";
import SelectionCriteriaForm from "@/components/AddAssistance/SelectionTypes/SelectionCriteria/SelectionCriteriaForm";
import SelectionCriteriaGroup from "@/components/AddAssistance/SelectionTypes/SelectionCriteria/SelectionCriteriaGroup";
import CriteriaModalList from "@/components/AddAssistance/SelectionTypes/SelectionCriteria/CriteriaModalList";

export default {
	name: "SelectionCriteriaPage",

	components: {
		CriteriaModalList,
		SelectionCriteriaGroup,
		Modal,
		SelectionCriteriaForm,
	},

	props: {
		targetType: String,
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
			groups: [],
			detailModal: {
				isOpened: false,
			},
			criteriaGroupData: [],
			minimumSelectionScore: 0,
		};
	},

	updated() {
		if (this.groups.length) {
			const criteria = [];

			this.groups.forEach(({ data }, index) => {
				data.forEach(({ condition, scoreWeight, value, criteriaTarget }) => {
					criteria.push({
						group: index,
						target: criteriaTarget?.code,
						field: criteria?.code,
						condition,
						value: value?.code || value,
						weight: scoreWeight,
					});
				});
			});

			this.$emit("updatedData", criteria, this.minimumSelectionScore);
		}
	},

	methods: {
		addCriteria(id) {
			this.criteriaModal.isOpened = true;

			this.criteriaModel = {
				criteriaTarget: null,
				criteria: null,
				condition: null,
				value: null,
				scoreWeight: 1,
				groupId: id,
			};
		},

		closeCriteriaModal() {
			this.criteriaModal.isOpened = false;
		},

		submitCriteriaForm(criteriaForm) {
			if (criteriaForm.groupId !== undefined) {
				this.groups[criteriaForm.groupId].data.push(criteriaForm);
			} else {
				const index = this.groups.push({ data: [] }) - 1;
				this.groups[index].data.push(criteriaForm);
			}
			this.criteriaModal.isOpened = false;
		},

		removeCriteriaGroup(key) {
			this.groups.splice(key, 1);
		},

		showDetail(criteriaGroups) {
			this.criteriaGroupData = criteriaGroups;
			this.detailModal.isOpened = true;
		},

		closeCriteriaGroupModal() {
			this.detailModal.isOpened = false;
		},

		showDetailWithAllCriteria() {
			this.showDetail(this.groups);
		},
	},
};
</script>
