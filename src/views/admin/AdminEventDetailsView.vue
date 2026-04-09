<script setup>

import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import {
  getEventById,
  getParticipants,
  uploadParticipantsFile as uploadParticipantsFileApi,
  processParticipantsFile as processParticipantsFileApi,
  deleteParticipantsFile as deleteParticipantsFileApi,
  createParticipant as createParticipantApi,
  updateParticipant as updateParticipantApi,
  deleteParticipant as deleteParticipantApi,
  updateEvent as updateEventApi,
  calculateMatchesForEvent as calculateMatchesForEventApi,
  recalculateAddedParticipantMatches as recalculateAddedParticipantMatchesApi,
recalculateUpdatedParticipantMatches as recalculateUpdatedParticipantMatchesApi,
  deleteEventById,
} from "@/services/adminEventsService";
import AdminLayout from "@/components/admin/AdminLayout.vue";
import { useRouter } from "vue-router";
import ParticipantsModal from "@/components/admin/ParticipantsModal.vue";
import EditParticipantModal from "@/components/admin/EditParticipantModal.vue";
import DeleteParticipantConfirmModal from "@/components/admin/DeleteParticipantConfirmModal.vue";
import ParticipantsDataFileSection from "@/components/admin/ParticipantsDataFileSection.vue";
import EventQrModal from "@/components/admin/EventQrModal.vue";  

