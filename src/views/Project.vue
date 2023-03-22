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

		<Modal
			can-cancel
			:header="assistanceMoveModal.title"
			:active="assistanceMoveModal.isOpened"
			@close="closeAssistanceMoveModal"
		>
			<AssistanceMoveForm
				close-button
				class="modal-card"
				:projects="projects"
				@formClosed="closeAssistanceMoveModal"
				@formSubmitted="moveAssistance"
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
			@onShowMove="showMove"
		/>
	</div>
</template>

<script>
import ProjectSummary from "@/components/Projects/ProjectSummary";
import AssistancesList from "@/components/Projects/AssistancesList";
import AssistanceForm from "@/components/Assistance/AssistanceForm";
import AssistanceMoveForm from "@/components/Assistance/AssistanceMoveForm";
import Modal from "@/components/Modal";
import AssistancesService from "@/services/AssistancesService";
import { Toast, Notification } from "@/utils/UI";
import permissions from "@/mixins/permissions";
import ProjectService from "@/services/ProjectService";

export default {
	name: "Project",

	components: {
		AssistanceForm,
		AssistanceMoveForm,
		AssistancesList,
		ProjectSummary,
		Modal,
	},

	mixins: [permissions],

	data() {
		return {
			project: null,
			projects: [],
			assistance: {},
			projectLoaded: false,
			assistanceModal: {
				isOpened: false,
				isEditing: false,
				title: "",
			},
			assistanceMoveModal: {
				isOpened: false,
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

	created() {
		this.getListOfProjects();
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

		closeAssistanceMoveModal() {
			this.assistanceMoveModal.isOpened = false;
		},

		goToAddAssistance() {
			this.$router.push({
				name: "AddAssistance",
				params: { projectId: this.$route.params.projectId },
			});
		},

		async getListOfProjects() {
			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.filterProjects(data);
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Projectssfsafs")} ${e}`, "is-danger");
				});
		},

		async moveAssistance({ id }) {
			await AssistancesService.moveAssistance(
				this.assistance.id,
				this.project.id,
				id,
			)
				.then((response) => {
					if (response.status === 202) {
						Toast(this.$t("Assistance Successfully Moved"), "is-success");
					}

					if (response.status === 400) {
						Notification(response.message
							|| `${this.$t("Error code 400")}`, "is-warning");
					}
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Assistance")} ${e}`, "is-danger");
				});
		},

		async editAssistance({ id, name, dateDistribution, dateExpiration, round }) {
			const formattedDateDistribution = this.$moment(dateDistribution).format("YYYY-MM-DD");
			const formattedDateExpiration = dateExpiration
				? this.$moment(dateExpiration).format("YYYY-MM-DD")
				: null;

			await AssistancesService.updateAssistance({
				id, name, formattedDateDistribution, formattedDateExpiration, round,
			})
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

		showMove(assistance) {
			this.assistance = assistance;
			this.assistanceMoveModal = {
				isOpened: true,
				title: this.$t("Move the Assistance"),
			};
		},

		filterProjects(data) {
			this.projects = data.filter((obj) => obj.id !== this.project?.id
				&& this.$moment(obj.endDate).format("YYYY-MM-DD")
				>= this.$moment(new Date()).format("YYYY-MM-DD"));
		},

		mapToFormModel(
			{
				adm1,
				adm2,
				adm3,
				adm4,
				id,
				commodity,
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
				adm1,
				adm2,
				adm3,
				adm4,
				dateDistribution: new Date(dateDistribution),
				dateExpiration: !Number.isNaN(Date.parse(dateExpiration)) ? new Date(dateExpiration) : null,
				allowedProductCategoryTypes,
				cashbackLimit,
				target,
				id,
				commodity,
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
