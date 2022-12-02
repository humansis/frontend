<template>
	<div v-if="!duplicitiesLoading">
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
					state,
				}, duplicityKey) of duplicities"
				:key="duplicityKey"
				class="resolve-table"
			>
				<table>
					<thead>
						<tr>
							<th>{{ $t('Household') }}</th>
							<th>{{ $t('Records From File') }} / {{ $t('Humansis') }} </th>
							<th class="has-text-right">{{ $t('Use Record From') }}</th>
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
										{{ $t('No Difference') }}
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
							<td class="action-row">
								<b-field grouped>
									<b-button
										:class="[
											'is-link button-to-update',
											state === consts.ITEM_STATE.DUPLICITY_KEEP_OURS ? '' : 'is-outlined'
										]"
										:disabled="changesLoading(duplicityKey)"
										:loading="changesLoading(duplicityKey)"
										@click="resolveToUpdate(
											itemId,
											duplicityCandidateId,
											duplicityKey
										)"
									>
										{{ $t('File') }}
									</b-button>
									<b-button
										:class="[
											'is-info button-to-link',
											state === consts.ITEM_STATE.DUPLICITY_KEEP_THEIRS ? '' : 'is-outlined'
										]"
										:disabled="changesLoading(duplicityKey)"
										:loading="changesLoading(duplicityKey)"
										@click="resolveToLink(
											itemId,
											duplicityCandidateId,
											duplicityKey
										)"
									>
										{{ $t('Humansis') }}
									</b-button>
								</b-field>
							</td>
						</tr>
					</tbody>
				</table>
				<hr>
			</div>
		</div>
	</div>
	<div v-else>
		<b-loading :is-full-page="false" :active="duplicitiesLoading" />
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
			consts,
			duplicities: [],
		};
	},

	props: {
		header: {
			type: String,
			required: true,
		},
		duplicitiesLoading: {
			type: Boolean,
		},
		// changesLoading
		formChangesLoading: {
			type: Boolean,
		},
	},

	mounted() {
		this.fetchDuplicities();
	},
	watch: {
		duplicities(value) {
			this.$emit("duplicitiesChange", value);
		},
	},

	methods: {
		async fetchDuplicities() {
			const duplicities = await this.getDuplicities() || [];

			this.duplicities = duplicities.map((item) => ({
				...item,
				toUpdateLoading: false,
				toLinkLoading: false }));

			this.$emit("loaded", true);
			Toast(this.$t("Duplicities were resolved"), "is-success");
		},

		transformProperty(text) {
			return text.replace(/([A-Z])/g, " $1")
				.replace(/^./, (str) => str.toUpperCase());
		},

		getSlashedArray(items) {
			let result = "";

			if (typeof items.database === "string" || typeof items.import === "string") {
				result = Object.values(items).reverse().join(" / ");
			} else {
				const database = items.database[0] || "-";
				const imp = items.import[0] || "-";

				result = `${imp} / ${database}`;
			}

			return result;
		},

		changesLoading(duplicityKey) {
			return this.duplicities[duplicityKey].toUpdateLoading
				|| this.duplicities[duplicityKey].toLinkLoading
					|| this.formChangesLoading;
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
						if (state === consts.ITEM_STATUS.TO_LINK) {
							this.duplicities[duplicityKey].state = consts.ITEM_STATE.DUPLICITY_KEEP_THEIRS;
						}

						if (state === consts.ITEM_STATUS.TO_UPDATE) {
							this.duplicities[duplicityKey].state = consts.ITEM_STATE.DUPLICITY_KEEP_OURS;
						}

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

			this.duplicities = this.duplicities.map((item) => ({
				...item,
				toUpdateLoading: false,
				toLinkLoading: false,
			}));
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

.action-row .is-grouped {
	justify-content: right;
}
</style>
