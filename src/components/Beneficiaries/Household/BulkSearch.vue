<template>
	<section>
		<div class="px-5 columns">
			<div class="column">
				<b-field
					:label="$t('Search by')"
					:type="validateType('searchBy', false, 'bulkSearch')"
					:message="validateMsg('searchBy', 'Required', 'bulkSearch')"
					class="bulk-search-field"
				>
					<MultiSelect
						v-model="bulkSearch.searchBy"
						:select-label="$t('Press enter to select')"
						:selected-label="$t('Selected')"
						:deselect-label="$t('Press enter to remove')"
						:placeholder="$t('Click to select')"
						:loading="false"
						:options="options.idType"
						:class="validateMultiselect('searchBy', false, 'bulkSearch')"
						class="search-by"
						searchable
						@input="bulkSearchChanged"
					>
						<span slot="noOptions">{{ $t("List is empty")}}</span>
						<template #option="{ option }">
							<div class="option__desc">
								<span class="option__title">{{ $t(option) }}</span>
							</div>
						</template>
					</MultiSelect>
					<b-message type="is-info" class="bulk-search-info">
						{{ $t('Split ID Numbers with white space') }}.
						{{ $t('Maximum 500 ID Numbers allowed') }}.
					</b-message>

				</b-field>
				<b-field
					:label="$t('ID Numbers')"
					:type="validateType('ids', false, 'bulkSearch')"
					:message="validateMsg('ids', 'Required', 'bulkSearch')"
					class="mb-5"
				>
					<b-input
						v-model.trim="bulkSearch.ids"
						type="textarea"
						@input="bulkSearchChanged"
					/>
				</b-field>

				<div v-if="isMaximumIds || isDuplicityIds">
					<p
						v-if="isMaximumIds"
						class="has-text-danger"
					>
						{{ $t('There are more than 500 Ids')}}
					</p>
					<p
						v-if="isDuplicityIds"
						class="has-text-danger"
					>
						{{ $t('Info: there are duplicate ID Numbers')}}
					</p>
				</div>
			</div>

			<div class="column ml-5">
				<div v-if="bulkSearch.notFoundIds.length">
					<b-field :label="$t('Following ID Numbers were not found:')">
						<b-input
							v-model="bulkSearch.notFoundIds"
							type="textarea"
							class="not-found-ids"
							disabled
						/>
						<div class="control">
							<b-tooltip :label="$t(`Copy`)">
								<b-button icon-left="copy" @click="copyIds()" />
							</b-tooltip>
						</div>
					</b-field>
				</div>
			</div>
		</div>

		<div class="has-text-right mr-5 mb-5">
			<b-button
				type="is-primary"
				icon-left="search"
				:disabled="isMaximumIds"
				@click="startBulkSearch()"
			>
				{{ $t('Search') }}
			</b-button>
		</div>
	</section>
</template>

<script>
import validation from "@/mixins/validation";
import { HOUSEHOLD } from "@/consts";
import { Toast } from "@/utils/UI";
import { required } from "vuelidate/lib/validators";

export default {
	name: "BulkSearch",

	mixins: [validation],

	data() {
		return {
			options: {
				idType: [...Object.values(HOUSEHOLD.BULK_SEARCH)],
			},
			bulkSearch: {
				isBulkSearchUsed: false,
				searchBy: "",
				ids: "",
				notFoundIds: "",
			},
		};
	},

	validations() {
		return {
			bulkSearch: {
				searchBy: { required },
				ids: { required },
			},
		};
	},

	computed: {
		arrayIds() {
			return this.bulkSearch.ids.split(/\s+/);
		},

		isDuplicityIds() {
			const uniqueIds = new Set(this.arrayIds);

			return this.arrayIds.length !== uniqueIds.size;
		},

		isMaximumIds() {
			return this.arrayIds.length > 500;
		},
	},

	methods: {
		copyIds() {
			navigator.clipboard.writeText(this.bulkSearch.notFoundIds);
			Toast(this.$t("Copied"), "is-success", 1500);
		},

		startBulkSearch() {
			this.$v.$touch();
			if (this.$v.$invalid) { return; }

			this.bulkSearch.ids = this.arrayIds
				.filter((value, index) => this.arrayIds.indexOf(value) === index).join(" ");

			this.bulkSearch.isBulkSearchUsed = true;
			this.$emit("clickedBulkSearch", this.bulkSearch);

			this.$v.$reset();
		},

		bulkSearchChanged() {
			this.$emit("bulkSearchChanged");
		},

		resetFilters() {
			this.bulkSearch = {
				isBulkSearchUsed: false,
				searchBy: "",
				ids: "",
				notFoundIds: "",
			};
		},
	},
};
</script>

<style lang="scss">
.search-by  {
	align-self: baseline;
}

.bulk-search-field > .field-body > .field.has-addons {
	flex-direction: column;
}

.bulk-search-info {
	margin-top: 1rem;
}

@media only screen and (min-width: 1200px) {
	.bulk-search-field > .field-body > .field.has-addons {
		flex-direction: row;
	}

	.bulk-search-info {
		margin-top: 0;
		margin-left: 1rem;
	}
}

@media only screen and (min-width: 1440px) {
	.search-by {
		width: 50%;
	}

}

.not-found-ids {
	width: 45vw;

	textarea {
		min-height: 5.5rem !important;
	}
}
</style>
