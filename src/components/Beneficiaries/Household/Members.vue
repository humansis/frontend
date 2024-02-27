<template>
	<form>
		<v-expansion-panels
			ref="members"
			v-model="isOpen"
			variant="accordion"
		>
			<v-expansion-panel
				v-for="(member, index) of members"
				:key="index"
				eager
			>
				<v-expansion-panel-title>
					<v-chip color="success" variant="flat" label>{{ index + 1 }}</v-chip>

					<span class="ml-3">{{ memberTitle(member) }}</span>

					<template v-slot:actions="{ expanded }">
						<div class="d-flex align-center">
							<v-btn
								:data-cy="identifierBuilder(`member-${index + 1}-form-remove-button`)"
								icon="trash"
								color="error"
								variant="tonal"
								size="x-small"
								class="mr-4"
								@click="onRemoveMember(index)"
							/>

							<v-icon :icon="expanded ? 'arrow-up' : 'arrow-down'" />
						</div>
					</template>
				</v-expansion-panel-title>

				<v-expansion-panel-text class="pt-4">
					<HouseholdHeadForm
						ref="member"
						:show-type-of-beneficiary="false"
						:is-editing="!!member"
						:detailOfHousehold="detailOfHousehold"
						:beneficiary="member"
						:members-smart-card-numbers="smartCardNumbers[index]"
						:data-cy="`member-${index + 1}-form`"
					/>
				</v-expansion-panel-text>
			</v-expansion-panel>
		</v-expansion-panels>

		<v-btn
			class="my-4"
			color="success"
			prepend-icon="plus"
			@click="onAddMember"
		>
			{{ $t('New') }}
		</v-btn>
	</form>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import HouseholdHeadForm from "@/components/Beneficiaries/Household/HouseholdHeadForm";
import identifierBuilder from "@/mixins/identifierBuilder";
import { Notification } from "@/utils/UI";

export default {
	name: "Members",

	components: {
		HouseholdHeadForm,
	},

	mixins: [identifierBuilder],

	props: {
		detailOfHousehold: {
			type: Object,
			default: null,
		},

		isEditing: {
			type: Boolean,
			default: false,
		},
	},

	emits: ["loaded"],

	data() {
		return {
			isOpen: 0,
			members: [],
			smartCardNumbers: [],
		};
	},

	watch: {
		detailOfHousehold(household) {
			this.mapDetailOfHouseholdToFormModel(household);
		},
	},

	async created() {
		if (this.isEditing) {
			await this.mapDetailOfHouseholdToFormModel();
		}
		this.$emit("loaded");
	},

	methods: {
		async mapDetailOfHouseholdToFormModel() {
			const promises = [];
			this.detailOfHousehold.beneficiaryIds.forEach((id) => {
				if (this.detailOfHousehold.householdHeadId !== id) {
					const beneficiaryPromise = BeneficiariesService.getBeneficiary(id).then((data) => {
						this.members.push(data);
					});
					promises.push(beneficiaryPromise);

					const smartCardPromise = BeneficiariesService.getSmartCard(id).then(({ data }) => {
						this.smartCardNumbers.push(data);
					});
					promises.push(smartCardPromise);
				}
			});

			try {
				await Promise.all(promises);
				this.reloadMemberForm();
			} catch (e) {
				Notification(`${this.$t("Members")} ${e.message || e}`, "error");
			}
		},

		reloadMemberForm() {
			if (this.$refs.member) {
				this.$refs.member.forEach((form) => {
					form.map();
				});
			}
		},

		onAddMember() {
			const countOfMembers = this.members.length;

			if (countOfMembers && !this.$refs.member[countOfMembers - 1].submit()) {
				this.isOpen = countOfMembers - 1;
				return;
			}

			this.isOpen = countOfMembers;
			this.members.push({
				enParentsName: null,
				gender: null,
				nationalIds: [],
				phoneIds: [],
				residencyStatus: null,
				referralType: null,
				referralComment: null,
				isHead: false,
				vulnerabilityCriteria: [],
				id: null,
				dateOfBirth: null,
				localFamilyName: null,
				localGivenName: null,
				localParentsName: null,
				enFamilyName: null,
				enGivenName: null,
				householdId: null,
				isArchived: false,
			});
		},

		memberTitle(member) {
			return member?.id && this.isEditing
				? `${this.$t("ID")} ${member.id}: ${member.localFamilyName} ${member.localGivenName}`
				: this.$t("Member");
		},

		onRemoveMember(index) {
			this.members.splice(index, 1);
		},

		submit() {
			const members = [];
			let result = 0;

			if (!this.$refs.member) {
				return members;
			}

			this.$refs.member.forEach((form) => {
				if (form.submit()) {
					result += 1;
				}
			});

			if (result === this.$refs.member.length) {
				this.$refs.member.forEach((form) => {
					members.push(form.formModel);
				});

				return members;
			}

			return false;
		},
	},
};
</script>
