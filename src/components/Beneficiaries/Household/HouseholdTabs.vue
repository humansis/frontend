<template>
	<card-component v-if="!loading">
		<b-progress :value="100" />

		<b-steps
			v-model="activeStep"
			animated
			rounded
			has-navigation
		>
			<b-step-item step="1" label="Household">
				<HouseholdForm
					ref="householdForm"
					:is-editing="isEditing"
					:detailOfHousehold="detailOfHousehold"
				/>
			</b-step-item>

			<b-step-item step="2" label="Household Head">
				<HouseholdHeadForm
					ref="householdHeadForm"
					show-type-of-beneficiary
					:is-editing="isEditing"
					:detailOfHousehold="detailOfHousehold"
					:is-household-head="true"
				/>
			</b-step-item>

			<b-step-item step="3" label="Members">
				<Members :detailOfHousehold="detailOfHousehold" ref="householdMembers" />
			</b-step-item>

			<b-step-item step="4" label="Summary">
				<Summary
					ref="householdSummary"
					:detailOfHousehold="detailOfHousehold"
					:members="summaryMembers"
					:address="address"
					:location="location"
					:is-editing="isEditing"
				/>
			</b-step-item>
			<template
				v-if="true"
				#navigation="{previous, next}"
			>
				<div class="buttons flex-end">
					<b-button
						v-show="!previous.disabled"
						@click.prevent="previous.action"
					>
						Back
					</b-button>
					<b-button
						type="is-primary"
						:disabled="next.disabled"
						@click.prevent="nextPage(next)"
					>
						Next
					</b-button>
					<b-button
						v-if="activeStep === 3"
						type="is-danger"
						icon-left="save"
						@click="save"
					>
						{{ isEditing ? "Update" : "Save" }}
					</b-button>
				</div>
			</template>
		</b-steps>
	</card-component>
</template>

<script>
import { mapActions, mapState } from "vuex";
import HouseholdHeadForm from "@/components/Beneficiaries/Household/HouseholdHeadForm";
import HouseholdForm from "@/components/Beneficiaries/Household/HouseholdForm";
import Members from "@/components/Beneficiaries/Household/Members";
import Summary from "@/components/Beneficiaries/Household/Summary";
import BeneficiariesService from "@/services/BeneficiariesService";
import CardComponent from "@/components/CardComponent";
import { Toast, Notification } from "@/utils/UI";
import { getArrayOfIdsByParam } from "@/utils/codeList";

