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
						class="mt-4 mb-4"
						:error-messages="v$.password.oldPassword.$errors.map(e => e.$message)"
						@blur="v$.password.oldPassword.$touch"
					/>

					<DataInput
						v-model="password.newPassword"
						label="New Password"
						name="new-password"
						type="password"
						variant="outlined"
						density="compact"
						hide-details="auto"
						class="mt-4 mb-4"
						:error-messages="v$.password.newPassword.$errors.map(e => e.$message)"
						@blur="v$.password.newPassword.$touch"
					/>

					<DataInput
						v-model="password.reenteredPassword"
						label="Re-Enter New Password"
						name="re-enter-new-password"
						type="password"
						variant="outlined"
						density="compact"
						hide-details="auto"
						class="mt-4 mb-4"
						:error-messages="v$.password.reenteredPassword.$errors.map(e => e.$message)"
						@blur="v$.password.reenteredPassword.$touch"
					/>

					<div class="text-end">
						<v-btn
							class="ml-0"
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
								clearable
								multiple
								:error-messages="v$.phone.prefix.$errors.map(e => e.$message)"
								@blur="v$.phone.prefix.$touch"
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
								:error-messages="v$.phone.number.$errors.map(e => e.$message)"
								@blur="v$.phone.number.$touch"
							/>
						</v-col>
					</v-row>

					<div class="text-end">
						<v-btn
							class="ml-0"
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
import vuetifyHelper from "@/mixins/vuetifyHelper";
import { getArrayOfCodeListByKey } from "@/utils/codeList";
import { Notification } from "@/utils/UI";
import { PHONE } from "@/consts";
import { useVuelidate } from "@vuelidate/core";
import { requiredIf, sameAs } from "@vuelidate/validators";

const passwordRegexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
const passwordValidation = (value) => (value ? passwordRegexp.test(value) : true);

export default {
	name: "Profile",

	components: {
		DataInput,
		DataSelect,
	},

	mixins: [vuetifyHelper],

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
						&& { sameAsPassword: sameAs("newPassword") }),
				},
			},
			phone: {
				prefix: { required: requiredIf(this.phone.number) },
				number: { required: requiredIf(this.phone.prefix?.length) },
			},
		};
	},

	setup: () => ({ v$: useVuelidate() }),

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
			console.log(this.v$);
			if (this.v$.password.$invalid) return;
			this.changePasswordLoading = true;

			const { id } = this.userProfile;
			const { data: { salt } } = await UsersService.requestSalt(this.userProfile.username);
			await LoginService.tryLogin({
				username: this.userProfile.username,
				password: this.password.oldPassword,
				// TODO uncomment after BE implement login with salted password
				// password: UsersService.saltPassword(salt, this.password.oldPassword),
			}).then(async () => {
				await UsersService.patchUser(id, {
					password: UsersService.saltPassword(salt, this.password.newPassword),
				}).then(({ data }) => {
					this.mapUser(data);
					Toast(
						`${this.$t("Password Updated")}`,
						"is-success",
					);
				}).catch((e) => {
					Notification(`${this.$t("Password Update")} ${e}`, "is-danger");
				});
			}).catch(() => {
				Notification(`${this.$t("Invalid Password")}`, "is-danger");
			});
			this.v$.password.$reset();

			this.changePasswordLoading = false;
		},

		async submitTelephoneForm() {
			this.v$.phone.$touch();
			console.log(this.v$.phone.number);
			// if (this.v$.phone.$invalid) return;
			// this.changePhoneLoading = true;
			// this.phone.number = this.phone.number?.replace(/\s+/g, "");
			//
			// const { id } = this.userProfile;
			//
			// await UsersService.patchUser(id, {
			// 	phoneNumber: this.phone.number || null,
			// 	phonePrefix: this.phone.prefix?.code || null,
			// }).then(({ data }) => {
			// 	this.mapUser(data);
			// 	Toast(
			// 		`${this.$t("Phone Updated")}`,
			// 		"is-success",
			// 	);
			// 	this.fetchUser();
			// }).catch((e) => {
			// 	Notification(`${this.$t("Phone Update")} ${e}`, "is-danger");
			// });
			// this.v$.phone.$reset();
			//
			// this.changePhoneLoading = false;
		},

		async enableTwoFactor() {
			this.twoFactorLoading = true;

			const { id } = this.userProfile;

			await UsersService.patchUser(id, {
				"2fa": !this.twoFactorEnabled,
			}).then(({ data }) => {
				this.mapUser(data);
				Toast(
					`${this.$t(`Two Factor ${data["2fa"] ? "Enabled" : "Disabled"}`)}`,
					"is-success",
				);
			}).catch((e) => {
				Notification(`${this.$t("Two Factor Update")} ${e}`, "is-danger");
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
			this.twoFactorEnabled = data["2fa"];
		},

		newPasswordMessage() {
			if (!this.v$.password.newPassword.required) {
				return this.$t("Required");
			}
			if (!this.v$.password.newPassword.passwordValidation) {
				return this.$t("The Password Is Not Strong Enough... Minimum Required = 8 Characters, 1 Lowercase, 1 Uppercase, 1 Numeric");
			}
			return "";
		},

		reenterPasswordMessage() {
			if (!this.v$.password.reenteredPassword.required) {
				return this.$t("Required");
			}
			if (!this.v$.password.reenteredPassword.sameAsPassword) {
				return this.$t("Passwords must be same");
			}
			return "";
		},

		validationPropertyLevel(fields) {
			let result;
			const fieldsLevel = fields.split(".");
			switch (fieldsLevel.length) {
				case 1:
					result = this.v$[fieldsLevel[0]];
					break;
				case 2:
					result = this.v$[fieldsLevel[0]][fieldsLevel[1]];
					break;
				case 3:
					result = this.v$[fieldsLevel[0]][fieldsLevel[1]][fieldsLevel[2]];
					break;
				default:
			}
			return result;
		},

		validate(fieldName) {
			const validation = this.validationPropertyLevel(fieldName);
			validation.$touch();
		},

		validateMsg(fieldName, message = "Required") {
			const validation = this.validationPropertyLevel(fieldName);
			return validation.$error ? this.$t(message) : "";
		},

		validateType(fieldName, errorOrNothing = false) {
			const validation = this.validationPropertyLevel(fieldName);

			let result = "";
			if (validation.$dirty) {
				if (errorOrNothing) {
					result = validation.$error ? "is-danger" : "";
				} else {
					result = validation.$error ? "is-danger" : "is-success";
				}
			}

			return result;
		},

		validateMultiselect(fieldName, errorOrNothing = false) {
			const validation = this.validationPropertyLevel(fieldName);

			let result = "";
			if (validation.$dirty) {
				if (errorOrNothing) {
					result = validation.$error ? "vue-multiselect-error" : "";
				} else {
					result = validation.$error ? "vue-multiselect-error" : "vue-multiselect-success";
				}
			}
			return result;
		},

	},
};
</script>
