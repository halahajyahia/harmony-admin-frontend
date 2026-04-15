<script setup>
import { getAdminAccessToken } from "@/utils/getAdminAccessToken";
import AdminLayout from "../../components/admin/AdminLayout.vue";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const events = ref([]);
const searchTerm = ref("");
const sortBy = ref("newest");
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedEvent = ref(null);
const statusFilter = ref("all");

const editEventForm = ref({
  id: "",
  name: "",
  date: "",
  location: "",
  description: "",
  status: "draft",
});
const newEvent = ref({
  name: "",
  date: "",
  location: "",
  description: "",
  supportedLanguages: [],
});
onMounted(() => {
  loadEvents();
});
const createEventError = ref("");

const isCreatingEvent = ref(false);

async function createEvent() {
  createEventError.value = "";

  if (!newEvent.value.name?.trim()) {
    createEventError.value = "Event name is required";
    return;
  }

  if (!newEvent.value.date?.trim()) {
    createEventError.value = "Event date is required";
    return;
  }

  try {
    isCreatingEvent.value = true;

    const token = await getAdminAccessToken();

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newEvent.value),
    });

    const data = await res.json();

    console.log("status:", res.status);
    console.log("data:", data);

    if (!res.ok) {
      createEventError.value = data.error || "Failed to create event";
      return;
    }

    await loadEvents();

    newEvent.value = {
      name: "",
      date: "",
      location: "",
      description: "",
      supportedLanguages: [],
    };

    isCreateModalOpen.value = false;
  } catch (error) {
    console.error("Create event failed:", error);
    createEventError.value = "Failed to create event";
  } finally {
    isCreatingEvent.value = false;
  }
}
async function loadEvents() {
  try {
    const token = await getAdminAccessToken();

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("events status:", res.status);
    console.log("events data:", data);

    events.value = data;
  } catch (error) {
    console.error("Load events failed:", error);
  }
}
const filteredEvents = computed(() => {
  let result = [...events.value];

  const search = searchTerm.value.trim().toLowerCase();

  if (search) {
    result = result.filter((event) => {
      return (
        event.name?.toLowerCase().includes(search) ||
        event.location?.toLowerCase().includes(search) ||
        event.description?.toLowerCase().includes(search)
      );
    });
  }

  if (statusFilter.value !== "all") {
    result = result.filter((event) => event.status === statusFilter.value);
  }

  switch (sortBy.value) {
    case "oldest":
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case "name-asc":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "newest":
    default:
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  return result;
});
function openEditModal(event) {
  selectedEvent.value = event;

  editEventForm.value = {
    id: event.id,
    name: event.name || "",
    date: event.date || "",
    location: event.location || "",
    description: event.description || "",
    status: event.status || "draft",
  };

  isEditModalOpen.value = true;
}
async function updateEvent() {
  const token = await getAdminAccessToken();

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${editEventForm.value.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editEventForm.value),
    }
  );

  const data = await res.json();

  if (!data.ok) {
    alert("Failed to update event");
    return;
  }

  await loadEvents();
  isEditModalOpen.value = false;
}
function openEventDetails(event) {
  router.push(`/admin/events/${event.id}`);
}
</script>

<template>
  <AdminLayout>
  <div class="events-page">
    <div class="events-header">
      <div>
        <h1>Admin Events</h1>
        <p>Manage all events in the system</p>
      </div>

      <button class="new-event-btn" @click="isCreateModalOpen = true">
        New Event
      </button>
    </div>

    <div class="toolbar">
  <input
    v-model="searchTerm"
    class="search-input"
    type="text"
    placeholder="Search events..."
  />

  <div class="filters-group">
    <div class="filter-item">
        <span class="filter-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" fill="currentColor"/>
        </svg>
        </span>     
        <select v-model="statusFilter">
        <option value="all">All stasuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <div class="filter-item">
      <span class="filter-icon">⇅</span>
      <select v-model="sortBy">
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="name-asc">Name A-Z</option>
        <option value="name-desc">Name Z-A</option>
      </select>
    </div>
  </div>
