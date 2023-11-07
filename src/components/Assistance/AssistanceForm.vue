<template>
	<form>
		<section class="modal-card-body">
			<h3 class="title is-4">{{ $t('Basic properties') }}</h3>
			<AssistanceName
				v-model="formModel.name"
				ref="assistanceName"
				:is-switch-disabled="isAssistanceValidated"
				:data-for-assistance-name="dataForAssistanceName"
				assistance-detail
			/>
			<p
				v-if="influenceDistributionProtocol.assistanceName"
				class="help is-danger"
			>
				{{ distributionProtocolMessage }}
			</p>

			<LocationForm
				ref="locationForm"
				is-editing
				:form-model="formModel"
				:disabled-adm="disabledAdmInput"
				:influence-distribution-protocol="influenceDistributionProtocol"
				:distribution-protocol-message="distributionProtocolMessage"
				@locationChanged="valuesForAssistanceName"
			/>

			<b-field class="mt-2" :label="$t('Date of Assistance')">
				<b-datepicker
					v-model="formModel.dateDistribution"
					show-week-number
					locale="en-CA"
					icon="calendar-day"
					trap-focus
					:min-date="minDateOfAssistance"
					:max-date="maxDateOfAssistance"
					:month-names="months()"
					:placeholder="$t('Click to select')"
					:disabled="!isAssistanceNew"
					@input="valuesForAssistanceName"
				/>
			</b-field>

			<b-field
				:label="$t('Round')"
			>
				<MultiSelect
					v-model="formModel.round"
					searchable
					label="value"
					track-by="code"
					:placeholder="$t('N/A')"
					:disabled="isAssistanceValidated"
					:select-label="$t('Press enter to select')"
					:selected-label="$t('Selected')"
					:deselect-label="$t('Press enter to remove')"
					:options="options.rounds"
					@input="valuesForAssistanceName"
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

			<p
				v-if="influenceDistributionProtocol.round"
				class="help is-danger"
			>
				{{ distributionProtocolMessage }}
			</p>

			<h3 class="title is-4 mt-5">{{ $t('Target') }}</h3>
			<b-field :label="$t('Sector')">
				<b-input v-model="formModel.sector" disabled />
			</b-field>

			<b-field :label="$t('Subsector')">
				<b-input v-model="subSectorName" disabled />
			</b-field>

			<b-field :label="$t('Assistance Type')">
				<b-input v-model="formModel.type" disabled />
			</b-field>

			<b-field :label="$t('Target')">
				<b-input v-model="formModel.target" disabled />
			</b-field>

			<b-field
				:label="$t('Note')"
			>
				<b-input
					v-model.trim="formModel.note"
					type="textarea"
					:placeholder="$t('Type…')"
				/>
			</b-field>

			<h3 class="title is-4 mt-5">{{ $t('Selection Criteria') }}</h3>
			<div class="columns">
				<div class="column is-8">
					<b-field :label="$t('Scoring')">
						<b-input v-model="scoringType" disabled />
					</b-field>
				</div>

				<div class="column is-4 is-flex pl-0">
					<div class="is-flex-grow-1">
						<b-field :label="$t('Minimum Vulnerability Score')">
							<b-input v-model="minimumVulnerabilityScore" disabled />
						</b-field>
					</div>
				</div>
			</div>

			<h3
				v-if="isCommoditySmartCard"
				class="title is-4 mt-5"
			>
				{{ $t('Distributed Commodity') }}
			</h3>
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
					:disabled="!isAssistanceNew"
				/>
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
import AssistancesService from "@/services/AssistancesService";
import SectorsService from "@/services/SectorsService";
import AssistanceName from "@/components/Assistance/AssistanceName";
import LocationForm from "@/components/LocationForm";
import SvgIcon from "@/components/SvgIcon";
import calendarHelper from "@/mixins/calendarHelper";
import { Notification } from "@/utils/UI";
import { ASSISTANCE } from "@/consts";

