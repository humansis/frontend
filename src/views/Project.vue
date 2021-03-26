<template>
	<div>
		<ProjectSummary />

		<div class="level">
			<div class="level-left">
				<h2 class="title">Project Assistances</h2>
			</div>

			<div class="level-right">
				<b-button
					type="is-primary"
					icon-left="plus"
					@click="goToAddAssistance"
				>
					New
				</b-button>
			</div>
		</div>

		<Modal
			can-cancel
			is-small
			:header="assistanceModal.title"
			:active="assistanceModal.isOpened"
			@close="closeAssistanceModal"
		>
			<AssistanceForm
				close-button
				:formModel="assistanceModel"
				:editing="assistanceModal.isEditing"
				@formClosed="closeAssistanceModal"
				@formSubmitted="editAssistance"
			/>
		</Modal>

		<AssistancesList
			ref="assistancesList"
			@onRemove="removeAssistance"
			@onShowDetail="showDetail"
			@onShowEdit="showEdit"
		/>
	</div>
</template>

<script>
import ProjectSummary from "@/components/Projects/ProjectSummary";
import AssistancesList from "@/components/Projects/AssistancesList";
import AssistanceForm from "@/components/Assistance/AssistanceForm";
import Modal from "@/components/Modal";
import AssistancesService from "@/services/AssistancesService";
import { Toast, Notification } from "@/utils/UI";

export default {
	name: "ProjectDetail",

	components: {
		AssistanceForm,
		AssistancesList,
		ProjectSummary,
		Modal,
	},

	data() {
		return {
			assistanceModal: {
				isOpened: false,
				isEditing: false,
				title: "",
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

		goToAddAssistance() {
			this.$router.push({ name: "AddAssistance", params: { projectId: this.$route.params.projectId } });
		},

		async editAssistance({ id, dateDistribution }) {
			const date = this.$moment(dateDistribution).format("YYYY-MM-DD");
			await AssistancesService.updateAssistanceDateOfDistribution(id, date)
				.then((response) => {
					if (response.status === 200) {
						Toast("Assistance Successfully Updated", "is-success");
						this.$refs.assistancesList.fetchData();
					}
				}).catch((e) => {
					Notification(`Assistance ${e}`, "is-danger");
				});
		},

		async removeAssistance(id) {
			await AssistancesService.removeAssistance(id).then((response) => {
				if (response.status === 204) {
					Toast("Assistance Successfully Deleted", "is-success");
					this.$refs.assistancesList.fetchData();
				}
			}).catch((e) => {
				Notification(`Assistance ${e}`, "is-danger");
			});
		},

		showDetail(assistance) {
			this.assistanceModel = this.mapToFormModel(assistance);
			this.assistanceModal = {
				isOpened: true,
				isEditing: false,
				title: "Details Of This Assistance",
			};
		},

		showEdit(assistance) {
			this.assistanceModel = this.mapToFormModel(assistance);
			this.assistanceModal = {
				isOpened: true,
				isEditing: true,
				title: "Edit Assistance",
			};
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