const router = useRouter()
const route = useRoute();
const eventId = route.params.id;
const event = ref(null);
const loading = ref(true);
const errorMessage = ref("");
const isEditing = ref(false);
const showDeleteConfirm = ref(false);
const selectedParticipantsFile = ref(null);
const isUploadingParticipantsFile = ref(false);
const editForm = ref({
  name: "",
  date: "",
  location: "",
  description: "",
  status: "draft",
  supportedLanguages: [],
});
const participantsFileInput = ref(null);
const participants = ref([]);
const participantsLoading = ref(false);
const showParticipantsPreview = ref(false);
const previewParticipants = ref([]);
const showParticipantsModal = ref(false);
const participantsSearch = ref("");
const filteredParticipants = computed(() => {
  const search = participantsSearch.value.trim().toLowerCase();

  if (!search) return participants.value;

  return participants.value.filter((participant) => {
    return [
      participant.name,
      participant.phoneNumber,
      participant.jobTitle,
      participant.academicResume,
      participant.professionalResume,
      participant.personalResume,
      participant.iWantToMeet,
      participant.photoUrl,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
  });
});
const showEditParticipantModal = ref(false);
const selectedParticipant = ref(null);
const participantEditForm = ref({
  name: "",
  phoneNumber: "",
  jobTitle: "",
  academicResume: "",
  professionalResume: "",
  personalResume: "",
  iWantToMeet: "",
  photoUrl: "",
});
const isSavingParticipant = ref(false);
const isCreatingParticipant = ref(false);
const participantFormErrors = ref({
  name: "",
  phoneNumber: "",
  jobTitle: "",
  academicResume: "",
  professionalResume: "",
  personalResume: "",
  iWantToMeet: "",
});
const participantFormGeneralError = ref("");
const pageNotice = ref({
  type: "", // "success" | "error"
  message: "",
});
const showDeleteParticipantConfirm = ref(false);
const participantToDelete = ref(null);
const isDeletingParticipant = ref(false);
const isDeletingParticipantsFile = ref(false);
const isCalculatingMatches = ref(false);
const showParticipantRecalcModal = ref(false);
const participantRecalcMode = ref(""); // "created" | "updated"
const participantToRecalculate = ref(null);
const isRecalculatingParticipant = ref(false);
const showQrModal = ref(false);

async function deleteEvent() {
  try {
    clearPageNotice();

    await deleteEventById(eventId);

    showDeleteConfirm.value = false;
    router.push("/admin/events");
  } catch (error) {
    console.error("Delete failed:", error);
    showPageNotice("error", error.message || "Failed to delete event");
  }
}
async function loadEvent() {
  try {
    loading.value = true;
    errorMessage.value = "";

    const data = await getEventById(eventId);

    event.value = data;

    editForm.value = {
      name: data.name || "",
      date: data.date || "",
      location: data.location || "",
      description: data.description || "",
      status: data.status || "draft",
      supportedLanguages: data.supportedLanguages || [],
    };
  } catch (error) {
    console.error("Load event failed:", error);
    errorMessage.value = error.message || "Failed to load event";
  } finally {
    loading.value = false;
  }
}
function cancelEdit() {
  if (!event.value) return;

  editForm.value = {
  name: event.value.name || "",
  date: event.value.date || "",
  location: event.value.location || "",
  description: event.value.description || "",
  status: event.value.status || "draft",
  supportedLanguages: event.value.supportedLanguages || [],
};

  isEditing.value = false;
}
async function updateEvent() {
  try {
    clearPageNotice();

    const data = await updateEventApi(eventId, editForm.value);

    event.value = data;

    editForm.value = {
      name: event.value.name || "",
      date: event.value.date || "",
      location: event.value.location || "",
      description: event.value.description || "",
      status: event.value.status || "draft",
      supportedLanguages: event.value.supportedLanguages || [],
    };

    isEditing.value = false;
    showPageNotice("success", "Event updated successfully");
  } catch (error) {
    console.error("Update failed:", error);
    showPageNotice("error", error.message || "Failed to update event");
  }
}
async function updateStatus(newStatus) {
  try {
    clearPageNotice();

    const data = await updateEventApi(eventId, {
      ...event.value,
      status: newStatus,
    });

    event.value = data;

    editForm.value = {
      name: event.value.name || "",
      date: event.value.date || "",
      location: event.value.location || "",
      description: event.value.description || "",
      status: event.value.status || "draft",
      supportedLanguages: event.value.supportedLanguages || [],
    };

    showPageNotice("success", "Event status updated successfully");
  } catch (error) {
    console.error("Status update failed:", error);
    showPageNotice("error", error.message || "Failed to update status");
  }
}
function handleParticipantsFileChange(e) {
  const file = e.target.files?.[0] || null;

  if (event.value?.participantsFile?.storageKey) {
    const confirmed = window.confirm(
      "Replacing the file will delete existing participants. Continue?"
    );
    if (!confirmed) return;
  }

  selectedParticipantsFile.value = file;

  if (file) {
    uploadParticipantsFile();
  }
}
async function uploadParticipantsFile() {
  if (!event.value?.id) {
    showPageNotice("error", "Event not loaded");
    return;
  }

  if (!selectedParticipantsFile.value) {
    showPageNotice("error", "Please choose a file first");
    return;
  }

  clearPageNotice();

  try {
    isUploadingParticipantsFile.value = true;

    const data = await uploadParticipantsFileApi(
    event.value.id,
    selectedParticipantsFile.value
    );

    event.value = data.event;
    selectedParticipantsFile.value = null;

    if (participantsFileInput.value) {
      participantsFileInput.value.value = "";
    }

    showPageNotice("success", "Participants file uploaded successfully");
  } catch (error) {
    console.error("Upload failed:", error);
    showPageNotice("error", error.message || "Upload failed");
  } finally {
    isUploadingParticipantsFile.value = false;
  }
}
function formatDateTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString();
}
function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
onMounted(async () => {
  await loadEvent();
  await loadParticipants();
});
async function processParticipantsFile() {
  clearPageNotice();

  try {
    const data = await processParticipantsFileApi(event.value.id);

    event.value = data.event;
    await loadParticipants();

    previewParticipants.value = (data.previewParticipants || []).slice(0, 8);
    showParticipantsPreview.value = true;

    showPageNotice("success", "Participants file processed successfully");
  } catch (error) {
    console.error(error);
    showPageNotice("error", error.message || "Process failed");
  }
}
async function loadParticipants() {
  try {
    participantsLoading.value = true;

    const data = await getParticipants(eventId);

    participants.value = data.participants || [];
  } catch (error) {
    console.error("Load participants failed:", error);
  } finally {
    participantsLoading.value = false;
  }
}
async function deleteParticipantsFile() {
  const confirmed = window.confirm(
    "Are you sure you want to delete the participants file and all processed participants for this event?"
  );

  if (!confirmed) return;

  try {
    clearPageNotice();
    isDeletingParticipantsFile.value = true;

    const data = await deleteParticipantsFileApi(event.value.id);

    event.value = data.event;
    participants.value = [];
    previewParticipants.value = [];
    showParticipantsPreview.value = false;
    selectedParticipantsFile.value = null;

    if (participantsFileInput.value) {
      participantsFileInput.value.value = "";
    }

    showPageNotice("success", "Participants file deleted successfully");
  } catch (error) {
    console.error(error);
    showPageNotice("error", error.message || "Delete failed");
  } finally {
    isDeletingParticipantsFile.value = false;
  }
}
function triggerParticipantsFileUpload() {
  participantsFileInput.value?.click();
}
function openEditParticipantModal(participant) {
  selectedParticipant.value = participant;

  participantEditForm.value = {
    name: participant.name || "",
    phoneNumber: participant.phoneNumber || "",
    jobTitle: participant.jobTitle || "",
    academicResume: participant.academicResume || "",
    professionalResume: participant.professionalResume || "",
    personalResume: participant.personalResume || "",
    iWantToMeet: participant.iWantToMeet || "",
    photoUrl: participant.photoUrl || "",
  };

  showEditParticipantModal.value = true;
}
async function saveParticipantEdit() {
  if (!selectedParticipant.value) return;

  clearPageNotice();

  try {
    isSavingParticipant.value = true;

    const data = await updateParticipantApi(
      event.value.id,
      selectedParticipant.value.id,
      participantEditForm.value
    );

   const updatedParticipant = data.participant;

    participants.value = participants.value.map((participant) =>
      participant.id === updatedParticipant.id ? updatedParticipant : participant
    );

    previewParticipants.value = previewParticipants.value.map((participant) =>
      participant.id === updatedParticipant.id ? updatedParticipant : participant
    );

    showEditParticipantModal.value = false;
    selectedParticipant.value = null;

    showPageNotice("success", "Participant updated successfully");

    if (event.value?.matchingStatus === "completed") {
      openParticipantRecalcModal(updatedParticipant, "updated");
    }
  } catch (error) {
    console.error(error);
    showPageNotice("error", error.message || "Failed to update participant");
  } finally {
    isSavingParticipant.value = false;
  }
}
function closeEditParticipantModal() {
  showEditParticipantModal.value = false;
  selectedParticipant.value = null;
}
function openDeleteParticipantConfirm(participant) {
  participantToDelete.value = participant;
  showDeleteParticipantConfirm.value = true;
}
async function deleteParticipant() {
  if (!participantToDelete.value) return;

  try {
    clearPageNotice();
    isDeletingParticipant.value = true;

    await deleteParticipantApi(
      event.value.id,
      participantToDelete.value.id
    );

    participants.value = participants.value.filter(
      (item) => item.id !== participantToDelete.value.id
    );

    previewParticipants.value = previewParticipants.value.filter(
      (item) => item.id !== participantToDelete.value.id
    );

    showDeleteParticipantConfirm.value = false;
    participantToDelete.value = null;

    showPageNotice("success", "Participant deleted successfully");
  } catch (error) {
    console.error(error);
    showPageNotice("error", error.message || "Failed to delete participant");
  } finally {
    isDeletingParticipant.value = false;
  }
}
function closeDeleteParticipantConfirm() {
  showDeleteParticipantConfirm.value = false;
  participantToDelete.value = null;
}
function openCreateParticipantModal() {
  selectedParticipant.value = null;

  participantEditForm.value = {
    name: "",
    phoneNumber: "",
    jobTitle: "",
    academicResume: "",
    professionalResume: "",
    personalResume: "",
    iWantToMeet: "",
    photoUrl: "",
  };

  showEditParticipantModal.value = true;
}
async function createParticipant() {
  clearPageNotice();

  try {
    isCreatingParticipant.value = true;

    const data = await createParticipantApi(
      event.value.id,
      participantEditForm.value
    );

    const createdParticipant = data.participant;

    participants.value = [createdParticipant, ...participants.value];

    showEditParticipantModal.value = false;
    selectedParticipant.value = null;

    showPageNotice("success", "Participant created successfully");

    if (event.value?.matchingStatus === "completed") {
      openParticipantRecalcModal(createdParticipant, "created");
    }
  } catch (error) {
    console.error(error);
    showPageNotice("error", error.message || "Failed to create participant");
  } finally {
    isCreatingParticipant.value = false;
  }
}
async function saveParticipantForm() {
  if (!validateParticipantForm()) return;

  if (selectedParticipant.value) {
    await saveParticipantEdit();
  } else {
    await createParticipant();
  }
}
function validateParticipantForm() {
  participantFormErrors.value = {
    name: "",
    phoneNumber: "",
    jobTitle: "",
    professionalResume: "",
    academicResume: "",
    personalResume: "",
    iWantToMeet: "",
  };

  participantFormGeneralError.value = "";

  let isValid = true;

  if (!participantEditForm.value.name.trim()) {
    participantFormErrors.value.name = "Name is required";
    isValid = false;
  }

  if (!participantEditForm.value.phoneNumber.trim()) {
    participantFormErrors.value.phoneNumber = "Phone number is required";
    isValid = false;
  }

  if (!participantEditForm.value.jobTitle.trim()) {
    participantFormErrors.value.jobTitle = "Job title is required";
    isValid = false;
  }
if (!participantEditForm.value.professionalResume.trim()) {
    participantFormErrors.value.professionalResume = "Professional resume is required";
    isValid = false;
  }
  if (!participantEditForm.value.academicResume.trim()) {
    participantFormErrors.value.academicResume = "Academic resume is required";
    isValid = false;
  }
  if (!participantEditForm.value.personalResume.trim()) {
    participantFormErrors.value.personalResume = "Personal resume is required";
    isValid = false;
  }
  if (!participantEditForm.value.iWantToMeet.trim()) {
    participantFormErrors.value.iWantToMeet = "This field is required";
    isValid = false;
  }

  if (!isValid) {
    participantFormGeneralError.value =
      "Please fill all required fields before saving.";
  }

  return isValid;
}
function showPageNotice(type, message) {
  pageNotice.value = { type, message };
}
function clearPageNotice() {
  pageNotice.value = { type: "", message: "" };
}
async function calculateMatchesForEvent() {
  try {
    clearPageNotice();
    isCalculatingMatches.value = true;

    event.value = {
      ...event.value,
      matchingStatus: "processing",
    };

    await calculateMatchesForEventApi(event.value.id);

    event.value = {
      ...event.value,
      matchingStatus: "completed",
    };

    showPageNotice("success", "Matches calculated successfully");
  } catch (error) {
    console.error(error);

    event.value = {
      ...event.value,
      matchingStatus: "pending",
    };

    showPageNotice("error", error.message || "Failed to calculate matches");
  } finally {
    isCalculatingMatches.value = false;
  }
}
function openParticipantRecalcModal(participant, mode) {
  participantToRecalculate.value = participant;
  participantRecalcMode.value = mode;
  showParticipantRecalcModal.value = true;
}
async function handleParticipantRecalculation() {
  if (!participantToRecalculate.value) return;

  try {
    isRecalculatingParticipant.value = true;
    clearPageNotice();

    if (participantRecalcMode.value === "created") {
      await recalculateAddedParticipantMatchesApi(
        event.value.id,
        participantToRecalculate.value.id
      );
    } else if (participantRecalcMode.value === "updated") {
      await recalculateUpdatedParticipantMatchesApi(
        event.value.id,
        participantToRecalculate.value.id
      );
    }

    showParticipantRecalcModal.value = false;

    showPageNotice(
      "success",
      `Participant recalculation completed for ${
        participantToRecalculate.value?.name || "participant"
      }`
    );

    participantToRecalculate.value = null;
    participantRecalcMode.value = "";
  } catch (error) {
    console.error(error);
    showPageNotice(
      "error",
      error.message || "Failed to recalculate participant matches"
    );
  } finally {
    isRecalculatingParticipant.value = false;
  }
}
</script>

