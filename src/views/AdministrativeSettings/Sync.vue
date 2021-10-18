<template>
	<div>
		<Modal
			can-cancel
			:active="syncModal.isOpened"
			:header="modalHeader"
			:is-waiting="syncModal.isWaiting"
			@close="closeSyncModal"
		>
			<SyncForm
				close-button
				class="modal-card"
				:formModel="syncModel"
				:submit-button-label="syncModal.isEditing ? $t('Update') : $t('Create')"
				:form-disabled="syncModal.isDetail"
				@formClosed="closeSyncModal"
			/>
		</Modal>
		<SyncList @onShowDetail="showDetail" />
	</div>
</template>

<script>
import SyncList from "@/components/AdministrativeSettings/SyncList";
import SyncForm from "@/components/AdministrativeSettings/SyncForm";
import Modal from "@/components/Modal";

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
				who: "",
				what: "",
				rawData: "",
			},
		};
	},

	computed: {
		modalHeader() {
			return this.$t("Detail of Sync");
		},
	},

	methods: {
		showDetail(sync) {
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
				who,
				what,
				rawData,
			},
		) {
			this.syncModel = {
				...this.syncModel,
				who,
				what,
				rawData,
			};
		},

		closeSyncModal() {
			this.syncModal.isOpened = false;
		},
	},
};
</script>
