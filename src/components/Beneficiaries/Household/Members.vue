<template>
	<div>
		<b-collapse
			v-for="(collapse, index) of collapses"
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
					<span class="ml-3">Member</span>
				</p>
				<a class="card-header-icon">
					<button
						class="button button is-danger is-light mr-4"
						@click="removeMember(index)"
					>
						<b-icon icon="trash" />
					</button>
					<b-icon icon="arrow-down" />
				</a>
			</div>
			<div class="card-content">
				<div class="content">
					<HouseholdHeadForm ref="member" :show-type-of-beneficiary="false" />
				</div>
			</div>
		</b-collapse>
		<b-button
			class="mt-5"
			type="is-danger"
			icon-left="plus"
			@click="addMember"
		>
			New
		</b-button>
		<hr>
	</div>
</template>

<script>
import HouseholdHeadForm from "@/components/Beneficiaries/Household/HouseholdHeadForm";

export default {
	name: "Members",

	components: {
		HouseholdHeadForm,
	},

	props: {
		detailOfHousehold: null || Object,
	},

	watch: {
		detailOfHousehold() {
			// TODO Map detailOfHousehold to members
		},
	},

	data() {
		return {
			isOpen: 0,
			collapses: [],
			members: [],
		};
	},

	methods: {
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
			if (this.collapses.length && this.$refs.member[this.collapses.length - 1].submit()) {
				this.members.push(this.$refs.member[this.collapses.length - 1].formModel);

				return true;
			}

			return false;
		},
	},
};
</script>
