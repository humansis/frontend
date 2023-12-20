<template>
	<v-container fluid>
		<ProjectSummary @projectLoaded="onProjectLoaded" />

		<div class="d-flex mb-4">
			<h2 class="me-auto">{{ $t('Project Assistances') }}</h2>

			<v-btn
				class="text-none ml-0"
				color="primary"
				size="small"
				prepend-icon="plus"
				@click="goToAddAssistance"
			>
				{{ $t('New') }}
			</v-btn>
		</div>

		<Modal
			v-model="assistanceMoveModal.isOpened"
			:header="assistanceMoveModal.title"
		>
			<AssistanceMoveForm
				:projects="projects"
				@formClosed="closeAssistanceMoveModal"
				@formSubmitted="moveAssistance"
			/>
		</Modal>

		<Modal
			v-model="assistanceModal.isOpened"
			:header="assistanceModal.title"
		>
			<AssistanceForm
				:project="project"
				:formModel="assistanceModel"
				:assistance="assistance"
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
			@remove="removeAssistance"
			@showEdit="showEdit"
			@showMove="showMove"
		/>
	</v-container>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import ProjectService from "@/services/ProjectService";
import AssistanceForm from "@/components/Assistance/AssistanceForm";
import AssistanceMoveForm from "@/components/Assistance/AssistanceMoveForm";
import Modal from "@/components/Inputs/Modal";
import AssistancesList from "@/components/Projects/AssistancesList";
import ProjectSummary from "@/components/Projects/ProjectSummary";
import permissions from "@/mixins/permissions";
import { Notification } from "@/utils/UI";

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
				note: "",
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
			this.getListOfProjects();
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
					Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
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
						Notification(this.$t("Assistance Successfully Moved"), "success");
						this.$refs.assistancesList.fetchData();
					}

					if (response.status === 400) {
						Notification(`${this.$t("Cannot move the assistance")}: ${response.message}`
							|| `${this.$t("Error code 400")}`, "error");
					}
				}).catch((e) => {
					Notification(`${this.$t("Assistance")} ${e.message || e}`, "error");
				});
		},

		async editAssistance({ id, name, dateDistribution, dateExpiration, round, note, locationId }) {
			const formattedDateDistribution = dateDistribution
				? this.$moment(dateDistribution).format("YYYY-MM-DD")
				: null;

			const formattedDateExpiration = dateExpiration
				? this.$moment(dateExpiration).format("YYYY-MM-DD")
				: null;

			await AssistancesService.updateAssistance({
				id, name, formattedDateDistribution, formattedDateExpiration, round, note, locationId,
			})
				.then((response) => {
					if (response.status === 200) {
						Notification(this.$t("Assistance Successfully Updated"), "success");
						this.$refs.assistancesList.fetchData();
					}
				}).catch((e) => {
					Notification(`${this.$t("Assistance")} ${e.message || e}`, "error");
				});
		},

		async removeAssistance(id) {
			await AssistancesService.removeAssistance(id).then((response) => {
				if (response.status === 204) {
					Notification(this.$t("Assistance Successfully Deleted"), "success");
					this.$refs.assistancesList.fetchData();
				}
			}).catch((e) => {
				Notification(`${this.$t("Assistance")} ${e.message || e}`, "error");
			});
		},

		showEdit(assistance) {
			this.assistanceModel = this.mapToFormModel(assistance);
			this.assistance = assistance;
			this.assistanceModal = {
				isOpened: true,
				isEditing: true,
				title: "Edit Assistance",
			};
		},

		showMove(assistance) {
			this.assistance = assistance;
			this.assistanceMoveModal = {
				isOpened: true,
				title: `${this.$t("Move the Assistance")} ${assistance.name}`,
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
				sector,
				subsector,
				type,
				round,
				note,
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
				sector,
				subsector,
				type,
				id,
				commodity,
				commodityIds,
				name,
				projectId,
				note,
				round: {
					code: (round === "N/A" ? null : round),
					value: round,
				},
			};
		},
	},
};
</script>
