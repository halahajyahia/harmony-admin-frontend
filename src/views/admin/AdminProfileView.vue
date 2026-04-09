<template>
  <AdminLayout>
  <div class="profile-page">
    <div class="profile-card">
      <h1>My Profile</h1>

      <!-- VIEW MODE -->
     <div v-if="!isEditing">
  <p><strong>Name:</strong> {{ name }}</p>
  <p><strong>Email:</strong> {{ email }}</p>
  <p v-if="organization"><strong>Organization:</strong> {{ organization }}</p>
  <p v-if="phone"><strong>Phone:</strong> {{ phone }}</p>
  <p v-if="bio"><strong>Bio:</strong> {{ bio }}</p>

  <button class="edit-btn" @click="startEditing">
    Edit Profile
  </button>

  <button class="delete-btn" @click="deleteMyData">
    Delete My Data
  </button>
</div>

      <!-- EDIT MODE -->
      <div v-else class="edit-form">
        <label>Name</label>
        <input v-model="editName" />

        <label>Email</label>
        <input v-model="editEmail" disabled />

        <label>Organization</label>
        <input v-model="editOrganization" placeholder="Optional" />

        <label>Phone</label>
        <input v-model="editPhone" placeholder="Optional" />

        <label>Bio</label>
        <textarea v-model="editBio" placeholder="Optional"></textarea>

        <div class="buttons">
          <button class="save-btn" @click="saveProfile">
            Save
          </button>

          <button class="cancel-btn" @click="cancelEdit">
            Cancel
          </button>
          <button class="delete-btn" @click="deleteMyData">
            Delete My Data
          </button>
        </div>
      </div>
    </div>
  </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { getAdminAccessToken } from "../../utils/getAdminAccessToken";
// profile data
const name = ref("");
const email = ref("");
const organization = ref("");
const phone = ref("");
const bio = ref("");

// edit state
const isEditing = ref(false);
const editName = ref("");
const editEmail = ref("");
const editOrganization = ref("");
const editPhone = ref("");
const editBio = ref("");

// load profile
onMounted(async () => {
  try {
    // קודם כל נטען מ-localStorage כדי שתמיד יופיע משהו
    name.value = localStorage.getItem("harmony_admin_name") || "";
    email.value = localStorage.getItem("harmony_admin_email") || "";
    organization.value = localStorage.getItem("harmony_admin_organization") || "";
    phone.value = localStorage.getItem("harmony_admin_phone") || "";
    bio.value = localStorage.getItem("harmony_admin_bio") || "";

    // נמלא גם את שדות העריכה
    editName.value = name.value;
    editEmail.value = email.value;
    editOrganization.value = organization.value;
    editPhone.value = phone.value;
    editBio.value = bio.value;

    // אם יש אימייל, ננסה להביא נתונים מה-backend
    const emailValue = localStorage.getItem("harmony_admin_email");
    if (!emailValue) return;
    const accessToken = await getAdminAccessToken();

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();

    console.log("PROFILE DATA:", data);

    if (data.ok && data.admin) {
      name.value = data.admin.name || "";
      email.value = data.admin.email || "";
      organization.value = data.admin.organizationName || "";
      phone.value = data.admin.phone || "";
      bio.value = data.admin.bio || "";

      editName.value = name.value;
      editEmail.value = email.value;
      editOrganization.value = organization.value;
      editPhone.value = phone.value;
      editBio.value = bio.value;

      // לסנכרן גם localStorage
      localStorage.setItem("harmony_admin_name", name.value);
      localStorage.setItem("harmony_admin_email", email.value);
      localStorage.setItem("harmony_admin_organization", organization.value);
      localStorage.setItem("harmony_admin_phone", phone.value);
      localStorage.setItem("harmony_admin_bio", bio.value);
    }
  } catch (err) {
    console.error("Profile load error:", err);
  }
});

// actions
const startEditing = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  editName.value = name.value;
  editEmail.value = email.value;
  editOrganization.value = organization.value;
  editPhone.value = phone.value;
  editBio.value = bio.value;
};

const saveProfile = async () => {
  try {
    const accessToken = await getAdminAccessToken();

const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/profile`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    name: editName.value,
    organizationName: editOrganization.value,
    phone: editPhone.value,
    bio: editBio.value,
  }),
});

    const data = await res.json();

    console.log("SAVE PROFILE:", data);

    if (data.ok && data.admin) {
      name.value = data.admin.name || "";
      email.value = data.admin.email || "";
      organization.value = data.admin.organizationName || "";
      phone.value = data.admin.phone || "";
      bio.value = data.admin.bio || "";

      localStorage.setItem("harmony_admin_name", name.value);
      localStorage.setItem("harmony_admin_email", email.value);
      localStorage.setItem("harmony_admin_organization", organization.value);
      localStorage.setItem("harmony_admin_phone", phone.value);
      localStorage.setItem("harmony_admin_bio", bio.value);

      isEditing.value = false;
    }
  } catch (err) {
    console.error("Save error:", err);
  }
};
const deleteMyData = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete your profile data? This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    const accessToken = await getAdminAccessToken();

const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/profile`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
    const data = await res.json();

    if (!data.ok) {
      throw new Error("Failed to delete profile");
    }

    localStorage.removeItem("harmony_admin_auth");
    localStorage.removeItem("harmony_admin_email");
    localStorage.removeItem("harmony_admin_name");
    localStorage.removeItem("harmony_admin_id");
    localStorage.removeItem("harmony_admin_organization");
    localStorage.removeItem("harmony_admin_phone");
    localStorage.removeItem("harmony_admin_bio");

    sessionStorage.clear();

    window.location.href = "/admin/login";
  } catch (err) {
    console.error("Delete profile error:", err);
    alert("Failed to delete profile.");
  }
};
</script>

<style scoped>
.profile-page {
  padding: 40px;
  display: flex;
  justify-content: center;
}

.profile-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.profile-card h1 {
  margin-bottom: 20px;
}

/* VIEW */
.profile-card p {
  margin-bottom: 10px;
  color: #333;
}

/* BUTTONS */
.edit-btn {
  margin-top: 15px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #2e8b57;
  color: white;
  cursor: pointer;
}

/* EDIT FORM */
.edit-form {
  display: flex;
  flex-direction: column;
}

.edit-form label {
  margin-top: 10px;
  margin-bottom: 5px;
  font-size: 14px;
}

.edit-form input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.save-btn {
  flex: 1;
  padding: 10px;
  background: #1f6b45;
  color: white;
  border: none;
  border-radius: 8px;
}

.cancel-btn {
  flex: 1;
  padding: 10px;
  background: #ccc;
  border: none;
  border-radius: 8px;
}
.delete-btn {
  margin-top: 12px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #d9534f;
  color: white;
  cursor: pointer;
}

.delete-btn:hover {
  background: #c9302c;
}
</style>

