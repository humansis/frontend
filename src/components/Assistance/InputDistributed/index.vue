<template>
	<div class="modal-card-body">
		<form @submit.prevent="submit" v-if="distributedFormVisible">
			<section>
				<b-field
					:label="$t('ID Numbers')"
					:type="validateType('input')"
					:message="validateMsg('input')"
				>
					<b-input
						v-model.trim="formModel.input"
						type="textarea"
						@blur="validate('input')"
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
			<b-tab-item>
				<template #header>
					<span>{{ $t('Not Found') }}
						<b-tag class="ml-1" type="is-danger is-light" rounded>
							{{ distributeData.notFound.length }}
						</b-tag>
					</span>
				</template>
				<template>
					<BaseDistributedTable show-only-id-number :data="distributeData.notFound" />
				</template>
			</b-tab-item>
			<b-tab-item>
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
			<b-tab-item>
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
			<b-tab-item>
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
			<b-tab-item>
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
			<b-tab-item>
				<template #header>
					<span>{{ $t('Unknown Error') }}
						<b-tag class="ml-1" type="is-danger" rounded>
							{{ distributeData.failed.length }}
						</b-tag>
					</span>
				</template>
				<template>
					<BaseDistributedTable :data="distributeData.failed" />
				</template>
			</b-tab-item>
		</b-tabs>
		<footer v-if="!distributedFormVisible && distributeData" class="modal-card-foot">
			<b-button v-if="closeButton" @click="close">
				{{ $t('Close') }}
			</b-button>
			<b-button class="is-primary" @click="openDistributedForm">
				{{ $t('Input Distributed Again') }}
			</b-button>
		</footer>
	</div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import { Notification } from "@/utils/UI";
import AssistancesService from "@/services/AssistancesService";
import validation from "@/mixins/validation";
import BaseDistributedTable from "@/components/Assistance/InputDistributed/BaseDistributedTable";
import DuplicityDistributedTable from "@/components/Assistance/InputDistributed/DuplicityDistributedTable";

export default {
	name: "StartTransactionsForm",

	components: { BaseDistributedTable, DuplicityDistributedTable },

	props: {
		submitButtonLabel: String,
		closeButton: Boolean,
	},

	mixins: [validation],

	data() {
		return {
			distributedFormVisible: true,
			distributedButtonLoading: false,
			distributeData: null,
			formModel: {
				input: "",
			},
		};
	},

	validations: {
		formModel: {
			input: { required },
		},
	},

	methods: {
		async submit() {
			this.$v.$touch();

			if (this.$v.$invalid) { return; }

			this.distributedButtonLoading = true;

			const numberIds = this.formModel.input.split(/[\r\n\t\s]+/g);

			if (!numberIds.length) {
				Notification(this.$t("Invalid Input"), "is-danger");
			}

			const body = numberIds.map((idNumber) => ({ idNumber }));

			await AssistancesService.updateReliefPackagesWithNumberIds(
				this.$route.params.assistanceId, body,
			)
				.then(({ data, status, message }) => {
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
		},

		openDistributedForm() {
			this.formModel.input = "";
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
