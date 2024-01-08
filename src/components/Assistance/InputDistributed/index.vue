<template>
	<template v-if="distributedFormVisible">
		<v-card-text>
			<IdTypeSelect
				v-if="isOperationAddOrRemoveBulk"
				v-model="formModel.idType"
				ref="idTypeSelect"
				required
			/>

			<v-alert
				variant="outlined"
				type="info"
				border="start"
				class="mb-6"
			>
				{{ $t('Split ID numbers with white space') }}.
				{{ $t('Maximum 5000 IDs allowed') }}.
			</v-alert>

			<DataTextarea
				v-model.trim="formModel.idsList"
				:error-messages="validationMsg('idsList')"
				label="ID Numbers"
				name="id-numbers"
				class="mb-6"
				@blur="onValidate('idsList')"
			/>

			<DataInput
				v-if="isOperationAddOrRemoveBulk"
				v-model="formModel.justification"
				:error-messages="validationMsg('justification')"
				label="Justification"
				name="justification"
				@update:modelValue="onValidate('justification')"
			/>

		</v-card-text>

		<v-card-actions>
			<v-spacer />

			<v-btn
				class="text-none"
				color="blue-grey-lighten-4"
				variant="elevated"
				@click="onClose"
			>
				{{ $t('Close') }}
			</v-btn>

			<v-btn
				color="primary"
				class="text-none ml-3"
				variant="elevated"
				@click="onSubmit"
			>
				{{ $t(submitButtonLabel) }}
			</v-btn>
		</v-card-actions>
	</template>

	<template v-if="!distributedFormVisible && distributeData">
		<v-card-text>
			<v-tabs
				v-model="activeTab"
				color="primary"
				align-tabs="start"
				class="mt-5"
			>
				<v-tab
					v-if="distributeData.notFound"
					:value="0"
					class="text-none"
				>
					{{ $t('Not Found') }}
					<v-chip
						size="small"
						label
						color="red-lighten-1"
						class="ml-2"
					>
						{{ distributeData.notFound.length }}
					</v-chip>
				</v-tab>

				<v-tab
					v-if="distributeData.conflicts"
					:value="1"
					class="text-none"
				>
					{{ $t('Conflict IDs') }}
					<v-chip
						size="small"
						label
						color="warning"
						class="ml-2"
					>
						{{ distributeData.conflicts.length }}
					</v-chip>
				</v-tab>

				<v-tab
					v-if="distributeData.successfullyDistributed"
					:value="2"
					class="text-none"
				>
					{{ $t('Set As Distributed') }}
					<v-chip
						size="small"
						label
						color="success"
						class="ml-2"
					>
						{{ distributeData.successfullyDistributed.length }}
					</v-chip>
				</v-tab>

				<v-tab
					v-if="distributeData.success"
					:value="3"
					class="text-none"
				>
					{{ $t(successfulOperationTitle) }}
					<v-chip
						size="small"
						label
						color="success"
						class="ml-2"
					>
						{{ distributeData.success.length }}
					</v-chip>
				</v-tab>

				<v-tab
					v-if="distributeData.alreadyProcessed"
					:value="4"
					class="text-none"
				>
					{{ $t(alreadyProcessedOperationTitle) }}
					<v-chip
						size="small"
						label
						color="info"
						class="ml-2"
					>
						{{ distributeData.alreadyProcessed.length }}
					</v-chip>
				</v-tab>

				<v-tab
					v-if="distributeData.alreadyDistributed"
					:value="5"
					class="text-none"
				>
					{{ $t('Distributed In Past') }}
					<v-chip
						size="small"
						label
						color="info"
						class="ml-2"
					>
						{{ distributeData.alreadyDistributed.length }}
					</v-chip>
				</v-tab>

				<v-tab
					v-if="distributeData.partiallyDistributed"
					:value="6"
					class="text-none"
				>
					{{ $t('Partially Distributed') }}
					<v-chip
						size="small"
						label
						color="deep-purple-lighten-1"
						class="ml-2"
					>
						{{ distributeData.partiallyDistributed.length }}
					</v-chip>
				</v-tab>

				<v-tab
					if="distributeData.failed"
					:value="7"
					class="text-none"
				>
					{{ $t('Unknown Error') }}
					<v-chip
						size="small"
						label
						color="error"
						class="ml-2"
					>
						{{ distributeData.failed.length }}
					</v-chip>
				</v-tab>
			</v-tabs>

			<v-window v-model="activeTab">
				<v-window-item>
					<div v-if="activeTab === 0">
						<BaseDeduplicationTable
							v-if="isOperationAddOrRemoveBulk"
							:data="distributeData.notFound"
						/>

						<BaseDistributedTable v-else show-only-id-number :data="distributeData.notFound" />
					</div>

					<div v-if="activeTab === 1">
						<DuplicityDistributedTable :data="distributeData.conflicts" />
					</div>

					<div v-if="activeTab === 2">
						<BaseDistributedTable :data="distributeData.successfullyDistributed" />
					</div>

					<div v-if="activeTab === 3">
						<BaseDeduplicationTable
							v-if="isOperationAddOrRemoveBulk"
							:data="distributeData.success"
						/>

						<BaseDistributedTable v-else :data="distributeData.success" />
					</div>

					<div v-if="activeTab === 4">
						<BaseDeduplicationTable
							v-if="isOperationAddOrRemoveBulk"
							:data="distributeData.alreadyProcessed"
						/>

						<BaseDistributedTable v-else :data="distributeData.alreadyProcessed" />
					</div>

					<div v-if="activeTab === 5">
						<BaseDistributedTable :data="distributeData.alreadyDistributed" />
					</div>

					<div v-if="activeTab === 6">
						<BaseDistributedTable :data="distributeData.partiallyDistributed" />
					</div>

					<div v-if="activeTab === 7">
						<BaseDeduplicationTable
							v-if="isOperationAddOrRemoveBulk"
							:data="distributeData.failed"
						/>

						<BaseDistributedTable v-else :data="distributeData.failed" />
					</div>

				</v-window-item>
			</v-window>
		</v-card-text>

		<v-card-actions>
			<v-spacer />

			<v-btn
				class="text-none"
				color="blue-grey-lighten-4"
				variant="elevated"
				@click="onClose"
			>
				{{ $t('Close') }}
			</v-btn>

			<v-btn
				color="primary"
				class="text-none ml-3"
				variant="elevated"
				@click="onOpenDistributedForm"
			>
				{{ $t(nameOfSubmitButton) }}
			</v-btn>
		</v-card-actions>
	</template>
