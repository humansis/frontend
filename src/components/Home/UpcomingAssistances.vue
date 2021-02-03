<template>
	<div>
		<Modal
			can-cancel
			header="Assistance Detail"
			:active="assistanceModal.isOpened"
			@close="closeAssistanceModal"
		>
			<AssistanceForm
				close-button
				:formModel="assistanceModel"
				@formClosed="closeAssistanceModal"
			/>
		</Modal>
		<h2 class="title">Upcoming Assistances</h2>
		<AssistancesList
			upcoming
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import Modal from "@/components/Modal";
import AssistanceForm from "@/components/Assistance/AssistanceForm";
import grid from "@/mixins/grid";
import AssistancesList from "@/components/Projects/AssistancesList";

export default {
	name: "UpcomingAssistances",

	components: {
		AssistancesList,
		AssistanceForm,
		Modal,
	},

	mixins: [grid],

	data() {
		return {
			assistanceModal: {
				isOpened: false,
			},
			assistanceModel: {
				adm1: [],
				adm2: [],
				adm3: [],
				adm4: [],
				dateDistribution: new Date(),
				target: "",
			},
		};
	},

	methods: {
		closeAssistanceModal() {
			this.assistanceModal.isOpened = false;
		},

		showDetail(model) {
			this.assistanceModel = this.mapToFormModel(model);
			this.assistanceModal.isOpened = true;
		},

		mapToFormModel(
			{
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
				id,
				commodityIds,
				dateDistribution,
				name,
				projectId,
				target,
				type,
			},
		) {
			return {
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
				dateDistribution: new Date(dateDistribution),
				target,
				id,
				commodityIds,
				name,
				projectId,
				type,
			};
		},
	},
};
</script>
