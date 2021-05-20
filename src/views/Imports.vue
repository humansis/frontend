<template>
	<div>
		<div class="level">
			<div class="level-left">
				<h1 class="title">{{ $t('Imports') }}</h1>
			</div>

			<div class="level-right">
				<b-button
					type="is-primary"
					icon-left="plus"
					@click="addNewImport"
				>
					{{ $t('New') }}
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
				:submit-button-label="$t('Create')"
				:form-disabled="importModal.isDetail"
				@formSubmitted="submitImportForm"
				@formClosed="closeImportModal"
			/>
		</Modal>

		<ImportsList
			ref="importList"
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import ImportForm from "@/components/Imports/ImportForm";
import Modal from "@/components/Modal";
import ImportService from "@/services/ImportService";
import { Toast, Notification } from "@/utils/UI.js";
import ImportsList from "@/components/Imports/ImportsList";

export default {
	name: "Imports",

	components: {
		ImportsList,
		Modal,
		ImportForm,
	},

	data() {
		return {
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
		};
	},

	computed: {
		modalHeader() {
			return this.importModal
				.isDetail ? this.$t("Import Detail") : this.$t("Create New Import");
		},
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

		mapToFormModel(
			{
				id,
				title,
				project,
				projectId,
				description,
			},
		) {
			this.importModel = {
				...this.importModel,
				id,
				title,
				project,
				projectId,
				description,
			};
		},

		submitImportForm(importForm) {
			console.log(importForm);
			const {
				title,
				project,
				description,
			} = importForm;

			const projectBody = {
				title,
				projectId: project?.id,
				description,
			};

			this.createImport(projectBody);
		},

		async createImport(importBody) {
			this.importModal.isWaiting = true;

			await ImportService.createImport(importBody).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Import Successfully Created"), "is-success");
					this.$refs.importList.fetchData();
					this.closeImportModal();
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Import")} ${e}`, "is-danger");
				this.importModal.isWaiting = false;
			});
		},
	},
};
</script>
