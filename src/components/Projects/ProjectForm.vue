<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				:label="$t('Project Name')"
				:type="validateType('name')"
				:message="validateMsg('name')"
			>
				<b-input
					v-model="formModel.name"
					:disabled="formDisabled"
					@blur="validate('name')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Internal ID') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.internalId"
					:disabled="formDisabled"
					@blur="validate('internalId')"
				/>
			</b-field>

			<b-field
				:label="$t('Sectors')"
				:type="validateType('selectedSectors')"
				:message="validateMsg('selectedSectors')"
			>
				<MultiSelect
					v-model="formModel.selectedSectors"
					searchable
					label="code"
					track-by="value"
					multiple
					:placeholder="$t('Click to select')"
					:disabled="formDisabled"
					:options="options.sectors"
					:loading="sectorsLoading"
					:class="validateMultiselect('selectedSectors')"
					@select="validate('selectedSectors')"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
					<template #option="props">
						<div class="option__desc">
							<span class="option__title">{{ normalizeText(props.option.value) }}</span>
						</div>
					</template>
					<template #tag="props">
						<MultiSelectTag
							:props="props"
							:items="formModel.selectedSectors"
							@optionRemoved="formModel.selectedSectors = $event"
						/>
					</template>
				</MultiSelect>
			</b-field>

			<b-field
				:label="$t('Start Date')"
				:type="validateType('startDate')"
				:message="validateMsg('startDate')"
			>
				<b-datepicker
					v-model="formModel.startDate"
					show-week-number
					icon="calendar-day"
					trap-focus
					locale="en-CA"
					:month-names="months()"
					:placeholder="$t('Click to select')"
					:disabled="formDisabled"
					@input="validate('startDate')"
				/>
			</b-field>

			<b-field
				:label="$t('End Date')"
				:type="validateType('endDate')"
				:message="validateMsg(
					'endDate',
					$t('Required and must be greater than Start Date'))"
			>
				<b-datepicker
					v-model="formModel.endDate"
					show-week-number
					icon="calendar-day"
					trap-focus
					locale="en-CA"
					:month-names="months()"
					:placeholder="$t('Click to select')"
					:disabled="formDisabled"
					@input="validate('endDate')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Donors') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<MultiSelect
					v-model="formModel.selectedDonors"
					searchable
					label="fullname"
					track-by="id"
					multiple
					:placeholder="$t('Click to select')"
					:disabled="formDisabled"
					:options="options.donors"
					:loading="donorsLoading"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
					<template #singleLabel v-slot:default="option">
						{{ option.shortname }}
					</template>
				</MultiSelect>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Target Type') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<MultiSelect
					v-model="formModel.selectedTargetType"
					label="value"
					track-by="code"
					:placeholder="$t('Click to select')"
					:options="options.targetTypes"
					:searchable="false"
					:disabled="formDisabled"
					:loading="targetTypesLoading"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
					<template #option="props">
						<div class="option__desc">
							<span class="option__title">{{ normalizeText(props.option.value) }}</span>
						</div>
					</template>
					<template #singleLabel="props">
						<div class="option__desc">
							<span class="option__title">{{ normalizeText(props.option.value) }}</span>
						</div>
					</template>
				</MultiSelect>
			</b-field>

			<b-field
				:label="$t('Total Target')"
				class="total-target-field"
				:type="validateType('totalTarget')"
				:message="validateMsg('totalTarget', $t('Required. Min length is 1'))"
			>
				<b-numberinput
					v-model="formModel.totalTarget"
					type="is-dark"
					expanded
					min="0"
					:disabled="formDisabled"
					:controls="false"
					@input="validate('totalTarget')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Local Invoice Address') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.projectInvoiceAddressLocal"
					:disabled="formDisabled"
					@blur="validate('projectInvoiceAddressLocal')"
				/>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('English Invoice Address') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.projectInvoiceAddressEnglish"
					:disabled="formDisabled"
					@blur="validate('projectInvoiceAddressEnglish')"
				/>
			</b-field>

			<b-field
				:label="$t('Allowed Product Category Types')"
				:type="validateType('allowedProductCategoryTypes')"
				:message="validateMsg('allowedProductCategoryTypes', $t('Required. Atleast 1 category'))"
				:addons="false"
			>
				<div
					v-for="item of options.allowedProductCategoryTypes"
					class="mb-3"
					:key="`product-category-type-${item}`"
				>
					<b-checkbox
						v-model="formModel.allowedProductCategoryTypes"
						:native-value="item"
						:disabled="formDisabled"
						@blur="validate('allowedProductCategoryTypes')"
					>
						<div class="is-flex is-align-items-center">
							{{ $t(item) }}
							<SvgIcon class="ml-2" :items="[{code: item, value: item}]" />
						</div>
					</b-checkbox>
				</div>
			</b-field>

			<b-field>
				<template #label>
					{{ $t('Notes') }}
					<span class="optional-text has-text-weight-normal is-italic">
						- {{ $t('Optional') }}
					</span>
				</template>
				<b-input
					v-model="formModel.notes"
					type="textarea"
					:disabled="formDisabled"
				/>
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button v-if="closeButton" @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="!formDisabled"
				tag="input"
				type="is-primary"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>
