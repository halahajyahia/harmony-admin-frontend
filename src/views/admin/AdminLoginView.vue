<template>
  <div class="admin-login-page">
    <div class="admin-login-card">
      <h1>Admin Login</h1>
      <p>Sign in to access the admin dashboard.</p>

      <button class="ms-button" @click="loginWithMicrosoft">
        Sign in with Microsoft
      </button>

      <p class="privacy-note">
        By signing in, you agree to our
        <button class="privacy-link" @click="showPrivacy = true">
          Privacy Policy
        </button> and
        <button class="terms-link" @click="showTerms = true">
          Term of Uses
        </button>.
      </p>
    </div>

    <div v-if="showPrivacy" class="modal-overlay" @click.self="showPrivacy = false">
      <div class="modal-card">
        <h2>{{ policy.title }}</h2>

        <div v-for="section in policy.sections" :key="section.heading" class="section">
          <h3>{{ section.heading }}</h3>
          <p>{{ section.text }}</p>
        </div>

        <button class="close-btn" @click="showPrivacy = false">
          Close
        </button>
      </div>
    </div>
    <div v-if="showTerms" class="modal-overlay" @click.self="showTerms = false">
      <div class="modal-card">
        <h2>Admin Terms of Use</h2>

        <div v-for="section in terms.sections" :key="section.heading" class="section">
          <h3>{{ section.heading }}</h3>
          <p>{{ section.text }}</p>
        </div>

        <button class="close-btn" @click="showTerms = false">
          Close
        </button>
      </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { adminPrivacyPolicy as policy } from "../../content/adminPrivacyPolicy";
import { msalInstance, loginRequest, apiRequest, initializeMsal } from "../../auth/msal";
import { adminTermsOfUse as terms } from "../../content/adminTermsOfUse";  
const router = useRouter();
const showPrivacy = ref(false);
const showTerms = ref(false);

onMounted(async () => {
  try {
    await initializeMsal();

    const response = await msalInstance.handleRedirectPromise();
    const account = response?.account || msalInstance.getAllAccounts()[0];

    if (account) {
      msalInstance.setActiveAccount(account);

      let tokenResponse;

try {
  tokenResponse = await msalInstance.acquireTokenSilent({
  ...apiRequest,
  account,
});
} catch (error) {
  console.error("acquireTokenSilent failed:", error);
  return;
}

      const accessToken = tokenResponse.accessToken;

      const payload = JSON.parse(atob(accessToken.split(".")[1]));

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/auth/microsoft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error("Failed to verify/create admin");
      }

      localStorage.setItem("harmony_admin_auth", "true");
      localStorage.setItem("harmony_admin_email", data.admin.email || "");
      localStorage.setItem("harmony_admin_name", data.admin.name || "");
      localStorage.setItem("harmony_admin_id", data.admin.id);

      router.replace("/admin/dashboard");
    }
  } catch (error) {
    console.error("MSAL redirect handling error:", error);
  }
});

const loginWithMicrosoft = async () => {
  try {
    await initializeMsal();
    await msalInstance.loginRedirect(loginRequest);
  } catch (error) {
    console.error("Microsoft login error:", error);
  }
};
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7f9;
  padding: 20px;
}

.admin-login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.ms-button {
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border: none;
  border-radius: 8px;
  background: #111827;
  color: white;
  cursor: pointer;
  font-size: 1rem;
}

.ms-button:hover {
  opacity: 0.92;
}

.privacy-note {
  margin-top: 14px;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}
.terms-note {
  margin-top: 14px;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}
.privacy-link {
  background: none;
  border: none;
  color: #1f6b45;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}
.terms-link {
  background: none;
  border: none;
  color: #1f6b45;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 520px;
  max-height: 85vh;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
}

.close-btn {
  display: block;
  margin: 16px auto 0;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #1f3b2d;
  color: white;
  cursor: pointer;
  position: sticky;
  bottom: 0;
}

.modal-card h2 {
  margin-top: 0;
  margin-bottom: 16px;
}

.modal-card h3 {
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 16px;
}

.modal-card p {
  margin-bottom: 12px;
  color: #333;
  line-height: 1.6;
}


</style>