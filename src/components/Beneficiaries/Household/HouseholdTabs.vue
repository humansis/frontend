<template>
	<div>
		<b-steps
			v-model="activeStep"
			animated
			rounded
			has-navigation
		>
			<b-step-item step="1" label="Household">
				<HouseholdForm :detailOfHousehold="detailOfHousehold" ref="householdForm" />
			</b-step-item>

			<b-step-item step="2" label="Household Head">
				<HouseholdHeadForm
					ref="householdHeadForm"
					show-type-of-beneficiary
					:is-editing="isEditing"
					:detailOfHousehold="detailOfHousehold"
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
				/>
			</b-step-item>
			<template
				v-if="true"
				slot="navigation"
				slot-scope="{previous, next}"
			>
				<div class="buttons flex-end">
					<b-button
						type="is-danger is-light"
						:disabled="previous.disabled"
						@click.prevent="previous.action"
					>
						Back
					</b-button>
					<b-button
						type="is-success"
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
	</div>
</template>

<script>
import HouseholdHeadForm from "@/components/Beneficiaries/Household/HouseholdHeadForm";
import HouseholdForm from "@/components/Beneficiaries/Household/HouseholdForm";
import Members from "@/components/Beneficiaries/Household/Members";
import Summary from "@/components/Beneficiaries/Household/Summary";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Toast, Notification } from "@/utils/UI";

export default {
	name: "HouseholdTabs",

	props: {
		isEditing: Boolean,
	},

	components: {
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
		};
	},

	created() {
		if (this.isEditing) {
			this.getDetailOfHousehold(this.$route.params.householdId);
		}
	},

	methods: {
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
			// TODO Mapping form models to householdBody
			const {
				shelterType,
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
				currentLocation: {
					addressNumber, addressPostCode, addressStreet,
					adm1Id: { id: adm1Id }, adm2Id: { id: adm2Id },
					adm3Id: { id: adm3Id }, adm4Id: { id: adm4Id },
					campName, tentNumber,
				},
			} = this.household;

			const householdBody = {
				livelihood,
				assets: [...assets],
				shelterStatus: shelterType,
				projectIds: [...this.selectedProjects],
				notes,
				// TODO Resolve longitude and latitude
				longitude: "string",
				latitude: "string",
				beneficiaries: this.mapBeneficiariesForBody(
					[this.householdHead, ...this.householdMembers],
				),
				incomeLevel,
				foodConsumptionScore,
				copingStrategiesIndex,
				debtLevel,
				supportDateReceived: new Date(supportDateReceived).toISOString(),
				supportReceivedTypes: [...externalSupportReceivedType],
				supportOrganizationName,
				// TODO Resolve incomeSpentOnFood and houseIncome
				incomeSpentOnFood: 0,
				houseIncome: 0,
				householdLocations: [
					{
						number: addressNumber,
						street: addressStreet,
						postcode: addressPostCode,
						adm1Id,
						adm2Id,
						adm3Id,
						adm4Id,
					},
					this.mapCampResidenceForBody({ campName, tentNumber }),
				],
			};

			if (this.$refs.householdSummary.submit()) {
				if (this.isEditing && this.$route.params.householdId) {
					this.updateHousehold(this.$route.params.householdId, householdBody);
				} else {
					this.createHousehold(householdBody);
				}
			}
		},

		async updateHousehold(id, householdBody) {
			await BeneficiariesService.updateHousehold(id, householdBody).then((response) => {
				if (response.status === 200) {
					Toast("Household Successfully Updated", "is-success");
				}
			}).catch((e) => {
				Notification(`Household ${e}`, "is-danger");
			});
		},

		async createHousehold(householdBody) {
			await BeneficiariesService.createHousehold(householdBody).then((response) => {
				if (response.status === 200) {
					Toast("Household Successfully Created", "is-success");
				}
			}).catch((e) => {
				Notification(`Household ${e}`, "is-danger");
			});
		},

		async getDetailOfHousehold(id) {
			this.$store.commit("loading", true);

			await BeneficiariesService.getDetailOfHousehold(id).then((response) => {
				this.detailOfHousehold = response;
			}).catch((e) => {
				Notification(`Household ${e}`, "is-danger");
			});

			this.$store.commit("loading", false);
		},

		prepareSummaryMembers(members) {
			const membersData = [];

			if (members.length) {
				members.forEach((member) => {
					membersData.push({
						firstName: member.nameLocal.firstName,
						familyName: member.nameLocal.familyName,
						parentsName: member.nameLocal.parentsName,
						gender: member.personalInformation.gender,
						dateBirth: member.personalInformation.dateOfBirth,
						phone: `${member.phone1.ext} ${member.phone1.phoneNo}`,
						nationalId: member.id.idNumber,
					});
				});
			}

			this.summaryMembers = [...membersData];
		},

		mapBeneficiariesForBody(beneficiaries) {
			const beneficiariesData = [];

			if (beneficiaries.length) {
				beneficiaries.forEach((beneficiary) => {
					beneficiariesData.push({
						dateOfBirth: new Date(beneficiary.personalInformation.dateOfBirth).toISOString(),
						localFamilyName: beneficiary.nameLocal.familyName,
						localGivenName: beneficiary.nameLocal.firstName,
						localParentsName: beneficiary.nameLocal.parentsName,
						enFamilyName: beneficiary.nameEnglish.familyName,
						enlGivenName: beneficiary.nameEnglish.firstName,
						enParentsName: beneficiary.nameEnglish.parentsName,
						gender: beneficiary.personalInformation.gender,
						nationalIdCards: [
							{
								idNumber: beneficiary.id.idNumber,
								idType: beneficiary.id.idType,
							},
						],
						phones: [
							{
								prefix: beneficiary.phone1.ext,
								number: beneficiary.phone1.phoneNo,
								type: beneficiary.phone1.type,
								proxy: beneficiary.phone1.proxy,
							},
							{
								prefix: beneficiary.phone2.ext,
								number: beneficiary.phone2.phoneNo,
								type: beneficiary.phone2.type,
								proxy: beneficiary.phone2.proxy,
							},
						],
						referralType: beneficiary.referral.referralType,
						referralComment: beneficiary.referral.comment,
						status: 0,
						vulnerabilityCriteriaIds: beneficiary.vulnerabilities,
					});
				});

				beneficiariesData[0].status = 1;
			}

			return beneficiariesData;
		},

		mapCampResidenceForBody({ campName, tentNumber }) {
			return {
				tentNumber,
				camp: {
					name: campName,
					adm1Id: 0,
					adm2Id: 0,
					adm3Id: 0,
					adm4Id: 0,
				},
			};
		},
	},
};
</script>
