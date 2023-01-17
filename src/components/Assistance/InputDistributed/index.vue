<template>
	<div class="modal-card-body">
		<form @submit.prevent="submit" v-if="distributedFormVisible">
			<section>
				<IdTypeSelect
					v-if="isOperationAddOrRemoveBulk"
					ref="idTypeSelect"
					v-model="formModel.idType"
					required
				/>
				<b-message type="is-info">
					{{ $t('Split ID numbers with white space') }}.
					{{ $t('Maximum 5000 IDs allowed') }}.
				</b-message>
				<b-field
					:label="$t('ID Numbers')"
					:type="validateType('idsList')"
					:message="validateIdsListMsg()"
				>
					<b-input
						v-model.trim="formModel.idsList"
						type="textarea"
						@input="onIdsListChange"
						@blur="validate('idsList')"
					/>
				</b-field>
				<b-field
					v-if="isOperationAddOrRemoveBulk"
					:label="$t('Justification')"
					:type="validateType('justification')"
					:message="validateMsg('justification')"
				>
					<b-input
						v-model.trim="formModel.justification"
					/>
				</b-field>
			</section>
			<footer class="modal-card-foot pl-0 pr-0">
				<b-button v-if="closeButton" @click="close">
					{{ $t('Close') }}
				</b-button>
				<b-button
					class="is-primary width-80"
					native-type="submit"
					:loading="distributedButtonLoading"
					:disabled="distributedButtonLoading"
				>
					{{ $t(submitButtonLabel) }}
				</b-button>
			</footer>
		</form>
		<b-tabs v-if="!distributedFormVisible && distributeData">
			<b-tab-item v-if="distributeData.notFound">
				<template #header>
					<span>{{ $t('Not Found') }}
						<b-tag class="ml-1" type="is-danger is-light" rounded>
							{{ distributeData.notFound.length }}
						</b-tag>
					</span>
				</template>
				<template>
					<BaseDeduplicationTable
						v-if="isOperationAddOrRemoveBulk"
						:data="distributeData.notFound"
					/>
					<BaseDistributedTable v-else show-only-id-number :data="distributeData.notFound" />
				</template>
			</b-tab-item>
			<b-tab-item v-if="distributeData.conflicts">
				<template #header>
					<span>{{ $t('Conflict IDs') }}
						<b-tag class="ml-1" type="is-warning" rounded>
							{{ distributeData.conflicts.length }}
						</b-tag>
					</span>
				</template>
				<template>
					<DuplicityDistributedTable :data="distributeData.conflicts" />
				</template>
			</b-tab-item>
			<b-tab-item v-if="distributeData.successfullyDistributed">
				<template #header>
					<span>{{ $t('Set As Distributed') }}
						<b-tag class="ml-1" type="is-success" rounded>
							{{ distributeData.successfullyDistributed.length }}
						</b-tag>
					</span>
				</template>
				<template>
					<BaseDistributedTable :data="distributeData.successfullyDistributed" />
				</template>
			</b-tab-item>
			<b-tab-item v-if="distributeData.success">
				<template #header>
					<span>{{ $t(successfulOperationTitle) }}
						<b-tag class="ml-1" type="is-success" rounded>
							{{ distributeData.success.length }}
						</b-tag>
					</span>
				</template>
				<template>
					<BaseDeduplicationTable
						v-if="isOperationAddOrRemoveBulk"
						:data="distributeData.success"
					/>
					<BaseDistributedTable v-else :data="distributeData.success" />
				</template>
			</b-tab-item>
			<b-tab-item v-if="distributeData.alreadyProcessed">
				<template #header>
					<span>{{ $t(alreadyProcessedOperationTitle) }}
						<b-tag class="ml-1" type="is-info" rounded>
							{{ distributeData.alreadyProcessed.length }}
						</b-tag>
					</span>
				</template>
				<template>
					<BaseDeduplicationTable
						v-if="isOperationAddOrRemoveBulk"
						:data="distributeData.alreadyProcessed"
					/>
					<BaseDistributedTable v-else :data="distributeData.alreadyProcessed" />
				</template>
			</b-tab-item>
			<b-tab-item v-if="distributeData.alreadyDistributed">
				<template #header>
					<span>{{ $t('Distributed In Past') }}
						<b-tag class="ml-1" type="is-info" rounded>
							{{ distributeData.alreadyDistributed.length }}
						</b-tag>
					</span>
				</template>
				<template>
					<BaseDistributedTable :data="distributeData.alreadyDistributed" />
				</template>
			</b-tab-item>
			<b-tab-item v-if="distributeData.partiallyDistributed">
				<template #header>
					<span>{{ $t('Partially Distributed') }}
						<b-tag class="ml-1" type="is-link" rounded>
							{{ distributeData.partiallyDistributed.length }}
						</b-tag>
					</span>
				</template>
				<template>
					<BaseDistributedTable :data="distributeData.partiallyDistributed" />
				</template>
			</b-tab-item>
			<b-tab-item v-if="distributeData.failed">
				<template #header>
					<span>{{ $t('Unknown Error') }}
						<b-tag class="ml-1" type="is-danger" rounded>
							{{ distributeData.failed.length }}
						</b-tag>
					</span>
				</template>
				<template>
					<BaseDeduplicationTable
						v-if="isOperationAddOrRemoveBulk"
						:data="distributeData.failed"
					/>
					<BaseDistributedTable v-else :data="distributeData.failed" />
				</template>
			</b-tab-item>
		</b-tabs>
		<footer v-if="!distributedFormVisible && distributeData" class="modal-card-foot">
			<b-button v-if="closeButton" @click="close">
				{{ $t('Close') }}
			</b-button>
			<b-button class="is-primary" @click="openDistributedForm">
				<span>
					{{ $t(nameOfSubmitButton) }}
				</span>
			</b-button>
		</footer>
	</div>
