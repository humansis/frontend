<template>
	<v-stepper
		v-model="activeStep"
		:items="steps"
		hide-actions
		editable
		alt-labels
		@update:modelValue="onStepsChanged"
	>
		<template v-slot:icon="{ step }">
			<v-icon :icon="`${step}`" />
		</template>

		<template v-slot:item.1>
			<h3
				:data-cy="identifierBuilder('household-form-household-text')"
				class="mb-3"
			>
				{{ $t('Household') }}
			</h3>

			<HouseholdForm
				ref="householdForm"
				:detail-of-household="detailOfHousehold"
				:is-editing="isEditing"
				@loaded="loading[1] = false"
			/>
		</template>

		<template v-slot:item.2>
			<h3
				:data-cy="identifierBuilder('household-head-form-household-head-text')"
				class="mb-3"
			>
				{{ $t('Household Head') }}
			</h3>

			<HouseholdHeadForm
				ref="householdHeadForm"
				:detail-of-household="detailOfHousehold"
				:is-editing="isEditing"
				is-household-head
				show-type-of-beneficiary
				@loaded="loading[2] = false"
			/>
		</template>

		<template v-slot:item.3>
			<h3
				:data-cy="identifierBuilder('members-form-members-text')"
				class="mb-3"
			>
				{{ $t('Members') }}
			</h3>

			<Members
				ref="householdMembers"
				:is-editing="isEditing"
				:detail-of-household="detailOfHousehold"
				@loaded="loading[3] = false"
			/>
		</template>

		<template v-slot:item.4>
			<h3
				:data-cy="identifierBuilder('summary-form-summary-text')"
				class="mb-3"
			>
				{{ $t('Summary') }}
			</h3>

			<HouseholdSummary
				ref="householdSummary"
				:detail-of-household="detailOfHousehold"
				:members="summaryMembers"
				:livelihood="livelihood"
				:address="address"
				:location="location"
				:is-editing="isEditing"
				@loaded="loading[4] = false"
			/>
		</template>

		<template v-slot:default="{ prev, next }">
			<v-stepper-actions class="mt-n4">
				<template v-slot:prev>
					<v-btn
						:disabled="activeStep === 1"
						:color="activeStep === 1 ? 'blue-grey-lighten-0' : 'blue-grey-lighten-4'"
						:data-cy="identifierBuilder('form-back-button')"
						variant="elevated"
						prepend-icon="angle-left"
						class="text-none"
						@click="prev"
					>
						{{ $t('Back') }}
					</v-btn>
				</template>

				<template v-slot:next>
					<v-btn
						v-if="activeStep === 4"
						:disabled="!userCan.editBeneficiary"
						:loading="saveButtonLoading"
						:data-cy="identifierBuilder('form-save-button')"
						color="primary"
						variant="elevated"
						prepend-icon="save"
						class="text-none"
						@click="onSave"
					>
						{{ $t(isEditing ? 'Update' : 'Save') }}
					</v-btn>

					<v-btn
						v-else
						:disabled="false"
						:data-cy="identifierBuilder('form-next-button')"
						color="primary"
						variant="elevated"
						append-icon="angle-right"
						class="text-none"
						@click="next"
					>
						{{ $t('Next') }}
					</v-btn>
				</template>
			</v-stepper-actions>
		</template>
	</v-stepper>
</template>

<script>
import { mapState } from "vuex";
import BeneficiariesService from "@/services/BeneficiariesService";
import HouseholdForm from "@/components/Beneficiaries/Household/HouseholdForm";
import HouseholdHeadForm from "@/components/Beneficiaries/Household/HouseholdHeadForm";
import HouseholdSummary from "@/components/Beneficiaries/Household/HouseholdSummary";
import Members from "@/components/Beneficiaries/Household/Members";
import identifierBuilder from "@/mixins/identifierBuilder";
import permissions from "@/mixins/permissions";
import { getArrayOfIdsByParam } from "@/utils/codeList";
import { Notification } from "@/utils/UI";
import { GENERAL } from "@/consts";