export default {
	name: "AssistanceForm",

	components: {
		AssistanceName,
		LocationForm,
		SvgIcon,
	},

	mixins: [calendarHelper],

	validations: {
		formModel: {
			name: { required },
		},
	},

	props: {
		formModel: Object,
		editing: Boolean,

		assistance: {
			type: Object,
			default: () => {},
		},

		project: {
			type: Object,
			default: () => {},
		},
	},

	data() {
		return {
			options: {
				rounds: ASSISTANCE.ROUNDS_OPTIONS,
				allowedProductCategoryTypes: [
					"Food", "Non-Food", "Cashback",
				],
			},
			dataForAssistanceName: {},
			defaultScoringType: AssistancesService.getDefaultScoringType(),
			subSectorName: "",
			influenceDistributionProtocol: {
				assistanceName: false,
				subDistrict: false,
				village: false,
				round: false,
			},
		};
	},

	computed: {
		maxDateOfAssistance() {
			const { endDate } = this.project;
			return new Date(`${endDate} 00:00`);
		},

		minDateOfAssistance() {
			const { startDate } = this.project;
			return new Date(`${startDate} 00:00`);
		},

		isCommoditySmartCard() {
			return this.formModel?.commodity[0]?.code === ASSISTANCE.COMMODITY.SMARTCARD;
		},

		isAssistanceNew() {
			return this.assistance.state.code === ASSISTANCE.STATUS.NEW;
		},

		isAssistanceValidated() {
			return this.assistance.state.code === ASSISTANCE.STATUS.VALIDATED;
		},

		isAssistanceClosed() {
			return this.assistance.state.code === ASSISTANCE.STATUS.CLOSED;
		},

		disabledAdmInput() {
			return {
				adm1: true,
				adm2: true,
				adm3: this.isAssistanceValidated,
				adm4: this.isAssistanceValidated,
			};
		},

		isDataModifiedForDistributionProtocol() {
			return Object.values(this.influenceDistributionProtocol).some((value) => value === true);
		},

		distributionProtocolMessage() {
			return this.$t("By changing data on a closed distribution, you may create a discrepancy"
				+ " between data in Humansis and data in the signed distribution protocol. Please "
				+ "give your name and provide reasoning for the change in the Note section of the "
				+ "distribution to serve for auditing purposes.");
		},

		scoringType() {
			if (!this.isAssistanceTargetInstitution) {
				return this.assistance.scoringBlueprint?.name || this.defaultScoringType.name;
			}

			return this.$t("N/A");
		},

		minimumVulnerabilityScore() {
			return this.assistance.threshold || "";
		},

		isAssistanceTargetInstitution() {
			return this.assistance.target.toLowerCase() === ASSISTANCE.TARGET.INSTITUTION;
		},
	},

	watch: {
		"formModel.name": function assistanceName(value) {
			this.influenceDistributionProtocol.assistanceName = this.assistance.name !== value
				&& this.isAssistanceClosed;
		},
		"formModel.adm3.name": function subDistrictName(value) {
			this.influenceDistributionProtocol.subDistrict = this.assistance.adm3?.name !== value
				&& this.isAssistanceClosed;
		},
		"formModel.adm4.name": function villageName(value) {
			this.influenceDistributionProtocol.village = this.assistance.adm4?.name !== value
				&& this.isAssistanceClosed;
		},
		"formModel.round.value": function roundValue(value) {
			this.influenceDistributionProtocol.round = this.assistance.round !== value
				&& this.isAssistanceClosed;
		},
		"formModel.dateDistribution": function dateDistribution(value) {
			if (this.isCommoditySmartCard && this.formModel.dateExpiration < value) {
				this.formModel.dateExpiration = value;
			}
		},
	},

	created() {
		this.valuesForAssistanceName();
		this.fetchSubsectors();
	},

	methods: {
		async fetchSubsectors() {
			await SectorsService.getListOfSubSectors(this.formModel.sector)
				.then(({ data }) => {
					this.findSubsectorName(data);
				})
				.catch((e) => {
					if (e.message) Notification(`${this.$t("Subsectors")} ${e}`, "is-danger");
				});
		},

		findSubsectorName(data) {
			this.subSectorName = data.find(({ code }) => code === this.formModel.subsector).value || "";
		},

		submitForm() {
			this.$v.$touch();
			const isValid = !this.$v.$invalid && this.$refs.assistanceName.isValid();

			const data = {
				id: this.formModel.id,
				note: this.formModel.note,
				...(!this.isAssistanceValidated && {
					name: this.formModel.name,
					round: this.formModel.round?.code,
					locationId: this.formModel.locationId,
				}),
				...(this.isAssistanceNew && {
					dateDistribution: this.formModel.dateDistribution,
					dateExpiration: this.formModel.dateExpiration,
				}),
			};

			if (isValid) {
				if (this.isDataModifiedForDistributionProtocol) {
					this.confirmUpdate(data);
				} else {
					this.$emit("formSubmitted", data);
					this.closeForm();
				}
			}
		},

		closeForm() {
			this.$emit("formClosed");
		},

		confirmUpdate(data) {
			const message = this.$t("By changing data on a closed distribution, you may create"
				+ " a discrepancy between data in Humansis and data in the signed distribution "
				+ "protocol. Please check you gave your name and provided reasoning for the change "
				+ "in the Note section of the distribution to serve for auditing purposes.");

			this.$buefy.dialog.confirm({
				title: this.$t("Do you really want to apply the change?"),
				message,
				confirmText: this.$t("Yes"),
				cancelText: this.$t("No"),
				type: "is-warning",
				hasIcon: true,
				onConfirm: () => {
					this.$emit("formSubmitted", data);
					this.closeForm();
				},
			});
		},

		valuesForAssistanceName() {
			const {
				adm1,
				adm2,
				adm3,
				adm4,
				dateDistribution,
				round,
			} = this.formModel;

			this.dataForAssistanceName = {
				adm1,
				adm2,
				adm3,
				adm4,
				dateOfAssistance: dateDistribution,
				round,
			};
		},
	},
};
</script>
