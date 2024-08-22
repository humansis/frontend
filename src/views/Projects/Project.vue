<template>
	<v-container fluid>
		<ProjectSummary @projectLoaded="onProjectLoaded" />

		<div class="d-flex mb-4">
			<h2 class="me-auto" data-cy="page-title-text">{{ $t('Project Assistances') }}</h2>

			<v-btn
				v-if="beneficiariesCount"
				:disabled="!isUserPermissionGranted(PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT_MANIPULATION)"
				color="primary"
				prepend-icon="plus"
				class="text-none ml-0"
				@click="onGoToAddAssistance"
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
				@formClosed="assistanceMoveModal.isOpened = false"
				@formSubmitted="onMoveAssistance"
			/>
		</Modal>

		<Modal
			v-model="assistanceModal.isOpened"
			:header="assistanceModal.title"
		>
			<AssistanceForm
				:required-permissions="PERMISSIONS.PROJECT_ASSISTANCE_MANAGEMENT_CORRECTIONS"
				:project="project"
				:form-model="assistanceModel"
				:assistance="assistance"
				:editing="assistanceModal.isEditing"
				@formClosed="assistanceModal.isOpened = false"
				@formSubmitted="onEditAssistance"
			/>
		</Modal>

		<AssistancesList
			ref="assistancesList"
			:beneficiaries-count="beneficiariesCount"
			:project="project"
			:project-loaded="projectLoaded"
			@remove="onRemoveAssistance"
			@showEdit="onShowEdit"
			@showMove="onShowMove"
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
import { checkResponseStatus } from "@/utils/fetcher";
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
				eloNumber: "",
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

		onGoToAddAssistance() {
			this.$router.push({
				name: "AddAssistance",
				params: { projectId: this.$route.params.projectId },
			});
		},

		async getListOfProjects() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await ProjectService.getListOfProjects({});

				checkResponseStatus(status, message);

				this.filterProjects(data);
			} catch (e) {
				Notification(`${this.$t("Projects")}: ${e.message || e}`, "error");
			}
		},

		async onMoveAssistance({ id }) {
			try {
				const {
					status,
					message,
				} = await AssistancesService.moveAssistance({
					assistanceId: this.assistance.id,
					originalProjectId: this.project.id,
					targetProjectId: id,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("Assistance Successfully Moved"), "success");
				await this.$refs.assistancesList.fetchData();
			} catch (e) {
				Notification(`${this.$t("Assistance")} ${e.message || e}`, "error");
			}
		},

		async onEditAssistance(
			{
				id,
				name,
				dateDistribution,
				dateExpiration,
				round,
				eloNumber,
				note,
				locationId,
			},
		) {
			const formattedDateDistribution = dateDistribution
				? this.$moment(dateDistribution).format("YYYY-MM-DD")
				: null;
			const formattedDateExpiration = dateExpiration
				? this.$moment(dateExpiration).format("YYYY-MM-DD")
				: null;

			const assistanceBody = {
				name,
				round,
				note: note?.length ? note : null,
				locationId,
				eloNumber: eloNumber?.length ? eloNumber : null,
				...(formattedDateDistribution && { dateDistribution: formattedDateDistribution }),
				...(formattedDateExpiration && { dateExpiration: formattedDateExpiration }),
			};

			try {
				const {
					status,
					message,
				} = await AssistancesService.updateAssistance({
					id, assistanceBody,
				});

				checkResponseStatus(status, message);

				Notification(this.$t("Assistance Successfully Updated"), "success");
				await this.$refs.assistancesList.fetchData();
			} catch (e) {
				Notification(`${this.$t("Assistance")}: ${e.message || e}`, "error");
			}
		},

		async onRemoveAssistance(id) {
			try {
				const {
					status,
					message,
				} = await AssistancesService.removeAssistance(id);

				checkResponseStatus(status, message, 204);

				Notification(this.$t("Assistance Successfully Deleted"), "success");
				await this.$refs.assistancesList.fetchData();
			} catch (e) {
				Notification(`${this.$t("Assistance")}: ${e.message || e}`, "error");
			}
		},

		onShowEdit(assistance) {
			this.assistanceModel = this.mapToFormModel(assistance);
			this.assistance = assistance;
			this.assistanceModal = {
				isOpened: true,
				isEditing: true,
				title: "Edit Assistance",
			};
		},

		onShowMove(assistance) {
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
				eloNumber,
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
				eloNumber,
				round: {
					code: (round === this.$t("N/A") ? null : round),
					value: round,
				},
			};
		},
	},
};
</script>