export default {
	name: "HouseholdTabs",

	components: {
		HouseholdHeadForm,
		HouseholdForm,
		Members,
		HouseholdSummary,
	},

	mixins: [permissions, identifierBuilder],

	props: {
		isEditing: {
			type: Boolean,
			default: false,
		},

		detailOfHousehold: {
			type: Object,
			default: null,
		},
	},

	data() {
		return {
			activeStep: 1,
			completedStep: 0,
			household: null,
			householdHead: null,
			householdMembers: [],
			summaryMembers: [],
			selectedProjects: [],
			livelihood: "",
			location: "",
			address: "",
			saveButtonLoading: false,
			dataCy: "",
			steps: [
				this.$t("Household"),
				this.$t("Household Head"),
				this.$t("Members"),
				this.$t("Summary"),
			],
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

	methods: {
		onStepsChanged(step) {
			let lastAvailableStep = 1;

			if (this.$refs.householdForm.submit()) {
				this.household = this.$refs.householdForm.formModel;
				this.livelihood = this.prepareLivelihoodForSummary();
				this.address = this.prepareAddressForSummary();
				this.location = this.prepareLocationForSummary();
				lastAvailableStep = 2;

				if (this.$refs.householdHeadForm?.submit()) {
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

			const nextStep = (Number(step) <= lastAvailableStep)
				? Number(step)
				: lastAvailableStep;
			this.changeStep(nextStep);
		},

		changeStep(stepId) {
			this.activeStep = stepId;
			this.loading[stepId] = !this.steps[stepId];
			// this.steps[stepId] = true;
		},

		close() {
			this.$router.push({ name: "Households" });
		},

		nextPage(next) {
			// this.steps[this.activeStep + 2] = true;
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

		onSave() {
			if (
				!this.$refs.householdSummary?.submit()
				|| !this.$refs.householdMembers?.submit()
				|| !this.$refs.householdHeadForm?.submit()
				|| !this.$refs.householdForm.submit()
			) {
				Notification(`${this.$t("Some required fields are not filled")}`, "error");
				return;
			}

			const {
				shelterStatus,
				livelihood: {
					livelihood,
					assets,
					incomeLevel,
					debtLevel,
					foodConsumptionScore,
					copingStrategiesIndex,
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
				incomeLevel: incomeLevel || null,
				foodConsumptionScore: foodConsumptionScore || null,
				copingStrategiesIndex: copingStrategiesIndex || null,
				debtLevel: debtLevel || null,
				supportDateReceived: supportDateReceived ? supportDateReceived.toISOString() : null,
				supportReceivedTypes: getArrayOfIdsByParam(externalSupportReceivedType, "code"),
				supportOrganizationName,
				incomeSpentOnFood: incomeSpentOnFood || null,
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
				const answer = countrySpecificAnswers[key];
				const isAnswerArray = Array.isArray(answer);

				if ((isAnswerArray && answer.length)
					|| (answer !== null && answer !== undefined && !isAnswerArray)) {
					preparedAnswers.push({
						countrySpecificId: Number(key),
						answer: String(answer),
					});
				}
			});

			return preparedAnswers;
		},

		async updateHousehold(id, householdBody) {
			this.saveButtonLoading = true;

			await BeneficiariesService.updateHousehold(id, householdBody).then((response) => {
				if (response.status === 200) {
					Notification(this.$t("Household Successfully Updated"), "success");
					this.$router.push({ name: "Households" });
				}
			}).catch((e) => {
				Notification(`${this.$t("Household")} ${e.message || e}`, "error");
			});

			this.saveButtonLoading = false;
		},

		async createHousehold(householdBody) {
			this.saveButtonLoading = true;

			await BeneficiariesService.createHousehold(householdBody).then((response) => {
				if (response.status === 200) {
					Notification(this.$t("Household Successfully Created"), "success");
					this.$router.push({ name: "Households" });
				}
			}).catch((e) => {
				Notification(`${this.$t("Household")} ${e.message || e}`, "error");
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
				camp,
				tentNumber,
				number,
				street,
				postcode,
			} = this.household.currentLocation;

			if (typeOfLocation.code === GENERAL.LOCATION_TYPE.camp.code) {
				return `${camp.name || campName}, ${tentNumber}`;
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
						name: camp?.name || campName,
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
					const customFieldValues = this.prepareCountrySpecificsForHousehold(
						beneficiary.customFields,
					);

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
						customFieldValues,
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
