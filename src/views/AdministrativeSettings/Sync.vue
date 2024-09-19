<template>
	<v-container fluid>
		<Modal
			v-model="syncModal.isOpened"
			header="Detail of Sync"
		>
			<SyncForm
				:form-model="syncModel"
				:form-disabled="syncModal.isDetail"
				close-button
				@formClosed="onCloseSyncModal"
			/>
		</Modal>

		<Tabs :pre-selected-tab-value="ADMINISTRATIVE_SETTINGS.TABS_VALUE.SYNC" />

		<SyncList @showDetail="onShowDetail" />
	</v-container>
</template>

<script>
import SyncForm from "@/components/AdministrativeSettings/Sync/Form";
import SyncList from "@/components/AdministrativeSettings/Sync/List";
import Tabs from "@/components/AdministrativeSettings/Tabs";
import Modal from "@/components/Inputs/Modal";
import { ADMINISTRATIVE_SETTINGS } from "@/consts";

export default {
	name: "SyncPage",

	components: {
		Modal,
		SyncForm,
		SyncList,
		Tabs,
	},

	data() {
		return {
			ADMINISTRATIVE_SETTINGS,
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

		mapToFormModel({
			rawData,
			violations,
		}) {
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
