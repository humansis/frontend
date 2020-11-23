<template>
	<div>
		<b-collapse
			class="card"
			animation="slide"
			v-for="(collapse, index) of collapses"
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
					<button @click="removeMember(index)" class="button button is-danger is-light mr-4">
						<b-icon icon="trash" />
					</button>
					<b-icon icon="arrow-down" />
				</a>
			</div>
			<div class="card-content">
				<div class="content">
					<HouseholdForm :show-type-of-beneficiary="false" />
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
import HouseholdForm from "@/components/Beneficiaries/Household/HouseholdForm";

export default {
	name: "Members",

	components: {
		HouseholdForm,
	},

	data() {
		return {
			isOpen: 0,
			collapses: [],
		};
	},

	methods: {
		addMember() {
			if (!this.collapses.length) {
				this.collapses.push(this.collapses.length);
			} else {
				const newCollapseIndex = (this.collapses.length - 1) + 1;
				this.collapses.push(newCollapseIndex);
				this.isOpen = newCollapseIndex;
			}
		},

		removeMember(index) {
			this.collapses.splice(index, 1);
		},
	},
};
</script>
