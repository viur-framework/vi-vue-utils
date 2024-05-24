import { computed, reactive } from "vue";
import { defineStore } from "pinia";
import { Request } from "../request";
import { useRouter } from "vue-router";

const googleConfig = {
    library: "https://accounts.google.com/gsi/client",
    defaultButtonConfig: { theme: "outline", size: "large" },
    scopes: "email",
};

export const useUserStore = defineStore("user", () => {
    const router = useRouter();

    const state = reactive({
        //user related
        user: null,
        "user.loggedin": "no", // "yes", "no", "loading"
        "user.login.type": "no", // "no","user", "google", "sso"
        favoriteModules: [],
        lastActions: [],
        syncedlastActions: [],
        lastSynced: new Date().getTime(),

        //google stuff
        "google.api.loaded": false,
        "google.api.clientid": "",
        "google.api.renderButton": true,

        //auth methos
        primaryAuthMethods: new Set(),
        secondFactors: new Set(),
        "user.login.secound_factor_choice": [],
        "user.login.secound_factor": {},
        "user.login.secound_factor_errors": [],
        renderErrorMsg: "",
        currentLoginMask: "",
    });

    function resetLoginInformation() {
        state.currentLoginMask = "";
        state["user"] = null;
        state["user.loggedin"] = "no";
        state["user.login.type"] = "no";
        state["user.login.secound_factor_choice"] = [];
        state["user.login.secound_factor"] = {};
        state["user.login.secound_factor_errors"] = [];
    }

    function googleInit(ClientId) {
        return new Promise((resolve, reject) => {
            if (!ClientId) {
                reject("missing clientid");
                return;
            }

            state["google.api.clientid"] = ClientId;
            if (!state["google.api.loaded"]) {
                const script = document.createElement("script");
                script.addEventListener("load", () => {
                    state["google.api.loaded"] = true;

                    window.google.accounts.id.initialize({
                        client_id: state["google.api.clientid"],
                        scope: googleConfig.scopes,
                        use_fedcm_for_prompt: false, //TODO disabled till ported, FedCM will be enforced Q4 24 from google!
                        ux_mode: "popup",
                        prompt_parent_id: "google_oauth",
                        callback: (response) => {
                            if (response.credential) {
                                Request.securePost(
                                    "/vi/user/auth_googleaccount/login",
                                    {
                                        dataObj: {
                                            token: response.credential,
                                        },
                                        amount: 1,
                                    }
                                )
                                    .then(async (resp) => {
                                        if (!resp.ok) {
                                            let error = await resp.json();
                                            throw error;
                                        }
                                        Request.get("/vi/user/view/self")
                                            .then(async (resp) => {
                                                let data = await resp.json();
                                                state["user.loggedin"] = "yes";
                                                state["user"] = data.values;
                                                state["user.login.type"] =
                                                    "google";
                                                resolve(response);
                                            })
                                            .catch((error) => {
                                                resetLoginInformation();
                                                state["user.loggedin"] =
                                                    "error";
                                                reject(response);
                                            });
                                    })
                                    .catch((error) => {
                                        resetLoginInformation();
                                        state["user.loggedin"] = "error";
                                        state.renderErrorMsg = error.descr
                                            ? error.status + " - " + error.descr
                                            : error.status;
                                        reject(response);
                                    });
                            } else {
                                resetLoginInformation();
                                state["user.loggedin"] = "error";
                                reject(response);
                            }
                        },
                    });
                    resolve(window.google);
                });
                script.src = googleConfig.library;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }
        });
    }

    function googleLogin() {
        return new Promise((resolve, reject) => {
            state.currentLoginMask = "google";
            state["user.loggedin"] = "loading";
            console.log(window.google.accounts);
            window.google.accounts.id.prompt((notification) => {
                if (
                    [
                        "suppressed_by_user",
                        "opt_out_or_no_session",
                        "undefined",
                    ].includes(notification.getNotDisplayedReason())
                ) {
                    console.log("Please delete the g_state cookie");
                    let div = document.getElementById("google_oauth");
                    window.google.accounts.id.renderButton(div, {
                        theme: "outline",
                        size: "large",
                    });
                }
            });
        });
    }

    function userLogin(name, password) {
        return new Promise((resolve, reject) => {
            state.currentLoginMask = "user";
            state["user.loggedin"] = "loading";
            Request.securePost("/vi/user/auth_userpassword/login", {
                dataObj: {
                    name: name,
                    password: password,
                },
                amount: 1,
            })
                .then(async (respLogin) => {
                    try {
                        const loginResponse = await respLogin.json();
                        if (loginResponse === "OKAY") {
                            Request.get("/vi/user/view/self")
                                .then(async (resp) => {
                                    let data = await resp.json();
                                    state["user.loggedin"] = "yes";
                                    state["user"] = data.values;
                                    state["user.login.type"] = "user";
                                })
                                .catch((error) => {
                                    resetLoginInformation();
                                    state["user.loggedin"] = "error";
                                    state.renderErrorMsg = error.descr
                                        ? error.status + " - " + error.descr
                                        : error.status;
                                    reject(respLogin);
                                });
                        } else if (Array.isArray(loginResponse)) {
                            //We can choose a secondfactor
                            //We have a second factor
                            state["user.loggedin"] = "secound_factor_choice";
                            state["user.login.secound_factor_choice"] =
                                loginResponse;
                        } else if (
                            typeof loginResponse === "object" &&
                            loginResponse["values"] !== undefined
                        ) {
                            loginResponse["structure"] = structureToDict(
                                loginResponse["structure"]
                            );
                            state["user.login.secound_factor"] = loginResponse;
                            state.currentLoginMask = "secondFactor";

                            state["user.loggedin"] = "secound_factor_input";
                        } else if (loginResponse === "FAILURE") {
                            state["user.loggedin"] = "error";
                            state.renderErrorMsg =
                                "Benutzername oder Passwort falsch!";

                            reject(respLogin);
                        } else {
                            state["user.loggedin"] = "error";
                            console.dir("hier", loginResponse);
                            state.renderErrorMsg = loginResponse.descr
                                ? loginResponse.status +
                                  " - " +
                                  loginResponse.descr
                                : loginResponse.status;
                        }
                    } catch (error) {
                        Request.get("/vi/user/view/self")
                            .then(async (resp) => {
                                let data = await resp.json();
                                state["user.loggedin"] = "yes";
                                state["user"] = data.values;
                                state["user.login.type"] = "user";
                            })
                            .catch((error) => {
                                resetLoginInformation();
                                state["user.loggedin"] = "error";
                                state.renderErrorMsg = error.descr
                                    ? error.status + " - " + error.descr
                                    : error.status;

                                reject(respLogin);
                            });
                    }
                })
                .catch((error) => {
                    resetLoginInformation();
                    state["user.loggedin"] = "error";
                    state.renderErrorMsg = error.descr
                        ? error.status + " - " + error.descr
                        : error.status;

                    reject(error);
                });
        });
    }

    function userSecondFactor(otp) {
        return new Promise((resolve, reject) => {
            state["user.loggedin"] = "loading";
            Request.securePost(
                `/vi/user/f2_${state["user.login.type"]}/verify`,
                { dataObj: { otp: otp } }
            ).then(async (resp) => {
                const opt_data = await resp.json();
                if (opt_data.errors) {
                    if (opt_data.errors.length > 0) {
                        state["user.loggedin"] = "error";
                        return;
                    }
                }
                Request.get("/vi/user/view/self")
                    .then(async (resp) => {
                        let data = await resp.json();

                        state["user.loggedin"] = "yes";
                        state["user"] = data.values;
                        state["user.login.type"] = "user";
                    })
                    .catch((error) => {
                        resetLoginInformation();
                        state["user.loggedin"] = "error";
                        reject(resp);
                    });
            });
        });
    }

    async function logout() {
        if (state["user.login.type"] === "google") {
            window.google.accounts.id.revoke();
        }

        return Request.securePost("/vi/user/logout")
            .then(async (resp) => {
                await router.isReady();
                resetLoginInformation();
                Request.resetState();
                router.push("/");
            })
            .catch(async (error) => {
                Request.resetState();
                resetLoginInformation();
                state["user.loggedin"] = "error";
            });
    }

    async function recoverPassword() {
        state["user.loggedin"] === "loading";
        await Request.securePost("/vi/user/auth_userpassword/pwrecover", {
            amount: 1,
        })
            .then(async (resp) => {
                let data = await resp.json();

                if (data.action === "edit") {
                    state.currentLoginMask = "pwRecovery";
                    state["user.login.secound_factor"]["structure"] =
                        structureToDict(data.structure);
                    state["user.login.secound_factor"]["values"] = data.values;
                } else {
                    console.dir(data);
                    throw data;
                }
            })
            .catch((error) => {
                console.log("ja");
                console.dir(error);
                resetLoginInformation();
                state["user.loggedin"] = "error";
                state.renderErrorMsg = error.descr
                    ? error.status + " - " + error.descr
                    : error.status;
            });
    }

    function sendNewPassword(data) {
        state["user.loggedin"] = "loading";

        return new Promise((resolve, reject) => {
            Request.securePost("/json/user/auth_userpassword/pwrecover", {
                dataObj: data,
                amount: 1,
            }).then(async (resp) => {
                try {
                    let answ = await resp.json();
                    console.log("sendNewPassword try", resp);
                    console.log("+", answ);

                    if (!resp.ok) {
                        resetLoginInformation();
                        state.renderErrorMsg = answ.descr;
                        state["user.loggedin"] = "error";
                        throw answ;
                    }

                    if (answ.action === "edit") {
                        answ["structure"] = structureToDict(answ["structure"]);
                        state["user.login.secound_factor"] = answ;
                        state.currentLoginMask = "pwRecovery";
                        state["user.loggedin"] = "no";

                        resolve(answ);
                    }

                    if (answ.action === "view") {
                        resetLoginInformation();
                    }
                } catch (e) {
                    console.log("sendNewPassword catch", e);
                    // ! FIXME currently no case where recovery process runs into errors
                    // if (e?.status !== 403) {
                    //     Request.get("/vi/user/view/self")
                    //         .then(async (resp) => {
                    //             let data = await resp.json();
                    //             state["user.loggedin"] = "yes";
                    //             state["user"] = data.values;
                    //             state["user.login.type"] = "user";
                    //         })
                    //         .catch((error) => {
                    //             resetLoginInformation();
                    //             state.renderErrorMsg = error.descr;
                    //             state["user.loggedin"] = "error";
                    //         });
                    // }
                }
            });
        });
    }

    function updateUser() {
        return new Promise((resolve, reject) => {
            Request.get("/vi/user/view/self")
                .then(async (resp) => {
                    let data = await resp.json();
                    state["user.loggedin"] = "yes";
                    state["user"] = data.values;
                    state["user.login.type"] = "user";
                    if (data.values["admin_config"]) {
                        const obj = data.values["admin_config"];
                        if (obj !== null) {
                            for (const key in obj["lastActions"]) {
                                //back to array
                                state.lastActions.push(obj["lastActions"][key]);
                                state.syncedlastActions.push(
                                    obj["lastActions"][key]
                                );
                            }
                        }
                    }
                    resolve(resp);
                })
                .catch((error) => {
                    resetLoginInformation();
                    reject(error);
                });
        });
    }

    function getAuthMethods() {
        return new Promise((resolve, reject) => {
            Request.get(`/vi/user/getAuthMethods`).then(async (resp) => {
                const authMethods = await resp.json();
                for (const method of authMethods) {
                    state.primaryAuthMethods.add(method[0]);
                    state.secondFactors.add(method[1]);
                }
                resolve();
            });
        });
    }

    function userSecondFactorStart(choice) {
        return new Promise((resolve, reject) => {
            Request.get(choice["start_url"]).then(async (resp) => {
                const answ = await resp.json();
                answ["structure"] = structureToDict(answ["structure"]);
                state["user.login.secound_factor"] = answ;
                //console.log(state["user.login.secound_factor"]["structure"])
                state["user.loggedin"] = "secound_factor_input";
                resolve();
            });
        });
    }

    function structureToDict(structure) {
        if (Array.isArray(structure)) {
            let struct = {};
            for (const idx in structure) {
                struct[structure[idx][0]] = structure[idx][1];
            }
            return struct;
        } else {
            return structure;
        }
    }

    function userSecondFactor() {
        state["user.loggedin"] = "secound_factor_choice";
    }

    function secondFactorSend(data) {
        return new Promise((resolve, reject) => {
            Request.securePost(
                state["user.login.secound_factor"]["params"]["action_url"],
                { dataObj: data, amount: 1 }
            ).then(async (resp) => {
                try {
                    let answ = await resp.json();

                    if (!resp.ok) {
                        resetLoginInformation();
                        state.renderErrorMsg = answ.descr;
                        state["user.loggedin"] = "error";
                        throw answ;
                    }

                    if (answ["errors"].length) {
                        state["user.login.secound_factor_errors"] =
                            answ["errors"];
                        reject(state["user.login.secound_factor"]);
                    }

                    if (
                        typeof answ === "object" &&
                        answ["values"] !== undefined &&
                        !answ["errors"].length
                    ) {
                        answ["structure"] = structureToDict(answ["structure"]);
                        state["user.login.secound_factor"] = answ;
                        state.currentLoginMask = "secondFactor";
                        state["user.loggedin"] = "secound_factor_input";
                        resolve(answ);
                    }
                } catch (e) {
                    if (e?.status !== 403) {
                        Request.get("/vi/user/view/self")
                            .then(async (resp) => {
                                let data = await resp.json();
                                state["user.loggedin"] = "yes";
                                state["user"] = data.values;
                                state["user.login.type"] = "user";
                            })
                            .catch((error) => {
                                resetLoginInformation();
                                state.renderErrorMsg = error.descr;
                                state["user.loggedin"] = "error";
                            });
                    }
                }
            });
        });
    }

    function checkActiveSession() {
        Request.get("/vi/user/view/self")
            .then(async (resp) => {
                let data = await resp.json();
            })
            .catch((error) => {
                resetLoginInformation();
                logout();
            });
    }

    const userAccess = computed(() => {
        if (!state.user) return [];

        return state.user["access"];
    });

    const userShortname = computed(() => {
        if (!state.user) return "-";

        if (state.user["firstname"]) {
            return `${state.user["firstname"][0]}. ${state.user["lastname"]}`;
        } else {
            return state.user["lastname"];
        }
    });

    return {
        state,
        userAccess,
        userShortname,
        updateUser,
        googleInit,
        googleLogin,
        userLogin,
        userSecondFactor,
        logout,
        getAuthMethods,
        userSecondFactorStart,
        secondFactorSend,
        resetLoginInformation,
        checkActiveSession,
        recoverPassword,
        sendNewPassword,
    };
});
