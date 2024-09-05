<template>
	<Modal
		v-model="isModalOpened"
		:header="modalTitle"
	>
		<v-card-text>
			<DataTextarea
				v-model.trim="justification"
				:error-messages="validationMsg('justification')"
				:label="approvalSystemData.justificationLabel"
				name="justification"
				@blur="onValidate('justification')"
			/>

			<p
				v-if="approvalSystemData.warningMessage.length"
				class="text-caption text-error my-3 ml-4"
			>
				{{ $t(approvalSystemData.warningMessage) }}
			</p>

			<ConfirmAction
				:is-dialog-opened="isConfirmMenuOpen"
				:confirm-message="getConfirmMessage"
				:confirm-title="getConfirmTitle"
				prepend-icon="circle-exclamation"
				prepend-icon-color="info"
				close-button-name="Cancel"
				confirm-button-name="Set"
				confirm-button-color="primary"
				@modalClosed="isConfirmMenuOpen = false"
				@actionConfirmed="onActionConfirmed"
			/>
		</v-card-text>

		<v-card-actions>
			<v-spacer />

			<v-btn
				class="text-none"
				color="blue-grey-lighten-4"
				variant="elevated"
				@click="isModalOpened = false"
			>
				{{ $t('Close') }}
			</v-btn>

			<v-btn
				v-if="isRejectButtonVisible"
				color="red-lighten-1"
				class="text-none ml-3"
				variant="elevated"
				@click="onSubmitForm(TYPES_OF_FORM_ACTION.REJECT)"
			>
				{{ $t(approvalSystemData.acceptanceAction.rejectButtonName) }}
			</v-btn>

			<v-btn
				:disabled="approvalSystemData.acceptanceAction.isApproveButtonDisabled"
				color="primary"
				class="text-none ml-3"
				variant="elevated"
				@click="onSubmitForm(TYPES_OF_FORM_ACTION.SET)"
			>
				{{ $t(setButtonName) }}
			</v-btn>
		</v-card-actions>
	</Modal>
</template>

<script>
import { maxLength, required } from "@vuelidate/validators";
import ApprovalService from "@/services/ApprovalService";
import ConfirmAction from "@/components/ConfirmAction";
import DataTextarea from "@/components/Inputs/DataTextarea";
import Modal from "@/components/Inputs/Modal";
import validation from "@/mixins/validation";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { GENERAL } from "@/consts";

const TYPES_OF_FORM_ACTION = {
	REJECT: "Reject",
	SET: "Set",
};

