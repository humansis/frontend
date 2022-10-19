<template>
	<form>
		<section class="modal-card-body">
			<b-field :label="$t('Name')">
				<AssistanceName
					:form-model="formModel"
					ref="assistanceName"
				/>
			</b-field>

			<LocationForm
				v-if="!editing"
				ref="locationForm"
				form-disabled
				:form-model="formModel"
			/>

			<b-field class="mt-2" :label="$t('Date of Assistance')">
				<b-datepicker
					v-model="formModel.dateDistribution"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					:max-date="maxDateOfAssistance"
					:month-names="months()"
					:placeholder="$t('Click to select')"
					:disabled="!editing"
				/>
			</b-field>

			<b-field v-if="isCommoditySmartCard" :label="$t('Expiration Date')">
				<b-datepicker
					v-model="formModel.dateExpiration"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					:min-date="formModel.dateDistribution"
					:max-date="maxDateOfAssistance"
					:month-names="months()"
					:placeholder="$t('Click to select')"
					:disabled="!editing"
				/>
			</b-field>

			<b-field
				v-if="editing"
				:label="$t('Round')"
			>
				<MultiSelect
					v-model="formModel.round"
					searchable
					label="value"
					track-by="code"
					:placeholder="$t('N/A')"
					:options="options.rounds"
				>
					<span slot="noOptions">{{ $t("List is empty")}}</span>
					<template #option="props">
						<div class="option__desc">
							<span class="option__title">{{ props.option.value }}</span>
						</div>
					</template>
					<template #singleLabel="props">
						<div class="option__desc">
							<span class="option__title">{{ props.option.value }}</span>
						</div>
					</template>
				</MultiSelect>
			</b-field>

			<b-field :label="$t('Target')">
				<b-input v-model="formModel.target" disabled />
			</b-field>

			<b-field
				v-if="isCommoditySmartCard"
				:label="$t('Allowed Product Category Types')"
				:addons="false"
			>
				<div
					v-for="item of project.allowedProductCategoryTypes"
					:key="`product-category-type-${item}`"
				>
					<b-checkbox
						v-model="formModel.allowedProductCategoryTypes"
						disabled
						:native-value="item"
					>
						<div class="is-flex is-align-items-center">
							{{ item }}
							<SvgIcon class="ml-2" :items="[{code: item, value: item}]" />
						</div>
					</b-checkbox>
				</div>
			</b-field>

			<b-field
				v-if="formModel.cashbackLimit && isCommoditySmartCard"
				:label="$t('Cashback Limit')"
			>
				<b-input v-model="formModel.cashbackLimit" disabled />
			</b-field>
		</section>
		<footer class="modal-card-foot">
			<b-button @click="closeForm">
				{{ $t('Close') }}
			</b-button>
			<b-button
				v-if="editing"
				class="is-primary"
				@click="submitForm"
			>
				{{ $t('Update') }}
			</b-button>
		</footer>
	</form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import AssistanceName from "@/components/Assistance/AssistanceName";
import LocationForm from "@/components/LocationForm";
import SvgIcon from "@/components/SvgIcon";
import consts from "@/utils/assistanceConst";
import calendarHelper from "@/mixins/calendarHelper";

export default {
	name: "AssistanceForm",

	mixins: [calendarHelper],

	components: {
		AssistanceName,
		LocationForm,
		SvgIcon,
	},

	data() {
		return {
			options: {
				rounds: consts.ROUNDS_OPTIONS,
				allowedProductCategoryTypes: [
					"Food", "Non-Food", "Cashback",
				],
			},
		};
	},

	props: {
		formModel: Object,
		editing: Boolean,
		project: {
			type: Object,
			default: () => {},
		},
	},

	computed: {
		maxDateOfAssistance() {
			const { endDate } = this.project;
			return new Date(endDate);
		},

		isCommoditySmartCard() {
			return this.formModel?.commodity[0]?.code === consts.COMMODITY.SMARTCARD;
		},
	},

	validations: {
		formModel: {
			name: { required },
		},
	},

	methods: {
		submitForm() {
			this.$v.$touch();
			const isValid = !this.$v.$invalid && this.$refs.assistanceName.isValid();
			const data = { ...this.formModel };
			data.round = this.formModel.round?.code;

			if (isValid) {
				this.$emit("formSubmitted", data);
				this.closeForm();
			}
		},

		closeForm() {
			this.$emit("formClosed");
		},
	},
};
</script>
