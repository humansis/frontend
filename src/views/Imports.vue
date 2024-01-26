<template>
	<v-container fluid>
		<Modal
			v-model="importModal.isOpened"
			:header="modalHeader"
		>
			<ImportForm
				:form-model="importModel"
				:submit-button-label="importModal.isEditing ? 'Update' : 'Create'"
				:form-disabled="importModal.isDetail"
				:is-editing="importModal.isEditing"
				:options="options"
				close-button
				@formSubmitted="onSubmitImportForm"
				@formClosed="importModal.isOpened = false"
			/>
		</Modal>

		<div :class="['d-flex mb-4 align-center', { 'import-header': isMobile }]">
			<h2 class="me-auto">{{ $t('Imports') }}</h2>

			<ExportControl
				:available-export-formats="exportControl.formats"
				:available-export-types="exportControl.types"
				:is-export-loading="exportControl.isLoading"
				:location="exportControl.location"
				class="export-template"
				@export="onDownloadTemplate"
			/>

			<v-btn
				color="primary"
				prepend-icon="plus"
				class="text-none ml-0"
				@click="onAddNewImport"
			>
				{{ $t('New Import') }}
			</v-btn>

			<v-btn
				color="primary"
				prepend-icon="question"
				class="text-none ml-2"
				href="https://docs.pinf.cz/x/RwBf"
				target="_blank"
				rel="noopener noreferrer"
			>
				{{ $t('Help') }}
			</v-btn>
		</div>

		<ImportsList
			ref="importList"
			@showDetail="onShowDetail"
			@showEdit="onShowEdit"
		/>
	</v-container>
</template>

<script>
import ImportService from "@/services/ImportService";
import ProjectService from "@/services/ProjectService";
import ImportForm from "@/components/Imports/ImportForm";
import ImportsList from "@/components/Imports/ImportsList";
import ExportControl from "@/components/Inputs/ExportControl";
import Modal from "@/components/Inputs/Modal";
import vuetifyHelper from "@/mixins/vuetifyHelper";
import { downloadFile } from "@/utils/helpers";
import { Notification } from "@/utils/UI";
import { EXPORT } from "@/consts";

export default {
	name: "Imports",

	components: {
		ImportsList,
		Modal,
		ImportForm,
		ExportControl,
	},

	mixins: [vuetifyHelper],

	data() {
		return {
			exportControl: {
				isLoading: false,
				location: "imports",
				types: [EXPORT.IMPORTS],
				formats: [EXPORT.FORMAT_XLSX, EXPORT.FORMAT_CSV, EXPORT.FORMAT_ODS],
			},
			importModal: {
				isOpened: false,
				isWaiting: false,
			},
			importModel: {
				id: null,
				title: null,
				projects: [],
				projectId: null,
				description: null,
			},
			options: {
				projects: [],
			},
		};
	},

	computed: {
		modalHeader() {
			if (this.importModal.isDetail) {
				return "Detail of Import";
			}

			if (this.importModal.isEditing) {
				return "Edit Import";
			}

			return "Create New Import";
		},
	},

	created() {
		const { query: { openModal = "" } } = this.$route || {};

		if (openModal === "1") {
			this.onAddNewImport();
		}

		this.fetchProjects();
	},

	methods: {
		onAddNewImport() {
			this.importModal = {
				isEditing: false,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};

			this.importModel = {
				...this.importModel,
				id: null,
				title: null,
				projects: null,
				projectId: null,
				description: null,
			};
		},

		onShowDetail(importItem) {
			this.mapToFormModel(importItem);
			this.importModal = {
				isOpened: true,
				isDetail: true,
				isWaiting: false,
				isEditing: false,
			};
		},

		onShowEdit(importItem) {
			this.importModal = {
				isEditing: true,
				isOpened: true,
				isDetail: false,
				isWaiting: false,
			};
			this.mapToFormModel(importItem);
		},

		mapToFormModel(
			{
				id,
				title,
				description,
				projects,
			},
		) {
			this.importModel = {
				...this.importModel,
				id,
				title,
				projects,
				description,
			};
		},

		onSubmitImportForm(importForm) {
			const {
				id,
				title,
				projects,
				description,
			} = importForm;

			const importBody = {
				id,
				title,
				projects: projects.map((item) => item.id),
				description,
			};

			if (this.importModal.isEditing && id) {
				this.updateImport(id, importBody);
			} else {
				this.createImport(importBody);
			}
		},

		async fetchProjects() {
			this.projectsLoading = true;

			await ProjectService.getListOfProjects()
				.then(({ data }) => {
					this.options.projects = data;
				})
				.catch((e) => {
					Notification(`${this.$t("Projects")} ${e.message || e}`, "error");
				});

			this.projectsLoading = false;
		},

		async createImport(importBody) {
			this.importModal.isWaiting = true;

			await ImportService.createImport(importBody).then(({ status, data }) => {
				if (status === 200) {
					Notification(this.$t("Import Successfully Created"), "success");
					this.$refs.importList.fetchData();

					this.$router.push({ name: "Import", params: { importId: data.id } });
				}
			}).catch((e) => {
				Notification(`${this.$t("Import")} ${e.message || e}`, "error");
				this.importModal.isWaiting = false;
			});
		},

		async updateImport(id, { title, projectId, description }) {
			this.importModal.isWaiting = true;

			await ImportService.changeImportState(id, { title, projectId, description })
				.then(({ status }) => {
					if (status === 202) {
						Notification(this.$t("Import Successfully Updated"), "success");
						this.$refs.importList.fetchData();
						this.importModal.isOpened = false;
					}
				}).catch((e) => {
					Notification(`${this.$t("Import")} ${e.message || e}`, "error");
					this.importModal.isWaiting = false;
				});
		},

		async onDownloadTemplate(exportType, format) {
			if (exportType === EXPORT.IMPORTS) {
				try {
					this.exportControl.isLoading = true;

					const { data, status, message } = await ImportService.exportTemplate(format);

					downloadFile(data, "import-template", status, format, message);
				} catch (e) {
					Notification(`${this.$t("Downloading Template")} ${e.message || e}`, "error");
				} finally {
					this.exportControl.isLoading = false;
				}
			}
		},
	},
};
</script>

<style lang="scss">
.import-header {
	flex-direction: column;
	gap: .75rem;
	align-items: center !important;

	> .export-template > div {
		margin: auto;
	}

	> button, a {
		margin-left: 1rem !important;
	}
}
</style>
