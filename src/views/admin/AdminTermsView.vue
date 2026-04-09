<template>
  <AdminLayout>
    <div class="Term of Use-page">
      <div class="Term of Use-card">
        <h1>{{ terms.title }}</h1>

        <div v-for="section in terms.sections" :key="section.heading" class="section">
          <h2>{{ section.heading }}</h2>
          <p>{{ section.text }}</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from "../../components/admin/AdminLayout.vue";
import { adminTermsOfUse as terms } from "../../content/adminTermsOfUse";
</script>