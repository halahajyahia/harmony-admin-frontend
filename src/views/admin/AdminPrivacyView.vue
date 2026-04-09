<template>
  <AdminLayout>
    <div class="privacy-page">
      <div class="privacy-card">
        <h1>{{ policy.title }}</h1>

        <div v-for="section in policy.sections" :key="section.heading" class="section">
          <h2>{{ section.heading }}</h2>
          <p>{{ section.text }}</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from "../../components/admin/AdminLayout.vue";
import { adminPrivacyPolicy as policy } from "../../content/adminPrivacyPolicy";
</script>