export default {
	name: "HouseholdTabs",

	props: {
		isEditing: Boolean,
	},

	components: {
		CardComponent,
		HouseholdHeadForm,
		HouseholdForm,
		Members,
		Summary,
	},

	data() {
		return {
			activeStep: 0,
			detailOfHousehold: null,
			household: null,
			householdHead: [],
			householdMembers: [],
			summaryMembers: [],
			selectedProjects: [],
			location: "",
			address: "",
			loading: true,
		};
	},

	computed: {
		...mapState(["country", "isAppLoading"]),
	},

	async created() {
		this.appLoading(true);
		if (this.isEditing) {
			await this.getDetailOfHousehold(this.$route.params.householdId);
		}
		this.loading = false;
		this.appLoading(false);
	},

	methods: {
		...mapActions(["appLoading"]),

		close() {
			this.$router.go(-1);
		},

		nextPage(next) {
			switch (this.activeStep) {
				case 0:
					if (this.$refs.householdForm.submit()) {
						this.household = this.$refs.householdForm.formModel;
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
					if (this.$refs.householdMembers.submit()) {
						this.householdMembers = this.$refs.householdMembers.members;
						this.prepareSummaryMembers(
							[this.householdHead, ...this.$refs.householdMembers.members],
						);
						this.address = this.prepareAddressForSummary();
						this.location = this.prepareLocationForSummary();
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
			if (!this.$refs.householdSummary.submit()) {
				return;
			}
			// TODO Mapping form models to householdBody
			const {
				shelterStatus,
				livelihood: {
					livelihood, assets, incomeLevel, debtLevel,
					foodConsumptionScore, copingStrategiesIndex,
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
				livelihood: livelihood.code,
				assets: getArrayOfIdsByParam(assets, "code"),
				shelterStatus: parseInt(shelterStatus.code, 10),
				projectIds: getArrayOfIdsByParam(this.$refs.householdSummary.formModel.selectedProjects, "id"),
				notes,
				// TODO Resolve longitude and latitude
				longitude: "",
				latitude: "",
				beneficiaries: this.mapBeneficiariesForBody(
					[this.householdHead, ...this.householdMembers],
				),
				incomeLevel: incomeLevel.code,
				foodConsumptionScore,
				copingStrategiesIndex,
				debtLevel,
				supportDateReceived: this.$moment(supportDateReceived).format("YYYY-MM-DD"),
				supportReceivedTypes: getArrayOfIdsByParam(externalSupportReceivedType, "code", true),
				supportOrganizationName,
				// TODO Resolve incomeSpentOnFood and houseIncome
				incomeSpentOnFood: 0,
				houseIncome: 0,
				countrySpecificAnswers:
					this.prepareCountrySpecificsForHousehold(this.household.countrySpecificOptions),
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
					answer: countrySpecificAnswers[key],
				});
			});
			return preparedAnswers;
		},

		async updateHousehold(id, householdBody) {
			await BeneficiariesService.updateHousehold(id, householdBody).then((response) => {
				if (response.status === 200) {
					Toast("Household Successfully Updated", "is-success");
					this.$router.push({ name: "Households" });
				}
			}).catch((e) => {
				Notification(`Household ${e}`, "is-danger");
			});
		},

		async createHousehold(householdBody) {
			await BeneficiariesService.createHousehold(householdBody).then((response) => {
				if (response.status === 200) {
					Toast("Household Successfully Created", "is-success");
					this.$router.push({ name: "Households" });
				}
			}).catch((e) => {
				Notification(`Household ${e}`, "is-danger");
			});
		},

		async getDetailOfHousehold(id) {
			// TODO Loading on data container

			await BeneficiariesService.getDetailOfHousehold(id).then((response) => {
				this.detailOfHousehold = response;
			}).catch((e) => {
				Notification(`Household ${e}`, "is-danger");
			});
		},

		prepareSummaryMembers(members) {
			const membersData = [];
			if (members.length) {
				members.forEach((member) => {
					const phone = member.phone ? `${member.phone1.ext.code} ${member.phone1.phoneNo}` : "none";
					membersData.push({
						firstName: member.nameLocal.firstName,
						familyName: member.nameLocal.familyName,
						parentsName: member.nameLocal.parentsName,
						gender: member.personalInformation.gender,
						dateBirth: member.personalInformation.dateOfBirth,
						phone,
						nationalId: member.id.idNumber,
					});
				});
			}

			this.summaryMembers = [...membersData];
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
			if (typeOfLocation.code === "camp") {
				return `${campName}, ${tentNumber}`;
			}
			return `${number}, ${street}, ${postcode}`;
		},

		prepareLocationForSummary() {
			const {
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
			} = this.household.currentLocation;
			let preparedLocation = adm1Id.name;
			if (adm2Id) {
				preparedLocation += `, ${adm2Id.name}`;
				if (adm3Id) {
					preparedLocation += `, ${adm3Id.name}`;
					if (adm4Id) {
						preparedLocation += `, ${adm4Id.name}`;
					}
				}
			}
			return preparedLocation;
		},

		prepareAddressForHousehold(
			{
				typeOfLocation,
				number,
				postcode,
				street,
				adm1Id,
				adm2Id,
				adm3Id,
				adm4Id,
				campName,
				tentNumber,
				camp,
			},
		) {
			let locationId = null;
			if (adm4Id) {
				locationId = adm4Id.locationId;
			} else if (adm3Id) {
				locationId = adm3Id.locationId;
			} else if (adm2Id) {
				locationId = adm2Id.locationId;
			} else if (adm1Id) {
				locationId = adm1Id.locationId;
			}
			const address = {};
			if (typeOfLocation.code === "camp") {
				address.campAddress = {
					tentNumber,
					camp: {
						name: camp?.name || campName,
						locationId: camp?.locationId || locationId,
					},
				};
			} else if (typeOfLocation.code === "residence") {
				address.residenceAddress = {
					number,
					street,
					postcode,
					locationId,
				};
			} else if (typeOfLocation.code === "temporary_settlement") {
				address.temporarySettlementAddress = {
					number,
					street,
					postcode,
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
						dateOfBirth: this.$moment(beneficiary.personalInformation.dateOfBirth).format("YYYY-MM-DD"),
						localFamilyName: beneficiary.nameLocal.familyName,
						localGivenName: beneficiary.nameLocal.firstName,
						localParentsName: beneficiary.nameLocal.parentsName,
						enFamilyName: beneficiary.nameEnglish.familyName,
						enGivenName: beneficiary.nameEnglish.firstName,
						enParentsName: beneficiary.nameEnglish.parentsName,
						gender: beneficiary.personalInformation.gender.code,
						nationalIdCards: [
							{
								number: beneficiary.id.idNumber,
								type: beneficiary.id.idType.code,
							},
						],
						phones: [],
						residencyStatus: beneficiary.residencyStatus.code,
						isHead: beneficiary.isHead,
						vulnerabilityCriteriaIds: this.mapVulnerabilities(beneficiary.vulnerabilities),
					};
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
					result.push(Number(key));
				}
			});
			return result;
		},
	},
};
</script>
