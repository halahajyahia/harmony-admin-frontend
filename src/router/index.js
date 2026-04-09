/**
 * router/index.js
 * Purpose: Central routing configuration for the Harmony frontend.
 * Why: Defines all application routes and ensures users are always routed
 *      with a valid participant id (pid) or redirected to login.
 * Design choice: Participant id is part of the URL to keep routing explicit
 *                and bookmarkable.
 */

import { createRouter, createWebHistory } from 'vue-router'


// Admin views
import AdminLoginView from '../views/admin/AdminLoginView.vue'
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminEventsView from '../views/admin/AdminEventsView.vue'
import AdminProfileView from '../views/admin/AdminProfileView.vue'
import AdminPrivacyView from '../views/admin/AdminPrivacyView.vue'
import AdminTermsView from '../views/admin/AdminTermsView.vue'
import AdminMicrosoftCallbackView from '../views/admin/AdminMicrosoftCallbackView.vue'
import AdminEventDetailsView from "@/views/admin/AdminEventDetailsView.vue";


// Admin helper:
// If admin is authenticated, allow access.
// Otherwise, redirect to admin login.
const withAdminAuthOrLogin = () => {
  const isAdminAuth = localStorage.getItem("harmony_admin_auth") === "true";
  return isAdminAuth ? true : "/admin/login";
};

// Router configuration using HTML5 history mode (clean URLs, no hash)
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Default entry point: redirect root access to login
    {
  path: "/",
  redirect: "/admin/login",
},
    // Admin routes

{ path: '/admin', redirect: '/admin/login' },
{ path: '/admin/login', component: AdminLoginView },

{ path: '/admin/dashboard', component: AdminDashboardView, beforeEnter: withAdminAuthOrLogin },
{ path: '/admin/events', component: AdminEventsView, beforeEnter: withAdminAuthOrLogin },
{ path: '/admin/events/:id', component: AdminEventDetailsView, beforeEnter: withAdminAuthOrLogin },
{ path: '/admin/profile', component: AdminProfileView, beforeEnter: withAdminAuthOrLogin },
{ path: '/admin/privacy', component: AdminPrivacyView, beforeEnter: withAdminAuthOrLogin },
{ path: '/admin/terms', component: AdminTermsView, beforeEnter: withAdminAuthOrLogin },
{
  path: "/auth/microsoft/callback",
  component: AdminMicrosoftCallbackView
},

    
  ],
})

// Export router instance to be used by the Vue app
export default router