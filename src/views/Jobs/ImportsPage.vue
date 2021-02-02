<template>
	<div>
		<Modal
			can-cancel
			header="Detail of Import"
			:active="importModal.isOpened"
			@close="closeImportModal"
		>
			<ImportForm
				close-button
				class="modal-card"
				:formModel="importModel"
				:form-disabled="true"
				@formClosed="closeImportModal"
			/>
		</Modal>
		<ImportList
			@onShowDetail="showDetail"
		/>
	</div>
</template>

<script>
import ImportForm from "@/components/Jobs/ImportForm";
import ImportList from "@/components/Jobs/ImportList";
import Modal from "@/components/Modal";

export default {
	name: "ImportsPage",

	components: {
		ImportList,
		ImportForm,
		Modal,
	},

	data() {
		return {
			importModal: {
				isOpened: false,
			},
			importModel: {
				id: null,
				who: "",
				where: "",
				what: "",
				status: "",
			},
		};
	},

	methods: {
		closeImportModal() {
			this.importModal.isOpened = false;
		},

		showDetail(importEntity) {
			this.mapToFormModel(importEntity);
			this.importModal = {
				isOpened: true,
			};
		},

		mapToFormModel(
			{
				id,
				who,
				where,
				what,
				status,
			},
		) {
			this.importModel = {
				...this.importModel,
				id,
				who,
				where,
				what,
				status,
			};
		},
	},
};
</script>
