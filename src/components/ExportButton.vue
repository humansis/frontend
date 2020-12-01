<template>
	<div>
		<b-button
			icon-left="file-download"
			:size="size"
			:type="type"
			@click="exportData"
		>
			Export
		</b-button>

		<b-dropdown
			v-model="currentFormat"
			class="ml-1"
			aria-role="list"
		>
			<b-button slot="trigger" :size="size" type="is-default">
				<template>
					<span>{{currentFormat.name}}</span>
				</template>
				<b-icon icon="arrow-down" />
			</b-button>

			<b-dropdown-item
				v-for="(menu, index) in formatMenu"
				v-show="menu.disabled"
				:key="index"
				:value="menu"
			>
				<div class="media">
					<div class="media-content">
						<h3>{{menu.name}}</h3>
					</div>
				</div>
			</b-dropdown-item>
		</b-dropdown>
	</div>
</template>

<script>
export default {
	name: "ExportButton",

	props: {
		size: String,
		type: String,
		formats: Object,
	},

	data() {
		return {
			currentFormat: { name: ".xlsx" },
			formatMenu: [
				{ name: ".xlsx", disabled: this.formats.xlsx },
				{ name: ".csv", disabled: this.formats.csv },
				{ name: ".odt", disabled: this.formats.odt },
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
