<template>
	<v-row class="mt-2">
		<v-col cols="12" lg="6">
			<v-row>
				<v-col cols="6">
					<DataSelect
						v-model="bulkSearch.searchBy"
						:items="options.idType"
						:error-messages="validationMsg('searchBy', 'bulkSearch')"
						class="search-by"
						label="Search by"
						name="filter-select"
						@update:modelValue="onBulkSearchChanged"
					/>
				</v-col>

				<v-col cols="6">
					<v-card color="info" class="pa-4">
						{{ $t('Split ID Numbers with white space') }}.
						{{ $t('Maximum 500 ID Numbers allowed') }}.
					</v-card>
				</v-col>

				<v-col cols="12">
					<DataTextarea
						v-model.trim="bulkSearch.ids"
						:error-messages="validationMsg('ids', 'bulkSearch')"
						label="ID Numbers"
						name="filter-input"
						@input="onBulkSearchChanged"
					/>

					<div v-if="isMaximumIds || isDuplicityIds">
						<p
							v-if="isMaximumIds"
							class="text-red-lighten-1"
						>
							{{ $t('There are more than 500 ID Numbers') }}
						</p>
						<p
							v-if="isDuplicityIds"
							class="text-red-lighten-1"
						>
							{{ $t('Info: There are duplicate ID Numbers') }}
						</p>
					</div>
				</v-col>
			</v-row>
		</v-col>

		<v-col v-if="bulkSearch.notFoundIds.length" cols="12" lg="6">
			<DataTextarea
				v-model="bulkSearch.notFoundIds"
				label="Following ID Numbers were not found:"
				name="not-found-ids"
				class="not-found-ids"
				disabled
				has-copy-button
				@copy="onCopyIds"
			/>
		</v-col>

		<v-col cols="12" class="text-right">
			<v-btn
				:disabled="isMaximumIds"
				color="primary"
				prepend-icon="search"
				class="text-none ml-0"
				@click="onStartBulkSearch"
			>
				{{ $t('Search') }}
			</v-btn>
		</v-col>
	</v-row>
</template>

<script>
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import DataTextarea from "@/components/Inputs/DataTextarea";
import validation from "@/mixins/validation";
import { Notification } from "@/utils/UI";
import { HOUSEHOLD } from "@/consts";
import { required } from "@vuelidate/validators";

export default {
	name: "BulkSearch",

	components: {
		DataTextarea,
		DataInput,
		DataSelect,
	},

	mixins: [validation],

	validations() {
		return {
			bulkSearch: {
				searchBy: { required },
				ids: { required },
			},
		};
	},

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
		onCopyIds() {
			navigator.clipboard.writeText(this.bulkSearch.notFoundIds);
			Notification(this.$t("Copied"), "success");
		},

		onStartBulkSearch() {
			this.v$.$touch();
			if (this.v$.$invalid) {
				return;
			}

			this.bulkSearch.ids = this.arrayIds
				.filter((value, index) => this.arrayIds.indexOf(value) === index).join(" ");

			this.bulkSearch.isBulkSearchUsed = true;
			this.$emit("clickedBulkSearch", this.bulkSearch);

			this.v$.$reset();
		},

		onBulkSearchChanged() {
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
.search-by {
	align-self: baseline;

	@media only screen and (min-width: 1440px) {
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