<template>
  <AdminLayout>
    <div class="event-details-page">
      <div class="page-header">
        <button class="back-btn" @click="$router.push('/admin/events')">
          ← Back to Events
        </button>

        <div class="page-title-block">
          <h1>Event Details</h1>
          <p>Manage this event and view its details.</p>
        </div>
      </div>
      <div
        v-if="pageNotice.message"
        class="page-notice"
        :class="pageNotice.type === 'success' ? 'notice-success' : 'notice-error'"
      >
        {{ pageNotice.message }}
      </div>
      <p v-if="loading">Loading event...</p>
      <p v-else-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div v-else-if="event" class="event-details-layout">
        <section class="event-main-card">
          <div class="card-header">
            <div class="card-title-wrap">
              <h2 v-if="!isEditing">{{ event.name }}</h2>
              <input
                v-else
                v-model="editForm.name"
                class="title-input"
                type="text"
                placeholder="Event name"
              />
            </div>

            <div class="card-actions">
              <template v-if="!isEditing">
                <button class="edit-btn" @click="isEditing = true">
                  Edit
                </button>

                <button class="delete-btn" @click="showDeleteConfirm = true">
                  Delete
                </button>
                <button class="save-btn" @click="showQrModal = true">
                  Create QR Code
                </button>
              </template>

              <template v-else>
                <button class="save-btn" @click="updateEvent">
                  Save
                </button>

                <button class="cancel-btn" @click="cancelEdit">
                  Cancel
                </button>
              </template>
            </div>
          </div>

          <div v-if="!isEditing" class="details-grid">
            <div class="detail-item">
              <label>Date</label>
              <p>{{ event.date || "—" }}</p>
            </div>

            <div class="detail-item">
              <label>Location</label>
              <p>{{ event.location || "—" }}</p>
            </div>

            <div class="detail-item">
              <label>Status</label>

              <div class="status-switch">
                <button
                  class="status-option"
                  :class="{ active: event.status === 'draft', draft: event.status === 'draft' }"
                  @click="updateStatus('draft')"
                >
                  Draft
                </button>

                <button
                  class="status-option"
                  :class="{ active: event.status === 'published', published: event.status === 'published' }"
                  @click="updateStatus('published')"
                >
                  Published
                </button>

                <button
                  class="status-option"
                  :class="{ active: event.status === 'archived', archived: event.status === 'archived' }"
                  @click="updateStatus('archived')"
                >
                  Archived
                </button>
              </div>
            </div>

            <div class="detail-item full-width">
              <label>Description</label>
              <p>{{ event.description || "—" }}</p>
            </div>

            <div class="detail-item full-width">
              <label>Languages</label>

              <p v-if="event.supportedLanguages?.length">
                {{ event.supportedLanguages.join(", ") }}
              </p>

              <p v-else>—</p>
            </div>
          </div>

          <div v-else class="details-grid">
            <div class="detail-item">
              <label>Date</label>
              <input v-model="editForm.date" type="date" />
            </div>

            <div class="detail-item">
              <label>Location</label>
              <input v-model="editForm.location" type="text" />
            </div>

            <div class="detail-item">
              <label>Status</label>
              <select v-model="editForm.status">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div class="detail-item full-width">
              <label>Supported Languages</label>

              <div class="languages-grid">
                <label>
                  <input type="checkbox" value="he" v-model="editForm.supportedLanguages" />
                  Hebrew
                </label>

                <label>
                  <input type="checkbox" value="en" v-model="editForm.supportedLanguages" />
                  English
                </label>

                <label>
                  <input type="checkbox" value="ar" v-model="editForm.supportedLanguages" />
                  Arabic
                </label>
              </div>
            </div>

            <div class="detail-item full-width">
              <label>Description</label>
              <textarea
                v-model="editForm.description"
                placeholder="Event description"
              ></textarea>
            </div>
          </div>
        </section>

