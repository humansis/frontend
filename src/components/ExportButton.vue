<template>
	<b-dropdown>
		<b-button :loading="loading" icon-left="file-download" slot="trigger" :size="size" :type="type">
			<template>
				<span>{{ label || $t('Export') }}</span>
			</template>
			<b-icon icon="arrow-down" />
		</b-button>
		<span v-if="hasRawExport">
			<b-dropdown-item custom>
				<small><b>{{ $t("Normal") }}</b></small>
			</b-dropdown-item>
			<hr class="dropdown-divider">
		</span>
		<b-dropdown-item
			v-for="(menu, index) in formatMenu"
			v-show="menu.disabled"
			:key="`format-menu-${index}`"
			:value="menu"
			@click="exportData(menu.name)"
		>
			<div class="media">
				<div class="media-content">
					<h3>{{menu.name}}</h3>
				</div>
			</div>
		</b-dropdown-item>
		<span v-if="hasRawExport">
			<hr class="dropdown-divider">
			<b-dropdown-item custom>
				<small><b>{{ $t("Raw") }}</b></small>
			</b-dropdown-item>
			<hr class="dropdown-divider">
			<b-dropdown-item
				v-for="(menu, index) in formatMenuRaw"
				v-show="menu.disabled"
				:key="`format-menu-second-type-${index}`"
				:value="menu"
				@click="exportDataSecondType(menu.name)"
			>
				<div class="media">
					<div class="media-content">
						<h3>{{menu.name}}</h3>
					</div>
				</div>
			</b-dropdown-item>
		</span>
	</b-dropdown>
</template>

<script>
export default {
	name: "ExportButton",

	props: {
		size: String,
		type: String,
		formats: Object,
		formatsForRaw: {
			type: Object,
			default: () => {},
		},
		spaceBetween: Boolean,
		label: {
			type: String,
			default: null,
		},
		loading: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			currentFormat: null,
			currentFormatRaw: null,
			formatMenu: [
				{ name: "xlsx", disabled: this.formats.xlsx },
				{ name: "csv", disabled: this.formats.csv },
				{ name: "odt", disabled: this.formats.odt },
				{ name: "ods", disabled: this.formats.ods },
				{ name: "pdf", disabled: this.formats.pdf },
			],
			formatMenuRaw: [
				{ name: "xlsx", disabled: this.formatsForRaw?.xlsx },
				{ name: "csv", disabled: this.formatsForRaw?.csv },
				{ name: "odt", disabled: this.formatsForRaw?.odt },
				{ name: "ods", disabled: this.formatsForRaw?.ods },
				{ name: "pdf", disabled: this.formatsForRaw?.pdf },
			],
		};
	},

	computed: {
		hasRawExport() {
			return !!this.formatsForRaw?.xlsx;
		},
	},

	methods: {
		exportData(format) {
			this.$emit("onExport", format);
		},

		exportDataSecondType(format) {
			this.$emit("onExportRaw", format);
		},
	},
};
</script>