export default {
	name: "ApprovalSystem",

	components: {
		ConfirmAction,
		DataTextarea,
		Modal,
	},

	mixins: [validation],

	validations() {
		return {
			justification: {
				required,
				maxLength: maxLength(500),
			},
		};
	},

	props: {
		approvalSystemData: {
			type: Object,
			required: true,
			validator(value) {
				return !!(value.actionType && value.targetId && value.target);
			},
		},
	},

	data() {
		return {
			TYPES_OF_FORM_ACTION,
			justification: "",
			formAction: "",
			isModalOpened: false,
			isConfirmMenuOpen: false,
		};
	},

	computed: {
		setButtonName() {
			const { createAction, acceptanceAction, actionType } = this.approvalSystemData;

			if (actionType === GENERAL.APPROVAL_SYSTEM.TYPE.CREATE) {
				return createAction.createButtonName;
			}

			if (actionType === GENERAL.APPROVAL_SYSTEM.TYPE.ACCEPTANCE) {
				return acceptanceAction.approveButtonName;
			}

			return "Create";
		},

		getConfirmMessage() {
			const { createAction, acceptanceAction, actionType } = this.approvalSystemData;

			if (actionType === GENERAL.APPROVAL_SYSTEM.TYPE.CREATE) {
				return createAction.confirmMessage;
			}

			if (actionType === GENERAL.APPROVAL_SYSTEM.TYPE.ACCEPTANCE) {
				if (this.formAction === TYPES_OF_FORM_ACTION.REJECT) {
					return acceptanceAction.confirmMessageForReject;
				}

				if (this.formAction === TYPES_OF_FORM_ACTION.SET) {
					return acceptanceAction.confirmMessageForApprove;
				}
			}

			return "";
		},

		getConfirmTitle() {
			const { createAction, acceptanceAction, actionType } = this.approvalSystemData;

			if (actionType === GENERAL.APPROVAL_SYSTEM.TYPE.CREATE) {
				return createAction.confirmTitle;
			}

			if (actionType === GENERAL.APPROVAL_SYSTEM.TYPE.ACCEPTANCE) {
				if (this.formAction === TYPES_OF_FORM_ACTION.REJECT) {
					return acceptanceAction.confirmTitleForReject;
				}

				if (this.formAction === TYPES_OF_FORM_ACTION.SET) {
					return acceptanceAction.confirmTitleForApprove;
				}
			}

			return "";
		},

		modalTitle() {
			const { actionType, createAction, acceptanceAction } = this.approvalSystemData;

			if (actionType === GENERAL.APPROVAL_SYSTEM.TYPE.CREATE) {
				return createAction.title;
			}

			if (actionType === GENERAL.APPROVAL_SYSTEM.TYPE.ACCEPTANCE) {
				return acceptanceAction.title;
			}

			return "";
		},

		isRejectButtonVisible() {
			return this.approvalSystemData.actionType === GENERAL.APPROVAL_SYSTEM.TYPE.ACCEPTANCE;
		},
	},

	watch: {
		approvalSystemData: {
			deep: true,
			handler(value) {
				this.prepareData(value);
			},
		},

		isModalOpened(value) {
			if (!value) {
				this.$emit("formClosed");
			}
		},
	},

	async mounted() {
		this.prepareData(this.approvalSystemData);

		if (this.approvalSystemData.actionType === GENERAL.APPROVAL_SYSTEM.TYPE.ACCEPTANCE) {
			this.justification = this.approvalSystemData.acceptanceAction.message;
		}
	},

	methods: {
		async createNewApproval() {
			try {
				const { targetId, target } = this.approvalSystemData;
				const {
					status,
					message,
				} = await ApprovalService.createNewApproval({
					message: this.justification,
					approvalTarget: target,
					targetId,
				});

				checkResponseStatus(status, message, 201);

				this.$emit("approvalCreated");
			} catch (e) {
				Notification(`${this.$t("Create Approval")}: ${e.message || e}`, "error");
			} finally {
				this.isModalOpened = false;
			}
		},

		async changeStatusOfApproval(approvalStatus) {
			try {
				const {
					data,
					status,
					message,
				} = await ApprovalService.changeStatusOfApproval({
					body: {
						message: this.justification,
						state: approvalStatus,
					},
					id: this.approvalSystemData.acceptanceAction.approvalId,
				});

				checkResponseStatus(status, message);

				this.$emit(approvalStatus, data);
			} catch (e) {
				Notification(`${this.$t("Change status of Approval")}: ${e.message || e}`, "error");
			} finally {
				this.isModalOpened = false;
			}
		},

		prepareData(approvalSystemData) {
			this.isModalOpened = approvalSystemData.isModalOpened;
		},

		onSubmitForm(formAction) {
			this.v$.$touch();

			if (this.v$.$invalid) return;

			this.formAction = formAction;

			this.isConfirmMenuOpen = true;
		},

		async onActionConfirmed() {
			const { actionType } = this.approvalSystemData;

			if (actionType === GENERAL.APPROVAL_SYSTEM.TYPE.CREATE) {
				await this.createNewApproval();
			}

			if (actionType === GENERAL.APPROVAL_SYSTEM.TYPE.ACCEPTANCE) {
				if (this.formAction === TYPES_OF_FORM_ACTION.SET) {
					await this.changeStatusOfApproval(GENERAL.APPROVAL_SYSTEM.STATE.APPROVED);
				} else if (this.formAction === TYPES_OF_FORM_ACTION.REJECT) {
					await this.changeStatusOfApproval(GENERAL.APPROVAL_SYSTEM.STATE.REJECTED);
				}
			}
		},
	},
};
</script>