<ParticipantsDataFileSection
  :event="event"
  :participants="participants"
  :participantsLoading="participantsLoading"
  :isUploadingParticipantsFile="isUploadingParticipantsFile"
  :isDeletingParticipantsFile="isDeletingParticipantsFile"
  :formatDateTime="formatDateTime"
  :formatFileSize="formatFileSize"
  @process-file="processParticipantsFile"
  @delete-file="deleteParticipantsFile"
  @view-participants="showParticipantsModal = true"
  @trigger-upload="triggerParticipantsFileUpload"
  :matchingLoading="isCalculatingMatches"
@calculate-matches="calculateMatchesForEvent"
/>
        <section class="event-secondary-card">
          <h3>Event Analytics</h3>
          <p>Analytics, reports, and additional event tools will appear here later.</p>
        </section>
        <input
          ref="participantsFileInput"
          type="file"
          accept=".csv,.xls,.xlsx"
          @change="handleParticipantsFileChange"
          style="display: none"
        />
      </div>
      <div v-if="showDeleteConfirm" class="modal-overlay">
        <div class="modal-card delete-modal">
          <h3>Delete Event</h3>
          <p>Are you sure you want to delete this event? This action cannot be undone.</p>

          <div class="modal-actions">
            <button class="cancel-btn" @click="showDeleteConfirm = false">
              Cancel
            </button>
            <button class="delete-btn" @click="deleteEvent">
              Delete
            </button>
          </div>
        </div>
      </div>
      <div v-if="showParticipantsPreview" class="modal-overlay">
        <div class="modal-card preview-modal">
          <h3>Processed Participants Preview</h3>
          <p>
            The data was processed and saved successfully. Please review a few rows to
            make sure the field mapping is correct. If something looks wrong, delete the
            processed participants or replace the file and process again.
          </p>

          <div v-if="previewParticipants.length" class="preview-list">
            <div
              v-for="participant in previewParticipants"
              :key="participant.id"
              class="preview-card"
            >
              <p><strong>Name:</strong> {{ participant.name || "—" }}</p>
              <p><strong>Phone:</strong> {{ participant.phoneNumber || "—" }}</p>
              <p><strong>Job Title:</strong> {{ participant.jobTitle || "—" }}</p>
              <p><strong>I want to meet:</strong> {{ participant.iWantToMeet || "—" }}</p>
              <p><strong>Academic Resume:</strong> {{ participant.academicResume || "—" }}</p>
              <p><strong>Professional Resume:</strong> {{ participant.professionalResume || "—" }}</p>
              <p><strong>Personal Resume:</strong> {{ participant.personalResume || "—" }}</p>
            </div>
          </div>

          <div v-else>
            <p>No preview data available.</p>
          </div>

          <div class="modal-actions">
            <button class="cancel-btn" @click="showParticipantsPreview = false">
              Close
            </button>
          </div>
        </div>
      </div>
      <div v-if="showParticipantRecalcModal" class="modal-overlay">
        <div class="modal-card delete-modal">
            <h3>Participant Recalculation Required</h3>
          <p>
            This participant was
            {{ participantRecalcMode === "created" ? "added" : "updated" }}
            after event match calculation was completed.
          </p>

          <p>
            Since event matching has already been completed, matches for
            <strong>{{ participantToRecalculate?.name || "this participant" }}</strong>
            must be recalculated now.
          </p>

          <div class="modal-actions">
           
            <button
              class="save-btn"
              @click="handleParticipantRecalculation"
              :disabled="isRecalculatingParticipant"
            >
              {{ isRecalculatingParticipant ? "Recalculating..." : "Recalculate Now" }}
            </button>
          </div>
        </div>
      </div>
