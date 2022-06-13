<template>
	<div class="b-steps" :class="wrapperClasses">
		<nav class="steps" :class="mainClasses">
			<ul class="step-items">
				<li
					v-for="childItem in items"
					v-show="childItem.visible"
					class="step-item"
					:key="childItem.value"
					:class="[childItem.type || type, childItem.headerClass, {
						'is-active': childItem.isActive,
						'is-previous': activeItem.index > childItem.index
					}]"
				>
					<a class="step-link">
						<div class="step-marker">
							<b-icon
								v-if="childItem.icon"
								:icon="childItem.icon"
								:pack="childItem.iconPack"
								:size="size"
							/>
							<span v-else-if="childItem.step">{{ childItem.step }}</span>
						</div>
						<div class="step-details">
							<span class="step-title">{{ childItem.label }}</span>
						</div>
					</a>
				</li>
			</ul>
		</nav>
		<section class="step-content" :class="{'is-transitioning': isTransitioning}">
			<slot />
		</section>
		<slot
			name="navigation"
			:previous="navigationProps.previous"
			:next="navigationProps.next"
		>
			<nav v-if="hasNavigation" class="step-navigation">
				<a
					role="button"
					class="pagination-previous"
					:aria-label="ariaPreviousLabel"
					:disabled="navigationProps.previous.disabled"
					@click.prevent="navigationProps.previous.action"
				>
					<b-icon
						both
						aria-hidden="true"
						:icon="iconPrev"
						:pack="iconPack"
					/>
				</a>
				<a
					role="button"
					class="pagination-next"
					:aria-label="ariaNextLabel"
					:disabled="navigationProps.next.disabled"
					@click.prevent="navigationProps.next.action"
				>
					<b-icon
						both
						aria-hidden="true"
						:icon="iconNext"
						:pack="iconPack"
					/>
				</a>
			</nav>
		</slot>
	</div>
</template>

<script>
import Icon from "buefy/src/components/icon/Icon";

import BSteps from "buefy/src/components/steps/Steps";

export default {
	name: "CustomSteps",

	components: {
		[Icon.name]: Icon,
	},

	mixins: [BSteps],

	methods: {
		childClick(child) {
			this.$emit("stepsChanged", this.activeItem, child);
		},

		changeStep(child) {
			this.activeId = child.value;
		},
	},
};
</script>