</template>

<script>
import AssistancesService from "@/services/AssistancesService";
import BeneficiariesService from "@/services/BeneficiariesService";
import BaseDeduplicationTable from "@/components/Assistance/InputDistributed/BaseDeduplicationTable";
import BaseDistributedTable from "@/components/Assistance/InputDistributed/BaseDistributedTable";
import DuplicityDistributedTable from "@/components/Assistance/InputDistributed/DuplicityDistributedTable";
import DataInput from "@/components/Inputs/DataInput";
import DataTextarea from "@/components/Inputs/DataTextarea";
import IdTypeSelect from "@/components/Inputs/IdTypeSelect";
import validation from "@/mixins/validation";
import { isIdsListLengthValid } from "@/utils/customValidators";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";
import { helpers, required, requiredIf } from "@vuelidate/validators";

export default {
	name: "StartTransactionsForm",

	components: {
		BaseDeduplicationTable,
		BaseDistributedTable,
		DuplicityDistributedTable,
		IdTypeSelect,
		DataTextarea,
		DataInput,
	},

	mixins: [validation],

	validations() {
		return {
			formModel: {
				idType: { required: requiredIf(this.isOperationAddOrRemoveBulk) },
				idsList: {
					required,
					isIdsListLengthValid: helpers.withMessage(
						`You have entered more than ${ASSISTANCE.INPUT_DISTRIBUTED.IDS_LIST_MAX_LENGTH} IDs`,
						isIdsListLengthValid,
					),
				},
				justification: { required: requiredIf(this.isOperationAddOrRemoveBulk) },
			},
		};
	},

	props: {
		deduplication: Boolean,
		addingToAssistance: Boolean,
		closeButton: Boolean,

		submitButtonLabel: {
			type: String,
			default: "Confirm",
		},

		defaultIdType: {
			type: String,
			default: "Tax Number",
		},
	},

	data() {
		return {
			activeTab: 0,
			distributedFormVisible: true,
			distributedButtonLoading: false,
			distributeData: null,
			idsListErrorMessage: "",
			formModel: { ...ASSISTANCE.INPUT_DISTRIBUTED.DEFAULT_FORM_MODEL },
		};
	},

	computed: {
		successfulOperationTitle() {
			return (this.deduplication && "Removed")
				|| (this.addingToAssistance && "Added") || "Success";
		},

		alreadyProcessedOperationTitle() {
			return this.deduplication ? "Removed in the past"
				: "Added in the past";
		},

		nameOfSubmitButton() {
			return (this.deduplication && "Bulk Remove Again")
				|| (this.addingToAssistance && "Bulk Add Again")
				|| "Input Distributed Again";
		},

		isOperationAddOrRemoveBulk() {
			return this.deduplication || this.addingToAssistance;
		},
	},

	created() {
		this.setDefaultIdType();
	},

	methods: {
		async onSubmit() {
			this.v$.$touch();

			if (this.isOperationAddOrRemoveBulk) {
				this.$refs.idTypeSelect.onSubmit();
			}

			if (this.v$.$invalid) { return; }

			this.distributedButtonLoading = true;
			let body;

			const numberIds = this.formModel.idsList.split(/\s+/);

			if (!numberIds.length) {
				Notification(this.$t("Invalid Input"), "error");
			}

			if (this.isOperationAddOrRemoveBulk) {
				const target = "beneficiaries";
				body = {
					documentType: this.formModel.idType?.code,
					documentNumbers: numberIds,
					justification: this.formModel.justification,
				};

				if (this.deduplication) {
					await BeneficiariesService.removeBeneficiaryFromAssistance(this.$route.params.assistanceId, target, body)
						.then(({ data, message }) => {
							if (data) {
								if (data.errors?.message) {
									Notification(data.errors.message, "error");
								} else {
									this.distributeData = data;
									this.distributedFormVisible = false;
								}
							} else {
								Notification(message, "warning");
							}
						}).catch((e) => {
							Notification(`${this.$t("Beneficiary remove")} ${e.message || e}`, "error");
						}).finally(() => {
							this.distributedButtonLoading = false;
							this.$emit("submit");
						});
				} else {
					await BeneficiariesService.addBeneficiaryToAssistance(this.$route.params.assistanceId, target, body)
						.then(({ data, message }) => {
							if (data) {
								if (data.errors?.message) {
									Notification(data.errors.message, "warning");
								} else {
									this.distributeData = data;
									this.distributedFormVisible = false;
								}
							} else {
								Notification(message, "warning");
							}
						}).catch((error) => {
							Notification(error, "error");
						}).finally(() => {
							this.distributedButtonLoading = false;
							this.$emit("submit");
						});
				}
			} else {
				body = numberIds.map((idNumber) => ({ idNumber }));

				await AssistancesService.updateReliefPackagesWithNumberIds(this.$route.params.assistanceId, body).then(({ data, status, message }) => {
					if (status === 200) {
						this.distributeData = data;
						this.distributedFormVisible = false;
					} else {
						Notification(message, "warning");
					}
				}).catch((error) => {
					Notification(error, "error");
				}).finally(() => {
					this.distributedButtonLoading = false;
					this.$emit("submit");
				});

				this.v$.$reset();
			}
		},

		onOpenDistributedForm() {
			this.formModel = { ...ASSISTANCE.INPUT_DISTRIBUTED.DEFAULT_FORM_MODEL };
			this.distributeData = null;
			this.distributedFormVisible = true;
			this.setDefaultIdType();
		},

		setDefaultIdType() {
			this.formModel.idType = {
				code: this.defaultIdType,
				value: this.defaultIdType,
			};
		},

		onClose() {
			this.$emit("close");
		},
	},
};
</script>
