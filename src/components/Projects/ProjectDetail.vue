<template>
	<div>
		<ProjectSummary />
		<Modal
			can-cancel
			is-small
			header="Assistance Detail"
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
		<h2 class="title">Project Assistances</h2>
		<b-button
			class="mb-5"
			size="is-medium"
			type="is-danger"
			icon-left="plus"
			@click="goToAddAssistance"
		>
			New
		</b-button>
		<AssistancesList
			@onRemove="removeAssistance"
			@onPrint="printAssistance"
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

		async editAssistance(body) {
			await AssistancesService.updateAssistance(body.id, body)
				.then((response) => {
					if (response.status === 200) {
						Toast("Assistance Successfully Updated", "is-success");
						this.fetchData();
					}
				}).catch((e) => {
					Notification(`Assistance ${e}`, "is-danger");
				});
		},

		async removeAssistance(id) {
			await AssistancesService.removeAssistance(id).then((response) => {
				if (response.status === 204) {
					Toast("Assistance Successfully Deleted", "is-success");
					this.fetchData();
				}
			}).catch((e) => {
				Notification(`Assistance ${e}`, "is-danger");
			});
		},

		async printAssistance(id) {
			await AssistancesService.printAssistance(id).then((response) => {
				if (response.status === 200) {
					Toast("Download starting", "is-success");
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
			};
		},

		showEdit(assistance) {
			this.assistanceModel = this.mapToFormModel(assistance);
			this.assistanceModal = {
				isOpened: true,
				isEditing: true,
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
