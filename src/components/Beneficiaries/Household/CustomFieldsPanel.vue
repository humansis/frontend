<template>
	<v-expansion-panels
		ref="customFieldsPanel"
		variant="accordion"
		class="my-4"
		:data-cy="identifierBuilder('custom-fields-panel')"
	>
		<v-expansion-panel eager>
			<v-expansion-panel-title>
				<h4 class="ml-3" :data-cy="identifierBuilder('custom-fields-text')">
					{{ $t("Custom Fields") }}
				</h4>

				<template v-slot:actions="{ expanded }">
					<div class="d-flex align-center">
						<v-icon :icon="expanded ? 'arrow-up' : 'arrow-down'" />
					</div>
				</template>
			</v-expansion-panel-title>

			<v-expansion-panel-text class="pt-4">
				<v-row class="mt-2">
					<v-col
						v-for="option in customFields"
						:key="option.id"
						cols="12"
						sm="6"
						md="4"
						lg="4"
					>
						<DataSelect
							v-if="isInputTypeList(option.type)"
							v-model="modelValue.customFields[option.id]"
							:items="getOptionsForCustomField(option.allowedValues)"
							:multiple="option.isMultiSelect"
							:chips="option.isMultiSelect"
							:loading="assetsLoading"
							:label="normalizeText(option.field)"
							:name="normalizeName(option.field)"
							:data-cy="prepareComponentIdentifier()"
							class="mb-4"
							optional
						/>

						<DataInput
							v-else
							v-model="modelValue.customFields[option.id]"
							:label="normalizeText(option.field)"
							:name="normalizeName(option.field)"
							:type="option.type"
							:hide-spin-buttons="option.type === 'number' ? true : null"
							:data-cy="prepareComponentIdentifier()"
							class="mb-4"
							optional
						/>
					</v-col>
				</v-row>
			</v-expansion-panel-text>
		</v-expansion-panel>
	</v-expansion-panels>
</template>

<script>
import CustomFieldsService from "@/services/CustomFieldsService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import identifierBuilder from "@/mixins/identifierBuilder";
import { kebabize, normalizeCustomFields } from "@/utils/datagrid";
import { checkResponseStatus } from "@/utils/fetcher";
import { Notification } from "@/utils/UI";
import { COUNTRY_SETTINGS } from "@/consts";

export default {
	name: "CustomFieldsPanel",

	components: {
		DataInput,
		DataSelect,
	},

	mixins: [identifierBuilder],

	props: {
		modelValue: {
			type: Object,
			required: true,
		},

		filters: {
			type: Object,
			default: () => {},
		},

		dataCy: {
			type: String,
			required: true,
		},
	},

	data() {
		return {
			customFields: [],
		};
	},

	async created() {
		await this.fetchCustomFields();
	},

	methods: {
		async fetchCustomFields() {
			try {
				const {
					data: { data },
					status,
					message,
				} = await CustomFieldsService.getListOfCustomFields(
					null,
					null,
					null,
					null,
					this.filters,
				);

				checkResponseStatus(status, message);

				this.customFields = data;
			} catch (e) {
				Notification(`${this.$t("Custom Fields:")} ${e.message || e}`, "error");
			}
		},

		isInputTypeList(type) {
			return type === COUNTRY_SETTINGS.CUSTOM_FIELDS.LIST_TYPE_CODE;
		},

		getOptionsForCustomField(values) {
			return values.length ? values : [];
		},

		normalizeText(text) {
			return normalizeCustomFields(text);
		},

		normalizeName(text) {
			return kebabize(text);
		},
	},
};
</script>