</template>

<script>
import { required, requiredIf } from "vuelidate/lib/validators";
import { Notification } from "@/utils/UI";
import BeneficiariesService from "@/services/BeneficiariesService";
import AssistancesService from "@/services/AssistancesService";
import validation from "@/mixins/validation";
import BaseDeduplicationTable from "@/components/Assistance/InputDistributed/BaseDeduplicationTable";
import BaseDistributedTable from "@/components/Assistance/InputDistributed/BaseDistributedTable";
import DuplicityDistributedTable from "@/components/Assistance/InputDistributed/DuplicityDistributedTable";
import IdTypeSelect from "@/components/Inputs/IdTypeSelect.vue";
import { isIdsListLengthValid } from "@/utils/customValidators";
import consts from "@/utils/assistanceConst";

export default {
	name: "StartTransactionsForm",

	components: {
		BaseDeduplicationTable,
		BaseDistributedTable,
		DuplicityDistributedTable,
		IdTypeSelect,
	},

	props: {
		submitButtonLabel: {
			type: String,
			default: "Confirm",
		},
		defaultIdType: {
			type: String,
			default: "Tax Number",
		},
		deduplication: Boolean,
		addingToAssistance: Boolean,
		closeButton: Boolean,
	},

	mixins: [validation],

	data() {
		return {
			distributedFormVisible: true,
			distributedButtonLoading: false,
			distributeData: null,
			idsListErrorMessage: "",
			formModel: { ...consts.INPUT_DISTRIBUTED.DEFAULT_FORM_MODEL },
		};
	},

	validations() {
		return {
			formModel: {
				idType: { required: requiredIf(() => this.isOperationAddOrRemoveBulk) },
				idsList: {
					required,
					isIdsListLengthValid,
				},
				justification: { required: requiredIf(() => this.isOperationAddOrRemoveBulk) },
			},
		};
	},

	created() {
		this.setDefaultIdType();
	},

	methods: {
		async submit() {
			this.$v.$touch();

			if (this.isOperationAddOrRemoveBulk) {
				this.$refs.idTypeSelect.onSubmit();
			}

			if (this.$v.$invalid) { return; }

			this.distributedButtonLoading = true;
			let body;

			const numberIds = this.formModel.idsList.split(/\s+/);

			if (!numberIds.length) {
				Notification(this.$t("Invalid Input"), "is-danger");
			}

			if (this.isOperationAddOrRemoveBulk) {
				const target = "beneficiaries";
				body = {
					documentType: this.formModel.idType?.code,
					documentNumbers: numberIds,
					justification: this.formModel.justification,
				};

				if (this.deduplication) {
					await BeneficiariesService.removeBeneficiaryFromAssistance(
						this.$route.params.assistanceId, target, body,
					)
						.then(({ data, message }) => {
							if (data) {
								if (data.errors?.message) {
									Notification(data.errors.message, "is-warning", "is-bottom");
								} else {
									this.distributeData = data;
									this.distributedFormVisible = false;
								}
							} else {
								Notification(message, "is-warning");
							}
						}).catch((error) => {
							Notification(error, "is-danger");
						}).finally(() => {
							this.distributedButtonLoading = false;
							this.$emit("submit");
						});
				} else {
					await BeneficiariesService.addBeneficiaryToAssistance(
						this.$route.params.assistanceId, target, body,
					)
						.then(({ data, message }) => {
							if (data) {
								if (data.errors?.message) {
									Notification(data.errors.message, "is-warning", "is-bottom");
								} else {
									this.distributeData = data;
									this.distributedFormVisible = false;
								}
							} else {
								Notification(message, "is-warning");
							}
						}).catch((error) => {
							Notification(error, "is-danger");
						}).finally(() => {
							this.distributedButtonLoading = false;
							this.$emit("submit");
						});
				}
			} else {
				body = numberIds.map((idNumber) => ({ idNumber }));

				await AssistancesService.updateReliefPackagesWithNumberIds(
					this.$route.params.assistanceId, body,
				).then(({ data, status, message }) => {
					if (status === 200) {
						this.distributeData = data;
						this.distributedFormVisible = false;
					} else {
						Notification(message, "is-warning");
					}
				}).catch((error) => {
					Notification(error, "is-danger");
				}).finally(() => {
					this.distributedButtonLoading = false;
					this.$emit("submit");
				});

				this.$v.$reset();
			}
		},

		onIdsListChange() {
			if (isIdsListLengthValid(this.formModel.idsList)) {
				this.idsListErrorMessage = "";
			} else {
				const msg = this.$t(`You have entered more than ${consts.INPUT_DISTRIBUTED.IDS_LIST_MAX_LENGTH} IDs`);
				this.idsListErrorMessage = this.$t(msg);
			}
		},

		validateIdsListMsg() {
			return this.idsListErrorMessage
				? this.validateMsg("idsList", this.idsListErrorMessage)
				: this.validateMsg("idsList");
		},

		openDistributedForm() {
			this.formModel = { ...consts.INPUT_DISTRIBUTED.DEFAULT_FORM_MODEL };
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

		close() {
			this.$emit("close");
		},
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
};
</script>

<style type="text/css">
.width-80 {
	width: 80px
}
</style>
