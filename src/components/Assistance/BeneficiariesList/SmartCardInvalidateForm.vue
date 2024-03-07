<template>
	<v-card-text>
		<DataTextarea
			v-model.trim="note"
			:error-messages="validationMsg('note')"
			label="Note (reason for Invalidation)"
			name="note"
			@blur="onValidate('note')"
		/>

		<ConfirmAction
			:is-dialog-opened="isConfirmMenuOpen"
			confirm-title="Set as Invalidated"
			confirm-message="Do you really want to set as Invalidated? This is permanent and distribution can not be distributed again."
			prepend-icon="circle-exclamation"
			prepend-icon-color="info"
			close-button-name="Cancel"
			confirm-button-name="Set"
			confirm-button-color="primary"
			@modalClosed="isConfirmMenuOpen = false"
			@actionConfirmed="onSetInvalidateSmartCardDistribution()"
		/>
	</v-card-text>

	<v-card-actions>
		<v-spacer />

		<v-btn
			class="text-none"
			color="blue-grey-lighten-4"
			variant="elevated"
			@click="onCloseForm"
		>
			{{ $t('Close') }}
		</v-btn>

		<v-btn
			color="primary"
			class="text-none ml-3"
			variant="elevated"
			@click="onSubmitForm"
		>
			{{ $t("Set as invalidated") }}
		</v-btn>
	</v-card-actions>
</template>

<script>
import { required } from "@vuelidate/validators";
import AssistancesService from "@/services/AssistancesService";
import ConfirmAction from "@/components/ConfirmAction";
import DataTextarea from "@/components/Inputs/DataTextarea";
import validation from "@/mixins/validation";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";

export default {
	name: "SmartCardInvalidateForm",

	components: {
		DataTextarea,
		ConfirmAction,
	},

	mixins: [validation],

	validations() {
		return {
			note: { required },
		};
	},

	props: {
		beneficiaryData: {
			type: Object,
			required: true,
		},

		tableData: {
			type: Array,
			required: true,
		},
	},

	data() {
		return {
			note: "Distribution invalidated by admin",
			isConfirmMenuOpen: false,
		};
	},

	methods: {
		async onSetInvalidateSmartCardDistribution() {
			try {
				const {
					data,
					status,
					message,
				} = await AssistancesService.invalidateDistributionOfReliefPackage(
					this.beneficiaryData.reliefPackage[0].id,
					{ note: this.note },
				);

				checkResponseStatus(status, message);

				Notification(
					`${this.$t("Successfully set as invalidated for Beneficiary ID")} ${this.beneficiaryData.bnfId}`,
					"success",
				);

				const updatedRow = {
					status: [data.state],
					distributed: [`${data.distributed} ${data.unit}`],
					lastModified: [this.$moment(data.lastModified).format("YYYY-MM-DD hh:mm")],
					selectable: true,
				};

				const updatedTable = this.tableData.map(
					(row, index) => (index === this.beneficiaryData.tableIndex
						? { ...row, ...updatedRow }
						: row
					),
				);

				this.$emit("updateTable", updatedTable);
			} catch (e) {
				Notification(`${this.$t("Set as invalidate")} ${e.message || e}`, "error");
			} finally {
				this.$emit("formClosed");
			}
		},

		onSubmitForm() {
			this.v$.$touch();

			if (this.v$.$invalid) {
				return;
			}

			this.isConfirmMenuOpen = true;
		},

		onCloseForm() {
			this.$emit("formClosed");
		},
	},
};
</script>
