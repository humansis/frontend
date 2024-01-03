<template>
	<Modal
		v-model="syncModal.isOpened"
		header="Detail of Sync"
	>
		<SyncForm
			:form-model="syncModel"
			:submit-button-label="syncModal.isEditing ? 'Update' : 'Create'"
			:form-disabled="syncModal.isDetail"
			close-button
			@formClosed="onCloseSyncModal"
		/>
	</Modal>

	<SyncList @showDetail="onShowDetail" />
</template>

<script>
import SyncForm from "@/components/AdministrativeSettings/Sync/Form";
import SyncList from "@/components/AdministrativeSettings/Sync/List";
import Modal from "@/components/Inputs/Modal";

export default {
	name: "SyncPage",

	components: {
		Modal,
		SyncForm,
		SyncList,
	},

	data() {
		return {
			syncModal: {
				isOpened: false,
				isEditing: false,
				isDetail: false,
				isWaiting: false,
			},
			syncModel: {
				rawData: "",
				violations: "",
			},
		};
	},

	methods: {
		onShowDetail(sync) {
			this.mapToFormModel(sync);
			this.syncModal = {
				isEditing: false,
				isOpened: true,
				isDetail: true,
				isWaiting: false,
			};
		},

		mapToFormModel(
			{
				rawData,
				violations,
			},
		) {
			this.syncModel = {
				...this.syncModel,
				rawData: this.parseJSON(rawData),
				violations: this.parseJSON(violations),
			};
		},

		parseJSON(json) {
			try {
				return JSON.parse(json);
			} catch (e) {
				return json;
			}
		},

		onCloseSyncModal() {
			this.syncModal.isOpened = false;
		},
	},
};
</script>
