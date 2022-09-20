<template>
	<div class="modal-card-body">
		<form @submit.prevent="submit" v-if="distributedFormVisible">
			<section>
				<IdTypeSelect
					v-if="deduplication"
					ref="idTypeSelect"
					v-model="formModel.idType"
					required
				/>
				<b-message type="is-info">
					{{ $t('Split ID numbers with white space') }}.
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
					v-if="deduplication"
					:label="$t('Justification')"
					:type="validateType('justification')"
					:message="validateMsg('justification')"
				>
					<b-input
						v-model="formModel.justification"
					/>
				</b-field>
			</section>
			<footer class="modal-card-foot pl-0 pr-0">
				<b-button v-if="closeButton" @click="close">
					{{ $t('Close') }}
				</b-button>
				<b-button
					tag="input"
					class="is-primary width-80"
					native-type="submit"
					:loading="distributedButtonLoading"
					:disabled="distributedButtonLoading"
					:value="submitButtonLabel"
				/>
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
						v-if="deduplication"
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
					<span>{{ $t('Success') }}
						<b-tag class="ml-1" type="is-success" rounded>
							{{ distributeData.success.length }}
						</b-tag>
					</span>
				</template>
				<template>
					<BaseDeduplicationTable
						v-if="deduplication"
						:data="distributeData.success"
					/>
					<BaseDistributedTable v-else :data="distributeData.success" />
				</template>
			</b-tab-item>
			<b-tab-item v-if="distributeData.alreadyRemoved">
				<template #header>
					<span>{{ $t('Already removed') }}
						<b-tag class="ml-1" type="is-info" rounded>
							{{ distributeData.alreadyRemoved.length }}
						</b-tag>
					</span>
				</template>
				<template>
					<BaseDeduplicationTable
						v-if="deduplication"
						:data="distributeData.alreadyRemoved"
					/>
					<BaseDistributedTable v-else :data="distributeData.alreadyRemoved" />
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
						v-if="deduplication"
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
				<span v-if="deduplication">
					{{ $t('Input Deduplication Again') }}
				</span>
				<span v-else>
					{{ $t('Input Distributed Again') }}
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

const DEFAULT_FORM_MODEL = {
	idType: null,
	idsList: "",
	justification: "",
};
const IDS_LIST_MAX_LENGTH = 5000;
const splitBySpace = (str) => str.split(/\s+/);
const isIdsListLengthValid = (idsList) => splitBySpace(idsList).length <= IDS_LIST_MAX_LENGTH;
const validateLength = (idsList) => isIdsListLengthValid(idsList);

export default {
	name: "StartTransactionsForm",

	components: {
		BaseDeduplicationTable,
		BaseDistributedTable,
		DuplicityDistributedTable,
		IdTypeSelect,
	},

	props: {
		submitButtonLabel: String,
		deduplication: Boolean,
		closeButton: Boolean,
	},

	mixins: [validation],

	data() {
		return {
			distributedFormVisible: true,
			distributedButtonLoading: false,
			distributeData: null,
			idsListErrorMessage: null,
			formModel: { ...DEFAULT_FORM_MODEL },
		};
	},

	validations: {
		formModel: {
			idType: { required: requiredIf(function fn() { return this.deduplication; }) },
			idsList: {
				required,
				validateLength,
			},
			justification: { required: requiredIf(function fn() { return this.deduplication; }) },
		},
	},

	methods: {
		async submit() {
			this.$v.$touch();
			this.$refs.idTypeSelect.onSubmit();

			if (this.$v.$invalid) { return; }

			this.distributedButtonLoading = true;
			let body;

			const numberIds = splitBySpace(this.formModel.idsList);

			if (!numberIds.length) {
				Notification(this.$t("Invalid Input"), "is-danger");
			}

			if (this.deduplication) {
				const target = "beneficiaries";
				body = {
					documentType: this.formModel.idType?.code,
					documentNumbers: numberIds,
					justification: this.formModel.justification,
				};

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
					});
			} else {
				body = numberIds.map((idNumber) => ({ idNumber }));

				await AssistancesService.updateReliefPackagesWithNumberIds(
					this.$route.params.assistanceId, body,
				)
					.then(({ data, message }) => {
						if (data) {
							this.distributeData = data;
							this.distributedFormVisible = false;
						} else {
							Notification(message, "is-warning");
						}
					}).catch((error) => {
						Notification(error, "is-danger");
					}).finally(() => {
						this.distributedButtonLoading = false;
					});
			}

			this.$emit("submit", body);

			this.$v.$reset();
		},

		onIdsListChange() {
			if (isIdsListLengthValid(this.formModel.idsList)) {
				this.idsListErrorMessage = null;
			} else {
				this.idsListErrorMessage = this.$t(`Length of IDs list must not exceed ${IDS_LIST_MAX_LENGTH}`);
			}
		},

		validateIdsListMsg() {
			return this.idsListErrorMessage
				? this.validateMsg("idsList", this.idsListErrorMessage)
				: this.validateMsg("idsList");
		},

		openDistributedForm() {
			this.formModel = { ...DEFAULT_FORM_MODEL };
			this.distributeData = null;
			this.distributedFormVisible = true;
		},

		close() {
			this.$emit("close");
		},
	},
};
</script>

<style type="text/css">
.width-80 {
	width: 80px
}
</style>
