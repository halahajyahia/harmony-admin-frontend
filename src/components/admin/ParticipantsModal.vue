
<script setup>
const props = defineProps({
  show: Boolean,
  participants: {
    type: Array,
    default: () => [],
  },
  filteredParticipants: {
    type: Array,
    default: () => [],
  },
  participantsSearch: {
    type: String,
    default: "",
  },
  participantsLoading: Boolean,
});

const emit = defineEmits(["close", "search", "edit", "delete", "create"]);
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-card participants-modal">
      <div class="participants-modal-header">
        <div>
          <h3>Participants ({{ filteredParticipants.length }})</h3>
          <p class="participants-modal-subtitle">
            View processed participants for this event.
          </p>
        </div>

        <div class="participants-modal-header-actions">
          <button class="edit-btn" @click="$emit('create')">
            + Add Participant
          </button>

          <button class="cancel-btn" @click="$emit('close')">
            Close
          </button>
        </div>
      </div>

      <div class="participants-toolbar">
        <input
          :value="participantsSearch"
          @input="$emit('search', $event.target.value)"
          type="text"
          placeholder="Search participants by name, phone, job title, resume text, or meeting preference"
          class="participants-search-input"
        />
      </div>

      <p v-if="participantsLoading">Loading participants...</p>

      <p v-if="participantsLoading">
  Loading participants...
</p>

<p
  v-else-if="!participants.length"
  class="empty-search-state"
>
  No participants available yet. Upload and process a file or add participants manually.
</p>

<p
  v-else-if="!filteredParticipants.length"
  class="empty-search-state"
>
  No participants match your search.
</p>

<div v-else class="participants-table-wrapper">
        <table class="participants-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Job Title</th>
              <th>Academic Resume</th>
              <th>Professional Resume</th>
              <th>Personal Resume</th>
              <th>I Want to Meet</th>
              <th>Photo URL</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="participant in filteredParticipants"
              :key="participant.id"
            >
              <td>{{ participant.name || "—" }}</td>
              <td>{{ participant.phoneNumber || "—" }}</td>
              <td>{{ participant.jobTitle || "—" }}</td>
              <td>{{ participant.academicResume || "—" }}</td>
              <td>{{ participant.professionalResume || "—" }}</td>
              <td>{{ participant.personalResume || "—" }}</td>
              <td>{{ participant.iWantToMeet || "—" }}</td>
              <td>
                <a
                  v-if="participant.photoUrl"
                  :href="participant.photoUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Photo
                </a>
                <span v-else>—</span>
              </td>
              <td>
                <div class="table-actions">
                  <button
                    class="table-action-btn edit-inline-btn"
                    @click="$emit('edit', participant)"
                  >
                    Edit
                  </button>

                  <button
                    class="table-action-btn delete-inline-btn"
                    @click="$emit('delete', participant)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

      
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}
.participants-modal {
  max-width: 1100px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
}
.participants-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.participants-modal-header h3 {
  margin: 0;
  color: #234532;
}
.participants-modal-subtitle {
  margin: 0.35rem 0 0 0;
  color: #5f6f66;
  font-size: 0.95rem;
}
.participants-modal-header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.participants-toolbar {
  margin-bottom: 1rem;
}
.participants-search-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #d5ddd8;
  border-radius: 12px;
  font-size: 1rem;
  box-sizing: border-box;
  outline: none;
}
.participants-table-wrapper {
  overflow-x: auto;
}
.participants-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
}
.participants-table th,
.participants-table td {
  text-align: left;
  padding: 0.9rem 0.85rem;
  border-bottom: 1px solid #e7ece9;
  vertical-align: top;
}
.participants-table th {
  background: #f7faf8;
  color: #234532;
  font-weight: 700;
  position: sticky;
  top: 0;
}
.participants-table tbody tr:hover {
  background: #fafcfb;
}
.empty-search-state {
  margin-top: 1rem;
  color: #5f6f66;
}
.table-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.table-action-btn {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  cursor: pointer;
}
.edit-inline-btn {
  background: #e7ece9;
  color: #234532;
}
.delete-inline-btn {
  background: #fee2e2;
  color: #991b1b;
}
.edit-btn,
.cancel-btn {
  padding: 0.85rem 1.1rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.edit-btn {
  background: #2e8b57;
  color: white;
}
.cancel-btn {
  background: #e7ece9;
  color: #234532;
}
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-weight: 500;
}
</style>