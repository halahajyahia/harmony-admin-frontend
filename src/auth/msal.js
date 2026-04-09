import { PublicClientApplication } from "@azure/msal-browser";

const tenantId = "d9c431c3-a830-46d8-8719-29c2e91427d5";
const clientAppId = "7c5d7d3d-cb40-4b21-ba44-29c5e1084fbe"; // Harmony Admin Client
const apiAppId = "86dd7661-4289-40bc-8095-83caafbe3f79"; // Harmony Admin

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: clientAppId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
redirectUri: `${import.meta.env.VITE_APP_BASE_URL}/admin/login`,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
});

export const loginRequest = {
  scopes: ["openid", "profile", "email", "api://86dd7661-4289-40bc-8095-83caafbe3f79/access_as_user"],
  prompt: "select_account",
};

export const apiRequest = {
  scopes: ["api://86dd7661-4289-40bc-8095-83caafbe3f79/access_as_user"],
};

let initialized = false;

export const initializeMsal = async () => {
  if (!initialized) {
    await msalInstance.initialize();
    initialized = true;
  }
};