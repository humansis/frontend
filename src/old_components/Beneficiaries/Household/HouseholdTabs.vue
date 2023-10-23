<template>
	<card-component class="has-multiselect">
		<b-progress :value="100" />
		<CustomSteps
			v-model="activeStep"
			ref="customSteps"
			animated
			rounded
			has-navigation
			@stepsChanged="stepsChanged"
		>
			<b-step-item step="1" :label="$t('Household')">
				<HouseholdForm
					v-if="steps[1]"
					ref="householdForm"
					:is-editing="isEditing"
					:detailOfHousehold="detailOfHousehold"
					@loaded="loading[1] = false"
				/>
			</b-step-item>

			<b-step-item step="2" :label="$t('Household Head')">
				<HouseholdHeadForm
					v-if="steps[2]"
					ref="householdHeadForm"
					is-household-head
					show-type-of-beneficiary
					:is-editing="isEditing"
					:detailOfHousehold="detailOfHousehold"
					@loaded="loading[2] = false"
				/>
			</b-step-item>

			<b-step-item step="3" :label="$t('Members')">
				<Members
					v-if="steps[3]"
					ref="householdMembers"
					:is-editing="isEditing"
					:detailOfHousehold="detailOfHousehold"
					@loaded="loading[3] = false"
				/>
			</b-step-item>

			<b-step-item step="4" :label="$t('Summary')">
				<Summary
					v-if="steps[4]"
					ref="householdSummary"
					:detailOfHousehold="detailOfHousehold"
					:members="summaryMembers"
					:livelihood="livelihood"
					:address="address"
					:location="location"
					:is-editing="isEditing"
					@loaded="loading[4] = false"
				/>
			</b-step-item>
			<template #navigation="{previous, next}">
				<div class="buttons flex-end">
					<b-button
						v-show="!previous.disabled"
						@click.prevent="previous.action"
					>
						{{ $t('Back') }}
					</b-button>
					<b-button
						type="is-primary"
						:disabled="next.disabled"
						@click.prevent="nextPage(next)"
					>
						{{ $t('Next') }}
					</b-button>
					<b-button
						v-if="activeStep === 3 && userCan.editBeneficiary"
						type="is-primary"
						icon-left="save"
						:loading="saveButtonLoading"
						@click="save"
					>
						{{ isEditing ? $t('Update') : $t('Save') }}
					</b-button>
				</div>
			</template>
		</CustomSteps>
	</card-component>
</template>

<script>
import { mapState } from "vuex";
import BeneficiariesService from "@/services/BeneficiariesService";
import CustomSteps from "@/components/Beneficiaries/Household/CustomSteps";
import HouseholdForm from "@/components/Beneficiaries/Household/HouseholdForm";
import HouseholdHeadForm from "@/components/Beneficiaries/Household/HouseholdHeadForm";
import Members from "@/components/Beneficiaries/Household/Members";
import Summary from "@/components/Beneficiaries/Household/Summary";
import CardComponent from "@/components/CardComponent";
import permissions from "@/mixins/permissions";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import { Notification, Toast } from "@/utils/UI";
import { GENERAL } from "@/consts";