</div>

    <div v-if="filteredEvents.length === 0" class="empty-state">
      <h3>No events yet</h3>
      <p>Create your first event to get started.</p>
    </div>

    <div v-else class="events-list">
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="event-card clickable"
        @click="openEventDetails(event)"      >

        <h3>{{ event.name }}</h3>
        <p><strong>Date:</strong> {{ event.date }}</p>
        <p><strong>Location:</strong> {{ event.location || "—" }}</p>
        <p>
          <strong>Status:</strong>
          <span class="status-badge" :class="event.status">
            {{ event.status }}
          </span>
        </p>      
      </div>
    </div>

    <div v-if="isCreateModalOpen" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Create Event</h2>
          <button class="close-btn" @click="isCreateModalOpen = false">
            ×
          </button>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Event name</label>
            <input v-model="newEvent.name" type="text" />
          </div>

          <div class="form-group">
            <label>Date</label>
            <input v-model="newEvent.date" type="date" />
          </div>

          <div class="form-group">
            <label>Location</label>
            <input v-model="newEvent.location" type="text" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newEvent.description"></textarea>
          </div>
        </div>

        <div class="form-group">
  <label>Supported Languages</label>

  <div class="languages-grid">
    <label>
      <input type="checkbox" value="he" v-model="newEvent.supportedLanguages" />
      Hebrew
    </label>

    <label>
      <input type="checkbox" value="en" v-model="newEvent.supportedLanguages" />
      English
    </label>

    <label>
      <input type="checkbox" value="ar" v-model="newEvent.supportedLanguages" />
      Arabic
    </label>

  </div>
</div>
<p v-if="createEventError" class="error-message">
  {{ createEventError }}
</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="isCreateModalOpen = false">
            Cancel
          </button>
          <button class="save-btn" @click="createEvent" :disabled="isCreatingEvent">
            {{ isCreatingEvent ? "Creating..." : "Create Event" }}
          </button>
        </div>
      </div>
    
    
    </div>
    <div v-if="isEditModalOpen" class="modal-overlay">
  <div class="modal-card">
    <div class="modal-header">
      <h2>Edit Event</h2>
      <button class="close-btn" @click="isEditModalOpen = false">
        ×
      </button>
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label>Event name</label>
        <input v-model="editEventForm.name" />
      </div>

      <div class="form-group">
        <label>Date</label>
        <input v-model="editEventForm.date" type="date" />
      </div>

      <div class="form-group">
        <label>Location</label>
        <input v-model="editEventForm.location" />
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea v-model="editEventForm.description"></textarea>
      </div>

      <div class="form-group">
        <label>Status</label>
        <select v-model="editEventForm.status">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>

    <div class="modal-actions">
      <button class="cancel-btn" @click="isEditModalOpen = false">
        Cancel
      </button>

      <button class="save-btn" @click="updateEvent">
        Save Changes
      </button>
    </div>
  </div>
    </div>
  </div>
  </AdminLayout>
</template>

<style scoped>
.events-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.events-header h1 {
  margin: 0;
  color: #1f3b2d;
}

.events-header p {
  margin: 0.5rem 0 0;
  color: #5f6f66;
}

.new-event-btn {
  padding: 0.9rem 1.2rem;
  border: none;
  border-radius: 12px;
  background: #2e8b57;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.toolbar {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  background: white;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.search-input,
.filter-select,
.form-group input {
  padding: 0.85rem 1rem;
  border: 1px solid #d5ddd8;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  min-width: 220px;
}

.filter-select {
  min-width: 180px;
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  color: #234532;
}

.empty-state p {
  margin: 0;
  color: #66756d;
}

.events-list {
  display: grid;
  gap: 1rem;
}

.event-card {
  background: white;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.event-card h3 {
  margin-top: 0;
  color: #234532;
}

.event-card p {
  margin: 0.35rem 0;
  color: #4f5f57;
}

.clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 2000;
}

.modal-card {
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modal-header h2 {
  margin: 0;
  color: #1f3b2d;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  color: #607066;
}

.form-grid {
  display: grid;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.form-group label {
  font-weight: 600;
  color: #234532;
}

.language-switch {
  display: flex;
  background: #e8eeea;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.lang-btn {
  flex: 1;
  padding: 0.8rem 0.9rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  color: #234532;
}

.lang-btn.active {
  background: #2e8b57;
  color: white;
}

.error-message {
  margin: 1rem 0 0;
  color: #c0392b;
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.cancel-btn,
.save-btn {
  padding: 0.85rem 1.1rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background: #e7ece9;
  color: #234532;
}

.save-btn {
  background: #2e8b57;
  color: white;
}

.toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filters-group {
  display: flex;
  gap: 0.75rem;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: white;
  border: 1px solid #d5ddd8;
  border-radius: 10px;
  padding: 0.35rem 0.6rem;
}

.filter-item select {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
}

.filter-icon {
  font-size: 1.5rem;
  color: #6b7280;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.draft {
  background: #f3f4f6;
  color: #374151;
}

.status-badge.published {
  background: #dcfce7;
  color: #166534;
}

.status-badge.archived {
  background: #fee2e2;
  color: #991b1b;
}
</style>