<ParticipantsModal
  :show="showParticipantsModal"
  :participants="participants"
  :filteredParticipants="filteredParticipants"
  :participantsSearch="participantsSearch"
  :participantsLoading="participantsLoading"
  @close="
    showParticipantsModal = false;
    participantsSearch = '';
  "
  @search="participantsSearch = $event"
  @edit="openEditParticipantModal"
  @delete="openDeleteParticipantConfirm"
  @create="openCreateParticipantModal"
/>
<EditParticipantModal
  :show="showEditParticipantModal"
  :selectedParticipant="selectedParticipant"
  :participantEditForm="participantEditForm"
  :participantFormErrors="participantFormErrors"
  :participantFormGeneralError="participantFormGeneralError"
  :isSavingParticipant="isSavingParticipant"
  :isCreatingParticipant="isCreatingParticipant"
  @close="closeEditParticipantModal"
  @save="saveParticipantForm"
  @update:name="participantEditForm.name = $event"
  @update:phoneNumber="participantEditForm.phoneNumber = $event"
  @update:jobTitle="participantEditForm.jobTitle = $event"
  @update:academicResume="participantEditForm.academicResume = $event"
  @update:professionalResume="participantEditForm.professionalResume = $event"
  @update:personalResume="participantEditForm.personalResume = $event"
  @update:iWantToMeet="participantEditForm.iWantToMeet = $event"
  @update:photoUrl="participantEditForm.photoUrl = $event"
