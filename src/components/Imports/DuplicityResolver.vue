<template>
	<div>
		<!-- TODO WIP - issue PIN-2877 -->
		<hr style="height: 3px; background: #074f60;">

		<h2 class="subtitle is-5 mb-4">
			{{ header }} ({{ duplicities.length }})
		</h2>

		<hr>

		<div class="content b-table">
			<div class="level p-3 has-border-bottom">
				<div class="level-left">
					<div class="mr-3">
						<b-icon icon="filter" />
						Filter
					</div>

					<!-- TODO WIP - issue PIN-2877 -->
					<b-button
						:class="[
							'is-info',
							// 'is-outlined',
							// 'is-light',
							'mr-1',
						]"
					>
						{{ $t('Not resolved') }}
					</b-button>

					<!-- TODO WIP - issue PIN-2877 -->
					<b-button
						:class="[
							'is-info',
							'is-outlined',
							// 'is-light',
							'mr-1',
						]"
					>
						{{ $t('From file') }}
					</b-button>

					<!-- TODO WIP - issue PIN-2877 -->
					<b-button
						:class="[
							'is-info',
							'is-outlined',
							// 'is-light',
							'mr-1',
						]"
					>
						{{ $t('From humansis') }}
					</b-button>
				</div>
			</div>
			<table class="table">
				<thead>
					<tr>
						<!-- TODO WIP - issue PIN-2877 -->
						<th class="is-sortable">
							<span class="is-relative">
								{{ $t('Family Name') }}
								<span class="icon sort-icon is-small is-desc is-invisible ml-1">
									<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-arrow-up fa-w-14"><path fill="currentColor" d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z" class=""></path></svg>
								</span>
							</span>
						</th>

						<!-- TODO WIP - issue PIN-2877 -->
						<th class="is-sortable">
							<span class="is-relative">
								{{ $t('First Name') }}
								<span class="icon sort-icon is-small is-desc is-invisible ml-1">
									<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-arrow-up fa-w-14"><path fill="currentColor" d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z" class=""></path></svg>
								</span>
							</span>
						</th>

						<!-- TODO WIP - issue PIN-2877 -->
						<th class="is-sortable">
							<span class="is-relative">
								{{ $t('ID Type') }}
								<span class="icon sort-icon is-small is-desc is-invisible ml-1">
									<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-arrow-up fa-w-14"><path fill="currentColor" d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z" class=""></path></svg>
								</span>
							</span>
						</th>

						<!-- TODO WIP - issue PIN-2877 -->
						<th class="is-sortable">
							<span class="is-relative">
								{{ $t('ID Number') }}
								<span class="icon sort-icon is-small is-desc is-invisible ml-1">
									<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-arrow-up fa-w-14"><path fill="currentColor" d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z" class=""></path></svg>
								</span>
							</span>
						</th>

						<th>{{ $t('Records From File') }} / {{ $t('Humansis') }}</th>

						<th class="has-text-right">
							{{ $t('Use Record From') }}
						</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="({
							itemId,
							memberDuplicities,
							duplicityCandidateId,
							toUpdateLoading,
							toLinkLoading,
							state,
						}, duplicityKey) of duplicities"
						:key="duplicityKey"
						class="resolve-table"
					>
						<td class="td-width-30">
							<div
								v-for="({ reasons, originFullName }, index) in memberDuplicities"
								:key="`member-${index}`"
								class="mb-3"
							>
								<!-- TODO WIP - issue PIN-2877 -->
								<strong>{{ originFullName.split(" ")[1] }}</strong>
							</div>
						</td>

						<td class="td-width-30">
							<div
								v-for="({ reasons, originFullName }, index) in memberDuplicities"
								:key="`member-${index}`"
								class="mb-3"
							>
								<!-- TODO WIP - issue PIN-2877 -->
								<strong>{{ originFullName.split(" ")[0] }}</strong>
								<!--
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
								-->
							</div>
						</td>

						<td class="td-width-30">
							<!-- TODO WIP - issue PIN-2877 -->
							National ID
						</td>

						<td class="td-width-30">
							<!-- TODO WIP - issue PIN-2877 -->
							{{ Math.floor(Math.random()*1000000000) }}
						</td>

						<td class="td-width-30">
							<!-- TODO WIP - issue PIN-2877 -->
							Vulnerability: - / soloParent
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
										'is-info button-to-update',
										state === consts.ITEM_STATE.DUPLICITY_KEEP_OURS ? '' : 'is-outlined'
									]"
									:disabled="toUpdateLoading || toLinkLoading"
									:loading="toUpdateLoading"
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
									:disabled="toUpdateLoading || toLinkLoading"
									:loading="toLinkLoading"
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
