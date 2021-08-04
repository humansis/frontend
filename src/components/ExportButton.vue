<template>
	<b-dropdown
		v-model="currentFormat"
		aria-role="list"
		:position="position"
	>
		<b-button
			icon-right="arrow-down"
			icon-left="file-download"
			slot="trigger"
			:loading="loading"
			:size="size"
			:type="type"
		>
			<template>
				<span>{{ $t(label) }}</span>
			</template>
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
		label: {
			type: String,
			default: "Export",
		},
		position: {
			type: String,
			default: "is-bottom-right",
		},
		loading: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			currentFormat: null,
			formatMenu: [
				{ name: "xlsx", disabled: this.formats.xlsx },
				{ name: "csv", disabled: this.formats.csv },
				{ name: "odt", disabled: this.formats.odt },
				{ name: "ods", disabled: this.formats.ods },
				{ name: "pdf", disabled: this.formats.pdf },
			],
		};
	},

	methods: {
		exportData() {
			this.$emit("onExport", this.currentFormat.name);
		},
	},
};
</script>