import { required, minValue } from "vuelidate/lib/validators";
import DonorService from "@/services/DonorService";
import SectorsService from "@/services/SectorsService";
import AssistancesService from "@/services/AssistancesService";
import { Notification } from "@/utils/UI";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import Validation from "@/mixins/validation";
import { normalizeText } from "@/utils/datagrid";
import MultiSelectTag from "@/components/MultiSelectTag";
import SvgIcon from "@/components/SvgIcon";
import calendarHelper from "@/mixins/calendarHelper";

const minDate = (endDate, formModel) => new Date(endDate) > new Date(formModel.startDate);

export default {
	name: "ProjectForm",

	components: {
		MultiSelectTag,
		SvgIcon,
	},

	mixins: [Validation, calendarHelper],

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
		formDisabled: Boolean,
	},

	data() {
		return {
			options: {
				sectors: [],
				donors: [],
				targetTypes: [],
				allowedProductCategoryTypes: [
					"Food", "Non-Food", "Cashback",
				],
			},
			sectorsLoading: true,
			donorsLoading: true,
			targetTypesLoading: true,
		};
	},

	validations: {
		formModel: {
			name: { required },
			internalId: {},
			selectedSectors: { required },
			startDate: { required },
			endDate: {
				required,
				minValue: minDate,
			},
			selectedDonors: {},
			selectedTargetType: {},
			totalTarget: { required, minValue: minValue(1) },
			projectInvoiceAddressLocal: {},
			projectInvoiceAddressEnglish: {},
			allowedProductCategoryTypes: { required },
		},
	},

	mounted() {
		this.fetchSectors();
		this.fetchDonors();
		this.fetchTargetTypes();
	},

	methods: {
		normalizeText(value) {
			return normalizeText(value);
		},

		submitForm() {
			this.$v.$touch();
			if (this.$v.$invalid) {
				return;
			}

			this.$emit("formSubmitted", this.formModel);
			this.$v.$reset();
		},

		closeForm() {
			this.$emit("formClosed");
			this.$v.$reset();
		},

		async fetchSectors() {
			await SectorsService.getListOfSectors().then(({ data }) => {
				this.options.sectors = data;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Sectors")} ${e}`, "is-danger");
			});
			this.formModel.selectedSectors = getArrayOfCodeListByKey(this.formModel.sectors, this.options.sectors, "code", true, "code");
			this.sectorsLoading = false;
		},

		async fetchDonors() {
			await DonorService.getListOfDonors().then(({ data }) => {
				this.options.donors = data;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Donors")} ${e}`, "is-danger");
			});

			this.formModel.selectedDonors = getArrayOfCodeListByKey(this.formModel.donorIds, this.options.donors, "id");
			this.donorsLoading = false;
		},

		async fetchTargetTypes() {
			await AssistancesService.getTargetTypes().then(({ data }) => {
				this.options.targetTypes = data;
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Target Types")} ${e}`, "is-danger");
			});

			this.formModel.selectedTargetType = getArrayOfCodeListByKey(this.formModel.targetTypes, this.options.targetTypes, "code");
			this.targetTypesLoading = false;
		},
	},
};
</script>

<style>
.total-target-field .b-numberinput input[type=number] {
	text-align: left !important;
}
</style>
