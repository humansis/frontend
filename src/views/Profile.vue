<template>
	<v-container fluid>
		<v-card class="mx-auto mt-16" max-width="800">
			<v-card-text>
				<form @submit.prevent="submitPasswordForm">
					<p class="text-h6">{{ $t('User Information') }}</p>

					<DataInput
						v-model="userForm.email"
						label="Email"
						name="email"
						variant="outlined"
						density="compact"
						hide-details="auto"
						class="mt-4 mb-4"
						disabled
					/>

					<p class="text-h6"> {{ $t('Change Password') }}</p>

					<DataInput
						v-model="password.oldPassword"
						label="Old Password"
						name="old-password"
						type="password"
						variant="outlined"
						density="compact"
						hide-details="auto"
						class="mt-4 mb-5"
						:error-messages="validationMsg('oldPassword', 'password')"
						@blur="validate('oldPassword', 'password')"
					/>

					<DataInput
						v-model="password.newPassword"
						label="New Password"
						name="new-password"
						type="password"
						variant="outlined"
						density="compact"
						hide-details="auto"
						class="mt-4 mb-5"
						:error-messages="validationMsg('newPassword', 'password')"
						@blur="validate('newPassword', 'password')"
					/>

					<DataInput
						v-model="password.reenteredPassword"
						label="Re-Enter New Password"
						name="re-enter-new-password"
						type="password"
						variant="outlined"
						density="compact"
						hide-details="auto"
						class="mt-4 mb-5"
						:error-messages="validationMsg('reenteredPassword', 'password')"
						@blur="validate('reenteredPassword', 'password')"
					/>

					<div class="text-end">
						<v-btn
							class="text-none ml-0"
							color="primary"
							size="small"
							type="submit"
						>
							{{ $t('Save') }}
						</v-btn>
					</div>
				</form>

				<form @submit.prevent="submitTelephoneForm">
					<p class="text-h6"> {{ $t('Change Phone Number') }}</p>

					<v-row class="mt-2 mb-2" :class="{ 'flex-column': isMobile }">
						<v-col>
							<DataSelect
								v-model="phone.prefix"
								:items="options.phonePrefixes"
								label="Phone Ext"
								name="phone-ext"
								variant="outlined"
								density="compact"
								hide-details="auto"
								item-title="value"
								item-value="code"
								is-search-enabled
								clearable
								:error-messages="validationMsg('prefix', 'phone')"
								@blur="validate('prefix', 'phone')"
							/>
						</v-col>

						<v-col>
							<DataInput
								v-model="phone.number"
								label="Phone Number"
								name="phone-number"
								variant="outlined"
								density="compact"
								hide-details="auto"
								:error-messages="validationMsg('number', 'phone')"
								@blur="validate('number', 'phone')"
							/>
						</v-col>
					</v-row>

					<div class="text-end">
						<v-btn
							class="text-none ml-0"
							color="primary"
							size="small"
							type="submit"
						>
							{{ $t('Save') }}
						</v-btn>
					</div>
				</form>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
import { mapState } from "vuex";
import LoginService from "@/services/LoginService";
import UsersService from "@/services/UsersService";
import DataInput from "@/components/Inputs/DataInput";
import DataSelect from "@/components/Inputs/DataSelect";
import validation from "@/mixins/validation";
import vuetifyHelper from "@/mixins/vuetifyHelper";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { Notification } from "@/utils/UI";
import { PHONE } from "@/consts";
import { requiredIf, sameAs } from "@vuelidate/validators";

const passwordRegexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
const passwordValidation = (value) => (!value || passwordRegexp.test(value));

