<template>
	<div>
		<ProjectSummary @projectLoaded="onProjectLoaded" />

		<div class="level">
			<div class="level-left">
				<h2 class="title">{{ $t('Project Assistances') }}</h2>
			</div>

			<div v-if="beneficiariesCount" class="level-right">
				<b-button
					v-if="userCan.addDistribution"
					type="is-primary"
					icon-left="plus"
					@click="goToAddAssistance"
				>
					{{ $t('New') }}
				</b-button>
			</div>
		</div>

		<Modal
			can-cancel
			:header="assistanceModal.title"
			:active="assistanceModal.isOpened"
			@close="closeAssistanceModal"
		>
			<AssistanceForm
				close-button
				class="modal-card"
				:project="project"
				:formModel="assistanceModel"
				:editing="assistanceModal.isEditing"
				@formClosed="closeAssistanceModal"
				@formSubmitted="editAssistance"
			/>
		</Modal>

		<AssistancesList
			ref="assistancesList"
			:beneficiaries-count="beneficiariesCount"
			:project="project"
			:project-loaded="projectLoaded"
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
import permissions from "@/mixins/permissions";

export default {
	name: "Project",

	components: {
		AssistanceForm,
		AssistancesList,
		ProjectSummary,
		Modal,
	},

	mixins: [permissions],

	data() {
		return {
			project: null,
			projectLoaded: false,
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
				dateExpiration: new Date(),
				allowedProductCategoryTypes: [],
				cashbackLimit: null,
				target: "",
				round: null,
			},
		};
	},

	computed: {
		beneficiariesCount() {
			return this.project?.numberOfHouseholds || 0;
		},
	},

	methods: {
		onProjectLoaded(project) {
			this.projectLoaded = true;
			this.project = project;
		},

		closeAssistanceModal() {
			this.assistanceModal.isOpened = false;
		},

		goToAddAssistance() {
			this.$router.push({ name: "AddAssistance", params: { projectId: this.$route.params.projectId } });
		},

		async editAssistance({ id, dateDistribution, dateExpiration, round }) {
			await AssistancesService.updateAssistanceDateOfDistribution(
				id, dateDistribution, dateExpiration, round,
			)
				.then((response) => {
					if (response.status === 200) {
						Toast(this.$t("Assistance Successfully Updated"), "is-success");
						this.$refs.assistancesList.fetchData();
					}
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Assistance")} ${e}`, "is-danger");
				});
		},

		async removeAssistance(id) {
			await AssistancesService.removeAssistance(id).then((response) => {
				if (response.status === 204) {
					Toast(this.$t("Assistance Successfully Deleted"), "is-success");
					this.$refs.assistancesList.fetchData();
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Assistance")} ${e}`, "is-danger");
			});
		},

		showDetail(assistance) {
			this.assistanceModel = this.mapToFormModel(assistance);
			this.assistanceModal = {
				isOpened: true,
				isEditing: false,
				title: this.$t("Details of This Assistance"),
			};
		},

		showEdit(assistance) {
			this.assistanceModel = this.mapToFormModel(assistance);
			this.assistanceModal = {
				isOpened: true,
				isEditing: true,
				title: this.$t("Edit Assistance"),
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
				dateExpiration,
				allowedProductCategoryTypes,
				cashbackLimit,
				name,
				projectId,
				target,
				type,
				round,
			},
		) {
			return {
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
				dateDistribution: new Date(dateDistribution),
				dateExpiration: !Number.isNaN(Date.parse(dateExpiration)) ? new Date(dateExpiration) : null,
				allowedProductCategoryTypes,
				cashbackLimit,
				target,
				id,
				commodityIds,
				name,
				projectId,
				type,
				round: {
					code: (round === "N/A" ? null : round),
					value: round,
				},
			};
		},
	},
};
</script>