export default {
	name: "HouseholdTabs",

	components: {
		CardComponent,
		HouseholdHeadForm,
		HouseholdForm,
		Members,
		Summary,
		CustomSteps,
	},

	mixins: [permissions],

	props: {
		isEditing: Boolean,

		detailOfHousehold: {
			type: Object,
			default: () => {},
		},

		isLoaded: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			activeStep: 0,
			household: null,
			householdHead: null,
			householdMembers: [],
			summaryMembers: [],
			selectedProjects: [],
			livelihood: "",
			location: "",
			address: "",
			saveButtonLoading: false,
			steps: {
				1: false,
				2: false,
				3: false,
				4: false,
			},
			loading: {
				1: true,
				2: false,
				3: false,
				4: false,
			},
		};
	},

	computed: {
		...mapState(["country"]),

		formLoading() {
			return !Object.values(this.loading).every((value) => !value);
		},
	},

	watch: {
		isLoaded(value) {
			if (value) {
				Object.keys(this.steps).forEach((key) => {
					this.steps[key] = true;
				});
			}
		},
	},

	created() {
		if (!this.isEditing) {
			this.steps[1] = true;
		}
	},

	methods: {
		stepsChanged(active, next) {
			let lastAvailableStep = 1;

			if (active.step < next.step) {
				if (this.$refs.householdForm.submit()) {
					this.household = this.$refs.householdForm.formModel;
					this.livelihood = this.prepareLivelihoodForSummary();
					this.address = this.prepareAddressForSummary();
					this.location = this.prepareLocationForSummary();
					lastAvailableStep = 2;

					if (this.$refs.householdHeadForm?.submit()
					) {
						this.householdHead = this.$refs.householdHeadForm.formModel;
						lastAvailableStep = 3;

						const members = this.$refs.householdMembers?.submit();

						if (members) {
							this.householdMembers = members;
							this.prepareSummaryMembers(
								[this.householdHead, ...members],
							);
							this.address = this.prepareAddressForSummary();
							this.location = this.prepareLocationForSummary();
							lastAvailableStep = 4;
						}
					}
				}

				const step = (Number(next.step) <= lastAvailableStep)
					? Number(next.step)
					: lastAvailableStep;
				this.changeStep(step);
			} else {
				this.changeStep(next.step);
			}
		},

		changeStep(stepId) {
			this.$refs.customSteps.changeStep(Number(stepId));
			this.loading[stepId] = !this.steps[stepId];
			this.steps[stepId] = true;
		},

		close() {
			this.$router.push({ name: "Households" });
		},

		nextPage(next) {
			this.steps[this.activeStep + 2] = true;
			let members = null;

			switch (this.activeStep) {
				case 0:
					if (this.$refs.householdForm.submit()) {
						this.household = this.$refs.householdForm.formModel;
						this.livelihood = this.prepareLivelihoodForSummary();
						this.address = this.prepareAddressForSummary();
						this.location = this.prepareLocationForSummary();
						next.action();
					}
					break;
				case 1:
					if (this.$refs.householdHeadForm.submit()) {
						this.householdHead = this.$refs.householdHeadForm.formModel;
						next.action();
					}
					break;
				case 2:
					members = this.$refs.householdMembers?.submit();

					if (members) {
						this.householdMembers = members;
						this.prepareSummaryMembers(
							[this.householdHead, ...members],
						);
						next.action();
					}
					break;
				case 3:
					next.action();
					break;
				default:
			}
		},

		save() {
			if (
				!this.$refs.householdSummary.submit()
				|| !this.$refs.householdMembers?.submit()
				|| !this.$refs.householdHeadForm?.submit()
				|| !this.$refs.householdForm.submit()
			) {
				Notification(`${this.$t("Some required fields are not filled")}`, "is-danger");
				return;
			}

			const {
				shelterStatus,
				livelihood: {
					livelihood, assets, incomeLevel, debtLevel,
					foodConsumptionScore, copingStrategiesIndex,
					incomeSpentOnFood,
				},
				externalSupport: {
					externalSupportReceivedType,
					supportDateReceived,
					supportOrganization: supportOrganizationName,
				},
				notes,
				currentLocation,
			} = this.household;

			const householdBody = {
				iso3: this.country.iso3,
				livelihood: livelihood?.code,
				assets: getArrayOfIdsByParam(assets, "code"),
				shelterStatus: shelterStatus?.code,
				projectIds: getArrayOfIdsByParam(this.$refs.householdSummary.formModel.selectedProjects, "id"),
				notes,
				enumeratorName: this.$refs.householdSummary.formModel.enumerator,
				longitude: this.household.longitude,
				latitude: this.household.latitude,
				beneficiaries: this.mapBeneficiariesForBody(
					[this.householdHead, ...this.householdMembers],
				),
				incomeLevel,
				foodConsumptionScore,
				copingStrategiesIndex,
				debtLevel,
				supportDateReceived: supportDateReceived ? supportDateReceived.toISOString() : null,
				supportReceivedTypes: getArrayOfIdsByParam(externalSupportReceivedType, "code"),
				supportOrganizationName,
				incomeSpentOnFood,
				houseIncome: 0,
				countrySpecificAnswers:
					this.prepareCountrySpecificsForHousehold(this.household.customFields),
				...this.prepareAddressForHousehold(currentLocation),
			};

			if (this.$refs.householdSummary.submit()) {
				if (this.isEditing && this.$route.params.householdId) {
					this.updateHousehold(this.$route.params.householdId, householdBody);
				} else {
					this.createHousehold(householdBody);
				}
			}
		},

		prepareCountrySpecificsForHousehold(countrySpecificAnswers) {
			const preparedAnswers = [];
			Object.keys(countrySpecificAnswers).forEach((key) => {
				preparedAnswers.push({
					countrySpecificId: Number(key),
					answer: `${countrySpecificAnswers[key]}`,
				});
			});
			return preparedAnswers;
		},

		async updateHousehold(id, householdBody) {
			this.saveButtonLoading = true;

			await BeneficiariesService.updateHousehold(id, householdBody).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Household Successfully Updated"), "is-success");
					this.$router.push({ name: "Households" });
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Household")} ${e}`, "is-danger");
			});

			this.saveButtonLoading = false;
		},

		async createHousehold(householdBody) {
			this.saveButtonLoading = true;

			await BeneficiariesService.createHousehold(householdBody).then((response) => {
				if (response.status === 200) {
					Toast(this.$t("Household Successfully Created"), "is-success");
					this.$router.push({ name: "Households" });
				}
			}).catch((e) => {
				if (e.message) Notification(`${this.$t("Household")} ${e}`, "is-danger");
			});

			this.saveButtonLoading = false;
		},

		prepareSummaryMembers(members) {
			const membersData = [];
			if (members.length) {
				members.forEach((member) => {
					if (member) {
						const phone = member.phone1.phoneNo.length
							? `${member.phone1.ext?.code} ${member.phone1.phoneNo}`
							: this.$t("None");

						membersData.push({
							firstName: member.nameLocal.firstName,
							familyName: member.nameLocal.familyName,
							parentsName: member.nameLocal.parentsName,
							gender: member.personalInformation.gender,
							dateBirth: member.personalInformation.dateOfBirth,
							phone,
							nationalId: member.primaryId.idNumber,
						});
					}
				});
			}

			this.summaryMembers = [...membersData];
		},

		prepareLivelihoodForSummary() {
			return this.household.livelihood.livelihood?.value;
		},

		prepareAddressForSummary() {
			const {
				typeOfLocation,
				campName,
				tentNumber,
				number,
				street,
				postcode,
			} = this.household.currentLocation;
			if (typeOfLocation.code === GENERAL.LOCATION_TYPE.camp.code) {
				return `${campName}, ${tentNumber}`;
			}
			return `${number}, ${street}, ${postcode}`;
		},

		prepareLocationForSummary() {
			const {
				adm1,
				adm2,
				adm3,
				adm4,
			} = this.household.currentLocation;
			let preparedLocation = adm1.name;

			preparedLocation += adm2 ? `, ${adm2.name}` : "";
			preparedLocation += adm3 ? `, ${adm3.name}` : "";
			preparedLocation += adm4 ? `, ${adm4.name}` : "";

			return preparedLocation;
		},

		prepareAddressForHousehold(
			{
				typeOfLocation,
				number,
				postcode,
				street,
				campName,
				tentNumber,
				camp,
				locationId,
			},
		) {
			const address = {};
			if (typeOfLocation.code === GENERAL.LOCATION_TYPE.camp.code) {
				address.campAddress = {
					tentNumber,
					camp: {
						name: campName || camp?.name,
						locationId: locationId || camp?.locationId,
					},
				};
			} else if (typeOfLocation.code === GENERAL.LOCATION_TYPE.residence.code) {
				address.residenceAddress = {
					number: number || null,
					street: street || null,
					postcode: postcode || null,
					locationId,
				};
			} else if (typeOfLocation.code === GENERAL.LOCATION_TYPE.temporarySettlement.code) {
				address.temporarySettlementAddress = {
					number: number || null,
					street: street || null,
					postcode: postcode || null,
					locationId,
				};
			}
			return address;
		},

		mapBeneficiariesForBody(beneficiaries) {
			const beneficiariesData = [];

			if (beneficiaries.length) {
				beneficiaries.forEach((beneficiary) => {
					const preparedBeneficiary = {
						id: beneficiary.beneficiaryId,
						dateOfBirth: beneficiary.personalInformation.dateOfBirth.toISOString(),
						localFamilyName: beneficiary.nameLocal.familyName,
						localGivenName: beneficiary.nameLocal.firstName,
						localParentsName: beneficiary.nameLocal.parentsName,
						enFamilyName: beneficiary.nameEnglish.familyName,
						enGivenName: beneficiary.nameEnglish.firstName,
						enParentsName: beneficiary.nameEnglish.parentsName,
						gender: beneficiary.personalInformation.gender.code,
						phones: [],
						residencyStatus: beneficiary.residencyStatus.code,
						isHead: beneficiary.isHead,
						vulnerabilityCriteria: this.mapVulnerabilities(beneficiary.vulnerabilities),
					};

					if (beneficiary.primaryId.idNumber || beneficiary.primaryId.idType) {
						preparedBeneficiary.nationalIdCards = [
							{
								number: beneficiary.primaryId.idNumber,
								type: beneficiary.primaryId.idType.code,
								priority: 1,
							}];

						if (beneficiary.secondaryId.idNumber || beneficiary.secondaryId.idType) {
							preparedBeneficiary.nationalIdCards.push(
								{
									number: beneficiary.secondaryId.idNumber,
									type: beneficiary.secondaryId.idType.code,
									priority: 2,
								},
							);

							if (beneficiary.tertiaryId.idNumber || beneficiary.tertiaryId.idType) {
								preparedBeneficiary.nationalIdCards.push(
									{
										number: beneficiary.tertiaryId.idNumber,
										type: beneficiary.tertiaryId.idType.code,
										priority: 3,
									},
								);
							}
						}
					}

					if (beneficiary.addAReferral) {
						preparedBeneficiary.referralType = beneficiary.referral.referralType.code;
						preparedBeneficiary.referralComment = beneficiary.referral.comment;
					}

					if (beneficiary.phone1.phoneNo !== "") {
						preparedBeneficiary.phones.push({
							prefix: beneficiary.phone1.ext.code,
							number: beneficiary.phone1.phoneNo,
							type: beneficiary.phone1.type.code,
							proxy: beneficiary.phone1.proxy,
						});
					}
					if (beneficiary.phone2.phoneNo !== "") {
						const phone2 = {
							prefix: beneficiary.phone2.ext.code,
							number: beneficiary.phone2.phoneNo,
							type: beneficiary.phone2.type.code,
							proxy: beneficiary.phone2.proxy,
						};
						preparedBeneficiary.phones.push(phone2);
					}
					beneficiariesData.push(preparedBeneficiary);
				});

				beneficiariesData[0].status = 1;
			}

			return beneficiariesData;
		},

		mapVulnerabilities(vulnerabilities) {
			const result = [];
			Object.keys(vulnerabilities).forEach((key) => {
				if (vulnerabilities[key]) {
					result.push(key);
				}
			});
			return result;
		},
	},
};
</script>
