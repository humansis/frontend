<template>
	<div>
		<b-steps
			v-model="activeStep"
			:animated="true"
			:rounded="true"
			:has-navigation="true"
		>
			<b-step-item step="1" label="Household">
				<Household ref="household" />
			</b-step-item>

			<b-step-item step="2" label="Household Head">
				<HouseholdForm ref="householdHead" show-type-of-beneficiary />
			</b-step-item>

			<b-step-item step="3" label="Members">
				<Members ref="householdMembers" />
			</b-step-item>

			<b-step-item step="4" label="Summary">
				<Summary
					ref="householdSummary"
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
						Save
					</b-button>
				</div>
			</template>
		</b-steps>
	</div>
</template>

<script>
import HouseholdForm from "@/components/Beneficiaries/Household/HouseholdForm";
import Household from "@/components/Beneficiaries/Household/Household";
import Members from "@/components/Beneficiaries/Household/Members";
import Summary from "@/components/Beneficiaries/Household/Summary";
import BeneficiariesService from "@/services/BeneficiariesService";
import { Toast } from "@/utils/UI";

export default {
	name: "HouseholdTabs",

	props: {
		isEditing: Boolean,
	},

	components: {
		HouseholdForm,
		Household,
		Members,
		Summary,
	},

	data() {
		return {
			activeStep: 0,
			household: null,
			householdHead: [],
			householdMembers: [],
			summaryMembers: [],
			selectedProjects: [],
		};
	},

	methods: {
		close() {
			this.$router.go(-1);
		},

		nextPage(next) {
			switch (this.activeStep) {
				case 0:
					if (this.$refs.household.submit()) {
						this.household = this.$refs.household.formModel;
						next.action();
					}
					break;
				case 1:
					if (this.$refs.householdHead.submit()) {
						this.householdHead = this.$refs.householdHead.formModel;
						next.action();
					}
					break;
				case 2:
					if (this.$refs.householdMembers.submit()) {
						this.householdMembers = this.$refs.householdMembers.members;
						this.prepareMembers(this.$refs.householdMembers.members);
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
				id,
				shelterType: shelterStatus,
				livelihood: {
					livelihood, assets, incomeLevel, debtLevel, foodConsumptionScore,
					copingStrategiesIndex,
				},
				externalSupport: {
					externalSupportReceivedType,
					supportDateReceived,
					supportOrganization: supportOrganizationName,
				},
				notes,
			} = this.household;

			const householdBody = {
				livelihood,
				assets: [...assets],
				shelterStatus,
				projectIds: [...this.selectedProjects],
				notes,
				longitude: "string",
				latitude: "string",
				beneficiaries: [
					{
						dateOfBirth: "2000-12-01T00:00:00.000Z",
						localFamilyName: "string",
						localGivenName: "string",
						enFamilyName: "string",
						enlGivenName: "string",
						gender: "M",
						nationalIdCards: [
							{
								idNumber: "022-33-1547",
								idType: "national_id",
							},
						],
						phones: [
							{
								prefix: 420,
								number: 123456789,
								type: "Landline",
								proxy: true,
							},
						],
						referralType: "string",
						referralComment: "string",
						status: 1,
						vulnerabilityCriteriaIds: [
							0,
						],
					},
				],
				incomeLevel,
				foodConsumptionScore,
				copingStrategiesIndex,
				debtLevel,
				supportDateReceived,
				supportReceivedTypes: [...externalSupportReceivedType],
				supportOrganizationName,
				incomeSpentOnFood: 0,
				houseIncome: 0,
				householdLocations: [
					{
						number: "string",
						street: "string",
						postcode: "string",
						adm1Id: 0,
						adm2Id: 0,
						adm3Id: 0,
						adm4Id: 0,
					},
					{
						tentNumber: "string",
						camp: {
							name: "string",
							adm1Id: 0,
							adm2Id: 0,
							adm3Id: 0,
							adm4Id: 0,
						},
					},
				],
			};

			if (
				this.$refs.householdSummary.submit()
				&& this.$refs.householdSummary.selectedProjects.length
			) {
				if (this.isEditing && id) {
					this.updateHousehold(id, householdBody);
				} else {
					this.createHousehold(householdBody);
				}
			}
		},

		updateHousehold() {
			// TODO Update Household
		},

		async createHousehold(householdBody) {
			await BeneficiariesService.createHousehold(householdBody).then((response) => {
				if (response.status === 200) {
					Toast("Household Successfully Created", "is-success");
					this.$refs.projectList.fetchData();
				}
			}).catch((e) => {
				Toast(`(Household) ${e}`, "is-danger");
			});
		},

		prepareMembers(members) {
			const membersData = [];
			if (members.length) {
				members.forEach((member) => {
					membersData.push({
						firstName: member.nameLocal.firstName,
						familyName: member.nameLocal.familyName,
						gender: member.personalInformation.gender,
						dateBirth: member.personalInformation.dateOfBirth,
						phone: `${member.phone1.ext} ${member.phone1.phoneNo}`,
						nationalId: member.id.idNumber,
					});
				});
			}

			this.summaryMembers = [...membersData];
		},
	},
};
</script>