/>
<DeleteParticipantConfirmModal
  :show="showDeleteParticipantConfirm"
  :participant="participantToDelete"
  :isDeletingParticipant="isDeletingParticipant"
  @close="closeDeleteParticipantConfirm"
  @confirm="deleteParticipant"
/>
<EventQrModal
  :show="showQrModal"
  :event="event"
  @close="showQrModal = false"
/>
    </div>
  </AdminLayout>
</template>

<style scoped>
.event-details-page h1 {
  margin: 0;
  color: #1f3b2d;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.card-title-wrap {
  flex: 1;
  min-width: 220px;
}
.card-title-wrap h2 {
  margin: 0;
  color: #234532;
}
.card-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.detail-item.full-width {
  grid-column: 1 / -1;
}
.detail-item label {
  font-weight: 600;
  color: #234532;
}
.detail-item p {
  margin: 0;
  color: #4f5f57;
  line-height: 1.5;
}
.title-input,
.detail-item input,
.detail-item select,
.detail-item textarea {
  padding: 0.85rem 1rem;
  border: 1px solid #d5ddd8;
  border-radius: 12px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
  outline: none;
}
.detail-item textarea {
  min-height: 120px;
  resize: vertical;
}
.edit-btn,
.save-btn,
.cancel-btn {
  padding: 0.85rem 1.1rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.edit-btn,
.save-btn {
  background: #2e8b57;
  color: white;
}
.cancel-btn {
  background: #e7ece9;
  color: #234532;
}
.event-secondary-card h3 {
  margin-top: 0;
  color: #234532;
}
.event-secondary-card p {
  margin-bottom: 0;
  color: #5f6f66;
}
.error-message {
  color: #c0392b;
}
@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
.event-details-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
}
.page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
}
.page-title-block h1 {
  margin: 0;
  color: #1f3b2d;
}
.page-title-block p {
  margin: 0;
  color: #5f6f66;
  font-size: 0.98rem;
}
.back-btn {
  background: none;
  border: none;
  padding: 0;
  color: #2e8b57;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
}
.back-btn:hover {
  text-decoration: underline;
}
.event-details-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.event-main-card,
.event-secondary-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}
.status-badge.draft {
  background: #f3f4f6;
  color: #4b5563;
}
.status-badge.published {
  background: #dcfce7;
  color: #166534;
}
.status-badge.archived {
  background: #fee2e2;
  color: #991b1b;
}
.delete-btn {
  background: #991b1b;
  color: white;
  border: 1px solid #f1caca;
  padding: 0.85rem 1.1rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.card-actions button {
  min-width: 96px;
}
.status-switch {
  display: inline-flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.status-option {
  border: none;
  background: #e5e7eb;
  color: #4b5563;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}
.status-option.active.draft {
  background: #facc15;
  color: #3f3f1a;
}
.status-option.active.published {
  background: #22c55e;
  color: white;
}
.status-option.active.archived {
  background: #ef4444;
  color: white;
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
  max-width: 420px;
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}
.delete-modal {
  max-width: 420px;
}
.languages-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.languages-grid label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
}
.participants-list {
  display: grid;
  gap: 1rem;
}
.participant-card {
  border: 1px solid #dfe6e2;
  border-radius: 14px;
  padding: 1rem;
  background: #fafcfb;
}
.participant-card p {
  margin: 0 0 0.45rem 0;
}
.preview-modal {
  max-width: 720px;
}
.preview-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
  max-height: 420px;
  overflow-y: auto;
}
.preview-card {
  border: 1px solid #dfe6e2;
  border-radius: 12px;
  padding: 0.9rem;
  background: #fafcfb;
}
.preview-card p {
  margin: 0 0 0.35rem 0;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.page-notice {
  padding: 0.9rem 1rem;
  border-radius: 12px;
  font-weight: 600;
}
.notice-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}
.notice-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

</style>