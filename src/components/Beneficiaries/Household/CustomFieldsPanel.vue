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
						v-for="option in customFieldsList"
						:key="option.id"
						cols="12"
						sm="6"
						md="4"
						lg="4"
					>
						<DataSelect
							v-if="isInputTypeList(option.type)"
							v-model="modelValue.customFieldValues[option.id]"
							:items="getOptionsForCustomField(option.allowedValues)"
							:multiple="option.isMultiSelect"
							:chips="option.isMultiSelect"
							:label="normalizeText(option.label)"
							:name="normalizeName(option.label)"
							:data-cy="prepareComponentIdentifier()"
							class="mb-4"
							optional
						/>

						<DataInput
							v-else
							v-model="modelValue.customFieldValues[option.id]"
							:label="normalizeText(option.label)"
							:name="normalizeName(option.label)"
							:type="option.type"
							:hide-spin-buttons="option.type === 'number' || null"
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
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import identifierBuilder from "@/mixins/identifierBuilder";
import { kebabize, normalizeCustomFields } from "@/utils/datagrid";
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

		dataCy: {
			type: String,
			required: true,
		},

		customFieldsList: {
			type: Array,
			required: true,
		},
	},

	methods: {
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
