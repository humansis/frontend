<template>
	<div>
		<b-collapse
			v-for="(member, index) of members"
			ref="members"
			class="card has-multiselect"
			animation="slide"
			:key="index"
			:open="isOpen === index"
			@open="isOpen = index"
			@close="isOpen = -1"
		>
			<div
				slot="trigger"
				class="card-header"
				role="button"
			>
				<p class="card-header-title">
					<b-tag type="is-success" size="is-medium">{{ index + 1 }}</b-tag>
					<span class="ml-3">{{ memberTitle(member) }}</span>
				</p>
				<a class="card-header-icon">
					<b-button
						type="is-danger"
						class="is-light mr-4"
						@click="removeMember(index)"
					>
						<b-icon icon="trash" />
					</b-button>
					<b-icon :icon="isOpen === index ? 'arrow-up' : 'arrow-down'" />
				</a>
			</div>
			<div class="card-content">
				<div class="content">
					<HouseholdHeadForm
						ref="member"
						:show-type-of-beneficiary="false"
						:is-editing="!!member"
						:detailOfHousehold="detailOfHousehold"
						:beneficiary="member"
						:members-smart-card-numbers="smartCardNumbers[index]"
					/>
				</div>
			</div>
		</b-collapse>
		<b-button
			class="mt-5"
			type="is-danger"
			icon-left="plus"
			@click="addMember"
		>
			{{ $t('New') }}
		</b-button>
		<hr>
	</div>
</template>

<script>
import BeneficiariesService from "@/services/BeneficiariesService";
import HouseholdHeadForm from "@/components/Beneficiaries/Household/HouseholdHeadForm";
import { Notification } from "@/utils/UI";

export default {
	name: "Members",

	components: {
		HouseholdHeadForm,
	},

	props: {
		detailOfHousehold: Object,

		isEditing: {
			type: Boolean,
			default: false,
		},
	},

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
				if (e.message) Notification(`${this.$t("Members")} ${e}`, "is-danger");
			}
		},

		reloadMemberForm() {
			if (this.$refs.member) {
				this.$refs.member.forEach((form) => {
					form.map();
				});
			}
		},

		addMember() {
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

		removeMember(index) {
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
