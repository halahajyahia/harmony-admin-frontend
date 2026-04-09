<template>
  <div style="padding: 40px; font-size: 28px;">
    Signing you in...
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { msalInstance } from "../../auth/msal";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(async () => {
  try {
    const response = await msalInstance.handleRedirectPromise();

    if (response) {
      const account = response.account;

      // 👇 שולחים ל־backend
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/auth/microsoft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: account.username,
          name: account.name
        })
      });

      const data = await res.json();

      console.log("ADMIN CREATED:", data);

      // 👇 שמירה בלוקאל (כמו שכבר יש לך)
      localStorage.setItem("harmony_admin_auth", "true");
      localStorage.setItem("harmony_admin_email", account.username);
      localStorage.setItem("harmony_admin_name", account.name);

      // 👇 מעבר לדשבורד
      router.push("/admin/dashboard");
    }

  } catch (err) {
    console.error("Callback error:", err);
  }
});
</script>