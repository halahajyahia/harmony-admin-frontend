<script setup>
const props = defineProps({
  event: {
    type: Object,
    default: null,
  },
  participants: {
    type: Array,
    default: () => [],
  },
  participantsLoading: Boolean,
  isUploadingParticipantsFile: Boolean,
  isDeletingParticipantsFile: Boolean,
  matchingLoading: Boolean,
  formatDateTime: {
    type: Function,
    required: true,
  },
  formatFileSize: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits([
  "process-file",
  "delete-file",
  "view-participants",
  "trigger-upload",
  "calculate-matches",
]);
</script>

<template>
  <section class="event-secondary-card">
    <h3>Participants Data File</h3>

    <div v-if="event?.participantsFile" class="participants-file-info">
      <p><strong>Current file:</strong> {{ event.participantsFile.originalName }}</p>
      <p><strong>Uploaded at:</strong> {{ formatDateTime(event.participantsFile.uploadedAt) }}</p>
      <p><strong>Size:</strong> {{ formatFileSize(event.participantsFile.size) }}</p>
      <p><strong>Import status:</strong> {{ event.participantsImport?.status || "not_started" }}</p>
      <p><strong>Total rows:</strong> {{ event.participantsImport?.totalRows ?? 0 }}</p>
      <p><strong>Processed rows:</strong> {{ event.participantsImport?.processedRows ?? 0 }}</p>
      <p><strong>Failed rows:</strong> {{ event.participantsImport?.failedRows ?? 0 }}</p>
       <p>
        <strong>Matching status:</strong>
        {{ event?.matchingStatus || "pending" }}
      </p>
    </div>

    <div v-else class="participants-file-empty">
      <p>No participants file uploaded yet.</p>
    </div>

    <div class="participants-file-actions">
      <button
        v-if="event?.participantsFile"
        class="edit-btn"
        @click="$emit('process-file')"
        :disabled="!event?.participantsFile?.storageKey || event.participantsImport?.status === 'processing'"
      >
        {{
          event.participantsImport?.status === "processing"
            ? "Processing..."
            : "Process File"
        }}
      </button>

      <button
        v-if="event?.participantsFile"
        class="delete-btn"
        @click="$emit('delete-file')"
        :disabled="isDeletingParticipantsFile"
      >
        {{ isDeletingParticipantsFile ? "Deleting..." : "Delete File" }}
      </button>

      <button
        class="edit-btn"
        @click="$emit('view-participants')"
        :disabled="!participants.length || participantsLoading"
      >
        {{
          participantsLoading
            ? "Loading Participants..."
            : `View Participants (${participants.length})`
        }}
      </button>
    </div>

    <div class="participants-file-upload">
      <button
        class="edit-btn"
        @click="$emit('trigger-upload')"
        :disabled="isUploadingParticipantsFile"
      >
        {{
          isUploadingParticipantsFile
            ? "Uploading..."
            : event?.participantsFile
            ? "Replace File"
            : "Upload File"
        }}
      </button>
      <button
          v-if="participants.length"
          class="edit-btn"
          @click="$emit('calculate-matches')"
          :disabled="
            !participants.length ||
            matchingLoading ||
            event?.matchingStatus === 'processing'
          "
        >
          {{
            matchingLoading || event?.matchingStatus === "processing"
              ? "Calculating..."
              : "Calculate Matches"
          }}
        </button>

    </div>
  </section>
     
</template>

<style scoped>
.event-secondary-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.event-secondary-card h3 {
  margin-top: 0;
  color: #234532;
}

.participants-file-info,
.participants-file-empty {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.participants-file-info {
  margin-bottom: 0.75rem;
}

.participants-file-info p,
.participants-file-empty p {
  margin: 0;
  color: #5f6f66;
}

.participants-file-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.participants-file-upload {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.participants-file-actions button,
.participants-file-upload button {
  min-width: 170px;
}

.edit-btn,
.delete-btn {
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

.delete-btn {
  background: #991b1b;
  color: white;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>