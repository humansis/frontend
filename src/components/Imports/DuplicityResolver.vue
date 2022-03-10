<template>
	<div>
		<hr>

		<h2 class="subtitle is-5 mb-4">
			{{ header }} ({{ duplicities.length }})
		</h2>

		<hr>

		<div class="content">
			<div
				v-for="({
					itemId,
					memberDuplicities,
					duplicityCandidateId,
					toUpdateLoading,
					toLinkLoading,
					state,
					addedBeneficiaries,
					removedBeneficiaries
				}, duplicityKey) of duplicities"
				:key="duplicityKey"
				class="resolve-table"
			>
				<table>
					<thead>
						<tr>
							<th>{{ $t('Reasons') }}</th>
							<th>{{ $t('Records From Database') }} / {{ $t('Imported Record') }} </th>
							<th class="has-text-right">{{ $t('Actions') }}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="td-width-30">
								<div
									v-for="({ reasons, originFullName }, index) in memberDuplicities"
									:key="`member-${index}`"
									class="mb-3"
								>
									<strong>{{ originFullName }}</strong>
									<div
										v-for="(reason, key) in reasons"
										:key="`difference-${key}`"
									>
										<template v-if="reason">

											<span v-if="typeof reason === 'number' || typeof reason === 'string'">
												{{ key }} - {{ reason }}
											</span>
											<span v-else>
												<span
													class="is-block"
													v-for="(value, key) in reason"
													:key="`difference-item-${key}`"
												>
													{{ key }}: {{ value }}
												</span>
											</span>

										</template>
									</div>

								</div>
							</td>
							<td class="td-width-30">
								<div
									v-for="({ differences }, index) in memberDuplicities"
									:key="`member-${index}`"
									class="mb-3"
								>
									<b-tag
										v-if="!hasDuplicityDifferences(differences)"
										class="mt-2 mr-2"
										type="is-light"
									>
										No difference
									</b-tag>
									<template v-else>
										<div
											v-for="(difference, key) in differences"
											:key="`difference-${key}`"
										>
											<template v-if="difference">
												<span
													v-if="typeof difference === 'number' || typeof difference === 'string'"
												>
													{{ key }} - {{ difference }}
												</span>
												<span v-else>
													{{ transformProperty(key) }}:
													{{ getSlashedArray(difference)}}
												</span>

											</template>
										</div>
									</template>

								</div>
							</td>
							<td>
								<b-field grouped>
									<b-button
										:class="[
											'is-link button-to-update',
											state === 'Duplicity Keep Ours' ? '' : 'is-outlined'
										]"
										:disabled="toUpdateLoading || toLinkLoading"
										:loading="toUpdateLoading"
										@click="resolveToUpdate(
											itemId,
											duplicityCandidateId,
											duplicityKey
										)"
									>
										{{ $t('To Update') }}
									</b-button>
									<b-button
										:class="[
											'is-info button-to-link',
											state === 'Duplicity Keep Theirs' ? '' : 'is-outlined'
										]"
										:disabled="toUpdateLoading || toLinkLoading"
										:loading="toLinkLoading"
										@click="resolveToLink(
											itemId,
											duplicityCandidateId,
											duplicityKey
										)"
									>
										{{ $t('To Link') }}
									</b-button>
								</b-field>
							</td>
						</tr>
					</tbody>
				</table>

				<div v-if="addedBeneficiaries.length">
					- Added beneficiaries:
					<span
						v-for="(beneficiary, index) of addedBeneficiaries"
						:key="`added-beneficiary-${index}`"
					>
						{{ beneficiary }}
						<span v-if="index !== addedBeneficiaries.length - 1">
							,
						</span>
					</span>
				</div>

				<div v-if="removedBeneficiaries.length">
					- Removed beneficiaries:
					<span
						v-for="({ id, name}, index) of removedBeneficiaries"
						:key="`added-beneficiary-${index}`"
					>
						#{{ id }} {{ name }}
						<span v-if="index !== removedBeneficiaries.length - 1">
							,
						</span>
					</span>
				</div>
				<hr>
			</div>
		</div>
	</div>
</template>

<script>
import ImportService from "@/services/ImportService";
import { Notification, Toast } from "@/utils/UI";
import consts from "@/utils/importConst";

export default {
	name: "DuplicityResolver",

	data() {
		return {
			duplicities: [],
		};
	},

	props: {
		header: {
			type: String,
			required: true,
		},
	},

	mounted() {
		this.fetchDuplicities();
	},

	methods: {
		async fetchDuplicities() {
			const duplicities = await this.getDuplicities() || [];

			this.duplicities = duplicities.map((item) => ({
				...item,
				toUpdateLoading: false,
				toLinkLoading: false }));

			this.$emit("loaded", true);
		},

		transformProperty(text) {
			return text.replace(/([A-Z])/g, " $1")
				.replace(/^./, (str) => str.toUpperCase());
		},

		getSlashedArray(items) {
			return Object.values(items).join(" / ");
		},

		hasDuplicityDifferences(differences) {
			return !Object.values(differences).every((item) => item);
		},

		getDuplicities() {
			const { importId } = this.$route.params;

			return ImportService.getDuplicitiesInImport(importId)
				.then(({ data: { data } }) => data)
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Duplicities")} ${e}`, "is-danger");
				});
		},

		async resolveToUpdate(queueId, acceptedDuplicityId, duplicityKey) {
			this.duplicities[duplicityKey].buttonLoading = true;

			await this.resolveImportItemDuplicity(
				queueId,
				consts.ITEM_STATUS.TO_UPDATE,
				acceptedDuplicityId,
				duplicityKey,
				"toUpdateLoading",
			);
		},

		async resolveToLink(queueId, acceptedDuplicityId, duplicityKey) {
			await this.resolveImportItemDuplicity(
				queueId,
				consts.ITEM_STATUS.TO_LINK,
				acceptedDuplicityId,
				duplicityKey,
				"toLinkLoading",
			);
		},

		async resolveImportItemDuplicity(
			queueId, state, acceptedDuplicityId, duplicityKey, button,
		) {
			if (duplicityKey !== null) {
				this.duplicities[duplicityKey][button] = true;
			} else {
				this.duplicities[duplicityKey].toCreateLoading = true;
			}

			this.duplicities[duplicityKey].disabled = true;

			await ImportService.resolveImportItemDuplicity(queueId, state, acceptedDuplicityId)
				.then(({ status }) => {
					if (status === 202) {
						Toast(this.$t("Solved"), "is-success");
					}

					if (status === 400) {
						Notification(`${this.$t("Not Solved")}`, "is-warning");
					}
				}).catch((e) => {
					if (e.message) {
						if (duplicityKey !== null) {
							this.duplicities[duplicityKey][button] = false;
						} else {
							this.duplicities[duplicityKey].toCreateLoading = false;
						}

						this.duplicities[duplicityKey].disabled = false;
					}
				});

			await this.fetchDuplicities();
			this.$emit("updated");
		},
	},
};
</script>

<style>
.button-to-update {
	border-bottom-right-radius: 0;
	border-top-right-radius: 0;
}

.button-to-link {
	border-bottom-left-radius: 0;
	border-top-left-radius: 0;
	border-left: none;
}
</style>