export default {
	name: "Profile",

	components: {
		DataInput,
		DataSelect,
	},

	mixins: [vuetifyHelper, validation],

	validations() {
		return {
			password: {
				oldPassword: { required: requiredIf(this.password.newPassword
						|| this.password.reenteredPassword) },
				newPassword: {
					required: requiredIf(this.password.oldPassword || this.password.reenteredPassword),
					passwordValidation,
				},
				reenteredPassword: {
					required: requiredIf(this.password.oldPassword || this.password.newPassword),
					...((this.password.oldPassword || this.password.newPassword)
						&& { sameAsPassword: sameAs(this.password.newPassword) }),
				},
			},
			phone: {
				prefix: { required: requiredIf(this.phone.number) },
				number: { required: requiredIf(this.phone.prefix?.value || this.phone.prefix?.length) },
			},
		};
	},

	data() {
		return {
			userProfile: null,
			password: {
				oldPassword: "",
				newPassword: "",
				reenteredPassword: "",
			},
			phone: {
				prefix: null,
				number: "",
			},
			userForm: {
				email: "",
			},
			twoFactorEnabled: false,
			options: {
				phonePrefixes: PHONE.CODES,
			},
			changePasswordLoading: false,
			changePhoneLoading: false,
			twoFactorLoading: false,
		};
	},

	computed: {
		...mapState(["user"]),

		canEnableTwoFA() {
			return !this.userProfile?.phonePrefix || !this.userProfile?.phoneNumber;
		},
	},

	created() {
		this.fetchUser();
	},

	methods: {
		async submitPasswordForm() {
			this.v$.password.$touch();

			if (this.v$.password.$invalid || !this.password.oldPassword.length) return;
			this.changePasswordLoading = true;

			const { id } = this.userProfile;
			const { data: { salt } } = await UsersService.requestSalt(this.userProfile.username);
			await LoginService.tryLogin({
				username: this.userProfile.username,
				password: this.password.oldPassword,
			}).then(async () => {
				await UsersService.patchUser(id, {
					password: UsersService.saltPassword(salt, this.password.newPassword),
				}).then(({ data }) => {
					this.mapUser(data);
					Notification(
						`${this.$t("Password Updated")}`,
						"success",
					);
				}).catch((e) => {
					Notification(`${this.$t("Password Update")} ${e}`, "error");
				});
			}).catch(() => {
				Notification(`${this.$t("Invalid Password")}`, "error");
			});
			this.v$.password.$reset();

			this.changePasswordLoading = false;
		},

		async submitTelephoneForm() {
			this.v$.phone.$touch();

			if (this.v$.phone.$invalid) return;
			this.changePhoneLoading = true;
			this.phone.number = this.phone.number?.replace(/\s+/g, "");

			const { id } = this.userProfile;

			await UsersService.patchUser(id, {
				phoneNumber: this.phone.number || null,
				phonePrefix: this.phone.prefix || null,
			}).then(({ data }) => {
				this.mapUser(data);
				Notification(
					`${this.$t("Phone Updated")}`,
					"success",
				);
				this.fetchUser();
			}).catch((e) => {
				Notification(`${this.$t("Phone Update")} ${e}`, "error");
			});
			this.v$.phone.$reset();

			this.changePhoneLoading = false;
		},

		async enableTwoFactor() {
			this.twoFactorLoading = true;

			const { id } = this.userProfile;

			await UsersService.patchUser(id, {
				"2fa": !this.twoFactorEnabled,
			}).then(({ data }) => {
				this.mapUser(data);
				Notification(
					`${this.$t(`Two Factor ${data["2fa"] ? "Enabled" : "Disabled"}`)}`,
					"success",
				);
			}).catch((e) => {
				Notification(`${this.$t("Two Factor Update")} ${e}`, "error");
			});

			this.twoFactorLoading = false;
		},

		async fetchUser() {
			const { userId } = this.user;

			await UsersService.getDetailOfUser(userId)
				.then(({ data }) => {
					this.mapUser(data);
				})
				.catch((e) => {
					Notification(`${this.$t("User")} ${e}`, "is-danger");
				});
		},

		mapUser(data) {
			this.userProfile = data;
			this.userForm.email = data.email;
			this.phone.prefix = getArrayOfCodeListByKey([data.phonePrefix], PHONE.CODES, "code");
			this.phone.number = data.phoneNumber;
			this.twoFactorEnabled = data["2fa"];
		},
	},
};
</script>
