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
		<SyncList @showDetail="showDetail" />
	</div>
</template>

<script>
import SyncForm from "@/components/AdministrativeSettings/SyncForm";
import SyncList from "@/components/AdministrativeSettings/SyncList";
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
				rawData: "",
				violations: "",
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

		closeSyncModal() {
			this.syncModal.isOpened = false;
		},
	},
};
</script>
