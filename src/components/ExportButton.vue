<template>
	<b-dropdown
		v-model="currentFormat"
		aria-role="list"
	>
		<b-button icon-left="file-download" slot="trigger" :size="size" :type="type">
			<template>
				<span>{{ $t('Export') }}</span>
			</template>
			<b-icon icon="arrow-down" />
		</b-button>
		<b-dropdown-item
			v-for="(menu, index) in formatMenu"
			v-show="menu.disabled"
			:key="index"
			:value="menu"
			@click="exportData(menu.name)"
		>
			<div class="media">
				<div class="media-content">
					<h3>{{menu.name}}</h3>
				</div>
			</div>
		</b-dropdown-item>
	</b-dropdown>
</template>

<script>
export default {
	name: "ExportButton",

	props: {
		size: String,
		type: String,
		formats: Object,
		spaceBetween: Boolean,
	},

	data() {
		return {
			currentFormat: null,
			formatMenu: [
				{ name: ".xlsx", disabled: this.formats.xlsx },
				{ name: ".csv", disabled: this.formats.csv },
				{ name: ".odt", disabled: this.formats.odt },
				{ name: ".ods", disabled: this.formats.ods },
				{ name: ".pdf", disabled: this.formats.pdf },
			],
		};
	},

	methods: {
		exportData() {
			this.$emit("exportData", this.currentFormat.name);
		},
	},
};
</script>
