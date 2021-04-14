<template>
	<div>
		<b-collapse
			v-for="(collapse, index) of collapses"
			ref="members"
			class="card"
			animation="slide"
			:key="index"
			:open="isOpen === index"
			@open="isOpen = index"
		>
			<div
				slot="trigger"
				class="card-header"
				role="button"
			>
				<p class="card-header-title">
					<b-tag type="is-success" size="is-medium">{{ index + 1 }}</b-tag>
					<span class="ml-3">{{ $t('Member') }}</span>
				</p>
				<a class="card-header-icon">
					<b-button
						type="is-danger"
						class="is-light mr-4"
						@click="removeMember(index)"
					>
						<b-icon icon="trash" />
					</b-button>
					<b-icon icon="arrow-down" />
				</a>
			</div>
			<div class="card-content">
				<div class="content">
					<HouseholdHeadForm
						ref="member"
						:show-type-of-beneficiary="false"
						:is-editing="!!preparedMembers[index]"
						:beneficiary="preparedMembers[index]"
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
import HouseholdHeadForm from "@/components/Beneficiaries/Household/HouseholdHeadForm";
import BeneficiariesService from "@/services/BeneficiariesService";

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

	watch: {
		detailOfHousehold(household) {
			this.mapDetailOfHouseholdToFormModel(household);
		},
	},

	async created() {
		if (this.isEditing) {
			await this.mapDetailOfHouseholdToFormModel();
		}
	},

	data() {
		return {
			isOpen: 0,
			collapses: [],
			members: [],
			preparedMembers: [],
		};
	},

	methods: {
		async mapDetailOfHouseholdToFormModel() {
			const promises = [];
			this.detailOfHousehold.beneficiaryIds.forEach((id) => {
				if (this.detailOfHousehold.householdHeadId !== id) {
					const promise = BeneficiariesService.getBeneficiary(id).then((data) => {
						this.preparedMembers[this.collapses.length] = data;
						this.collapses.push(this.collapses.length);
					});
					promises.push(promise);
				}
			});
			await Promise.all(promises);
			this.reloadMemberForm();
		},

		reloadMemberForm() {
			if (this.$refs.member) {
				this.$refs.member.forEach((form) => {
					form.map();
				});
			}
		},

		addMember() {
			if (this.collapses.length && this.$refs.member[this.collapses.length - 1].submit()) {
				this.members.push(this.$refs.member[this.collapses.length - 1].formModel);

				const newCollapseIndex = (this.collapses.length - 1) + 1;

				this.collapses.push(newCollapseIndex);
				this.isOpen = newCollapseIndex;
			} else {
				this.collapses.push(this.collapses.length);
			}
		},

		removeMember(index) {
			this.collapses.splice(index, 1);
			this.members.splice(index, 1);
		},

		submit() {
			this.members = [];
			let result = 0;
			if (this.$refs.member) {
				this.$refs.member.forEach((form) => {
					if (form.submit()) {
						result += 1;
					}
				});
				if (result === this.$refs.member.length) {
					this.$refs.member.forEach((form) => {
						this.members.push(form.formModel);
					});
					return true;
				}
			} else {
				return true;
			}

			return false;
		},
	},
};
</script>
