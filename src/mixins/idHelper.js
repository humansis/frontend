export default {
	methods: {
		onIdChange() {
			const primaryIdCode = this.formModel.primaryId.idType?.code;
			const secondaryIdCode = this.formModel.secondaryId.idType?.code;
			const tertiaryIdCode = this.formModel.tertiaryId.idType?.code;

			const isPrimaryEqualsSecondary = primaryIdCode === secondaryIdCode;
			const isSecondaryEqualsTertiary = secondaryIdCode === tertiaryIdCode;
			const isPrimaryEqualsTertiary = primaryIdCode === tertiaryIdCode;

			this.isPrimaryIdValid = (this.isSecondaryIdTabDisabled || !isPrimaryEqualsSecondary)
				&& (this.isTertiaryIdTabDisabled || !isPrimaryEqualsTertiary);
			this.primaryIdValidationMessage = this.isPrimaryIdValid
				? ""
				: this.$t("Primary ID cannot be the same as the secondary or tertiary ID");

			if (!this.isSecondaryIdTabDisabled) {
				this.isSecondaryIdValid = !isPrimaryEqualsSecondary
					&& (this.isTertiaryIdTabDisabled || !isSecondaryEqualsTertiary);
				this.secondaryIdValidationMessage = this.isSecondaryIdValid
					? ""
					: this.$t("Secondary ID cannot be the same as the primary or tertiary ID");
			}

			if (!this.isTertiaryIdTabDisabled) {
				this.isTertiaryIdValid = !isPrimaryEqualsTertiary && !isSecondaryEqualsTertiary;
				this.tertiaryIdValidationMessage = this.isTertiaryIdValid
					? ""
					: this.$t("Tertiary ID cannot be the same as the primary or secondary ID");
			}
		},
	},
};
