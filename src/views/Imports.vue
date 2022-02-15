<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">{{ $t('Imports') }}</h1>
			</div>

			<div class="level-right">
				<ExportButton
					class="mr-3"
					space-between
					type="is-primary"
					label="Download Template"
					:loading="exportLoading"
					:formats="{ xlsx: true, csv: true, ods: true}"
					@onExport="downloadTemplate"
				/>
				<b-button
					class="mr-3"
					type="is-primary"
					icon-left="plus"
					@click="addNewImport"
				>
					{{ $t('New') }}
				</b-button>
				<b-button
					tag="a"
					type="is-primary"
					icon-left="question"
					href="https://docs.humansis.org/display/HD/Imports"
					target="_blank"
				>
					{{ $t('Help') }}
				</b-button>
			</div>
		</div>

		<Modal
			can-cancel
			:active="importModal.isOpened"
			:header="modalHeader"
			:is-waiting="importModal.isWaiting"
			@close="closeImportModal"
		>
			<ImportForm
				close-button
				class="modal-card"
				:formModel="importModel"
				:submit-button-label="importModal.isEditing ? $t('Update') : $t('Create')"
				:form-disabled="importModal.isDetail"
				:is-editing="importModal.isEditing"
				:options="options"
				@formSubmitted="submitImportForm"
				@formClosed="closeImportModal"
			/>
		</Modal>

		<ImportsList
			ref="importList"
			@onShowDetail="showDetail"
			@onShowEdit="showEdit"
		/>
	</div>
</template>

<script>
import ImportForm from "@/components/Imports/ImportForm";
import Modal from "@/components/Modal";
import ImportService from "@/services/ImportService";
import { Toast, Notification } from "@/utils/UI.js";
import ImportsList from "@/components/Imports/ImportsList";
import ExportButton from "@/components/ExportButton";
import ProjectService from "@/services/ProjectService";

export default {
	name: "Imports",

	components: {
		ImportsList,
		Modal,
		ImportForm,
		ExportButton,
	},

	data() {
		return {
			exportLoading: false,
			importModal: {
				isOpened: false,
				isWaiting: false,
			},
			importModel: {
				id: null,
				title: null,
				project: null,
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
			let result = "";
			if (this.importModal.isDetail) {
				result = this.$t("Detail of Import");
			} else if (this.importModal.isEditing) {
				result = this.$t("Edit Import");
			} else {
				result = this.$t("Create New Import");
			}
			return result;
		},
	},

	created() {
		const { query: { openModal = "" } } = this.$route || {};

		if (openModal === "1") {
			this.addNewImport();
		}

		this.fetchProjects();
	},

	methods: {
		addNewImport() {
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
				project: null,
				projectId: null,
				description: null,
			};
		},

		closeImportModal() {
			this.importModal.isOpened = false;
		},

		showDetail(importItem) {
			this.mapToFormModel(importItem);
			this.importModal = {
				isOpened: true,
				isDetail: true,
				isWaiting: false,
				isEditing: false,
			};
		},

		showEdit(importItem) {
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
				projectId,
			},
		) {
			this.importModel = {
				...this.importModel,
				id,
				title,
				project: this.options.projects.find((item) => item.id === projectId),
				description,
			};
		},

		submitImportForm(importForm) {
			const {
				id,
				title,
				project,
				description,
			} = importForm;

			const importBody = {
				id,
				title,
				projectId: project?.id,
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
					if (e.message) Notification(`${this.$t("Projects")} ${e}`, "is-danger");
				});

			this.projectsLoading = false;
		},

		async createImport(importBody) {
			this.importModal.isWaiting = true;

			await ImportService.createImport(importBody).then(({ status, data }) => {
				if (status === 200) {
					Toast(this.$t("Import Successfully Created"), "is-success");
					this.$refs.importList.fetchData();
					this.closeImportModal();

					this.$router.push({ name: "Import", params: { importId: data.id } });
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Import")} ${e}`, "is-danger");
				this.importModal.isWaiting = false;
			});
		},

		async updateImport(id, { title, projectId, description }) {
			this.importModal.isWaiting = true;

			await ImportService.changeImportState(id, { title, projectId, description })
				.then(({ status }) => {
					if (status === 202) {
						Toast(this.$t("Import Successfully Updated"), "is-success");
						this.$refs.importList.fetchData();

						this.closeImportModal();
					}
				}).catch((e) => {
					if (e.message) Notification(`${this.$t("Import")} ${e}`, "is-danger");
					this.importModal.isWaiting = false;
				});
		},

		async downloadTemplate(format) {
			this.exportLoading = true;
			await ImportService.exportTemplate(format)
				.then(({ data }) => {
					const blob = new Blob([data], { type: data.type });
					const link = document.createElement("a");
					link.href = window.URL.createObjectURL(blob);
					link.download = `import-template.${format}`;
					link.click();
				})
				.catch((e) => {
					if (e.message) {
						Notification(`${this.$t("Downloading Template")} ${e}`, "is-danger");
					}
				});
			this.exportLoading = false;
		},
	},
};
</script>
