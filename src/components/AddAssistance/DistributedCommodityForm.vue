<template>
	<form @submit.prevent="submitForm">
		<section class="modal-card-body">
			<b-field
				label="Modality"
			>
				<MultiSelect
					v-model="formModel.modality"
					placeholder="Click to select..."
					:options="options.modality"
					:searchable="false"
					@select="onModalitySelect"
				/>
			</b-field>

			<b-field
				label="Type"
			>
				<MultiSelect
					v-model="formModel.type"
					placeholder="Click to select..."
					:options="options.type"
					:searchable="false"
				/>
			</b-field>

			<b-field
				label="Currency"
				v-if="formModel.modality === 'Cash' || formModel.modality === 'Vouchers'"
			>
				<MultiSelect
					v-model="formModel.currency"
					placeholder="Click to select..."
					:options="options.type"
					:searchable="false"
				/>
			</b-field>

			<b-field
				label="Unit"
				v-if="formModel.modality !== 'Cash'"
			>
				<MultiSelect
					v-model="formModel.unit"
					placeholder="Click to select..."
					:options="options.unit"
					:searchable="false"
				/>
			</b-field>

			<b-field
				label="Quantity"
				v-if="formModel.modality !== 'Vouchers'"
			>
				<b-input
					v-model="formModel.quantity"
				/>
			</b-field>

			<b-field
				label="Description"
				v-if="formModel.modality === 'In Kind'"
			>
				<b-input
					v-model="formModel.description"
				/>
			</b-field>

			<b-field
				label="Total Value of Booklet"
				v-if="formModel.modality === 'Vouchers'"
			>
				<b-input
					v-model="formModel.totalValueOfBooklet"
				/>
			</b-field>
		</section>

		<footer class="modal-card-foot">
			<button v-if="closeButton" class="button" type="button" @click="closeForm">
				Close
			</button>
			<b-button
				tag="input"
				class="is-success"
				native-type="submit"
				:value="submitButtonLabel"
			/>
		</footer>
	</form>
</template>

<script>

export default {
	name: "DistributedCommodityForm",

	props: {
		formModel: Object,
		submitButtonLabel: String,
		closeButton: Boolean,
	},

	data() {
		return {
			options: {
				modality: ["Cash", "In Kind", "Other", "Vouchers"],
				type: [],
				currency: [],
				unit: [],
			},
		};
	},

	computed: {
		criteria() {
			return this.options.criteria;
		},
	},

	methods: {
		onModalitySelect(modality) {
			switch (modality) {
				case "Cash":
					this.options.type = ["Mobile Money", "Cash", "Smartcard"];
					break;
				case "In Kind":
					this.options.type = [
						"Food", "RTE Kit", "Bread", "Agricultural Kit", "WASH Kit", "Hygiene Kit",
						"Shelter Tool Kit", "Dignity Kit",
					];
					break;
				case "Other":
					this.options.type = ["Loan"];
					break;
				case "Vouchers":
					this.options.type = ["Paper Voucher", "QR Code Voucher"];
					break;
				default:
					this.options.type = [];
			}
		},

		submitForm() {
			this.$emit("formSubmitted", this.formModel);
		},

		closeForm() {
			this.$emit("close");
		},
	},
};
</script>
