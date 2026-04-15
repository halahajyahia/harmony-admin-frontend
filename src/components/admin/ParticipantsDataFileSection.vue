<script setup>
import { computed } from "vue";

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
  isProcessingParticipantsFile: Boolean,
});

const emit = defineEmits([
  "process-file",
  "delete-file",
  "view-participants",
  "trigger-upload",
  "calculate-matches",
]);

const hasFile = computed(() => {
  return !!props.event?.participantsFile?.originalName;
});

const isProcessed = computed(() => {
  return (props.event?.participantsImport?.processedRows ?? 0) > 0;
});

const hasParticipants = computed(() => {
  return props.participants.length > 0;
});

const isMatchingCompleted = computed(() => {
  return props.event?.matchingStatus === "completed";
});

const importStatusLabel = computed(() => {
  const status = props.event?.participantsImport?.status || "not_started";

  if (status === "processing") return "Processing";
  if (status === "completed") return "Completed";
  if (status === "failed") return "Failed";
  return "Not Started";
});

const matchingStatusLabel = computed(() => {
  const status = props.event?.matchingStatus || "pending";

  if (status === "processing") return "Processing";
  if (status === "completed") return "Completed";
  if (status === "failed") return "Failed";
  return "Pending";
});

const importStatusClass = computed(() => {
  const status = props.event?.participantsImport?.status || "not_started";

  if (status === "processing") return "warning";
  if (status === "completed") return "success";
  if (status === "failed") return "danger";
  return "neutral";
});

const matchingStatusClass = computed(() => {
  const status = props.event?.matchingStatus || "pending";

  if (status === "processing") return "warning";
  if (status === "completed") return "success";
  if (status === "failed") return "danger";
  return "neutral";
});

const uploadState = computed(() => {
  if (props.isUploadingParticipantsFile) return "loading";
  if (hasFile.value) return "completed";
  return "active";
});

const processState = computed(() => {
  if (!hasFile.value) return "disabled";
  if (
    props.isProcessingParticipantsFile ||
    props.event?.participantsImport?.status === "processing"
  ) {
    return "loading";
  }
  if (isProcessed.value) return "completed";
  return "active";
});

const viewState = computed(() => {
  if (!isProcessed.value) return "disabled";
  if (props.participantsLoading) return "loading";
  if (hasParticipants.value) return "active";
  return "disabled";
});

const generateState = computed(() => {
  if (!hasParticipants.value) return "disabled";
  if (props.matchingLoading || props.event?.matchingStatus === "processing") {
    return "loading";
  }
  if (isMatchingCompleted.value) return "completed";
  return "active";
});

const uploadLabel = computed(() => {
  if (uploadState.value === "loading") return "Uploading...";
  if (uploadState.value === "completed") return "Uploaded";
  return "Upload";
});

const processLabel = computed(() => {
  if (processState.value === "loading") return "Processing...";
  if (processState.value === "completed") return "Processed";
  return "Process";
});

const viewLabel = computed(() => {
  if (viewState.value === "loading") return "Loading...";
  return "View";
});

const generateLabel = computed(() => {
  if (generateState.value === "loading") return "Generating...";
  if (generateState.value === "completed") return "Generated";
  return "Generate Matches";
});

function handleUploadClick() {
  if (uploadState.value === "loading") return;
  emit("trigger-upload");
}

function handleProcessClick() {
  if (processState.value !== "active") return;
  emit("process-file");
}

function handleViewClick() {
  if (viewState.value !== "active") return;
  emit("view-participants");
}

function handleGenerateClick() {
  if (generateState.value !== "active") return;
  emit("calculate-matches");
}
</script>

<template>
  <section class="event-secondary-card file-workflow-card">
    <div class="workflow-header">
      <div class="file-thumbnail">
        <div class="file-icon">📄</div>
      </div>

      <div class="workflow-header-text">
        <h3>Participants Data File</h3>
        <p class="workflow-subtitle">
          Upload, process, review participants, and generate matches.
        </p>

        <div v-if="event?.participantsFile" class="file-name-row">
          <span class="file-name">{{ event.participantsFile.originalName }}</span>
        </div>
      </div>

      <div v-if="event?.participantsFile" class="workflow-top-actions">
        <button
          class="icon-btn"
          title="Replace file"
          @click="$emit('trigger-upload')"
          :disabled="isUploadingParticipantsFile"
        >
          ↻
        </button>

        <button
          class="icon-btn danger"
          title="Delete file"
          @click="$emit('delete-file')"
          :disabled="isDeletingParticipantsFile"
        >
          🗑
        </button>
      </div>
    </div>

<div class="workflow-steps">
  <button
    class="step-chip"
    :class="uploadState"
    @click="handleUploadClick"
  >
    <span>{{ uploadLabel }}</span>
  </button>

  <button
    class="step-chip"
    :class="processState"
    @click="handleProcessClick"
  >
    <span>{{ processLabel }}</span>
  </button>

  <button
    class="step-chip"
    :class="generateState"
    @click="handleGenerateClick"
  >
    <span>{{ generateLabel }}</span>
  </button>
</div>
<div class="workflow-secondary-actions">
  <button
    class="secondary-link-btn"
    @click="$emit('view-participants')"
    :disabled="!participants.length || participantsLoading || !isProcessed"
  >
    {{
      participantsLoading
        ? "Loading participants..."
        : `View Participants (${participants.length})`
    }}
  </button>
</div>
    <div v-if="event?.participantsFile" class="file-sections">
      <div class="info-section">
        <h4>File Info</h4>

        <div class="info-row">
          <span class="label">Current file</span>
          <span class="value">{{ event.participantsFile.originalName }}</span>
        </div>

        <div class="info-row">
          <span class="label">Uploaded at</span>
          <span class="value">
            {{ formatDateTime(event.participantsFile.uploadedAt) }}
          </span>
        </div>

        <div class="info-row">
          <span class="label">Size</span>
          <span class="value">
            {{ formatFileSize(event.participantsFile.size) }}
          </span>
        </div>
      </div>

      <div class="info-section">
        <h4>Processing Status</h4>

        <div class="info-row">
          <span class="label">Import status</span>
          <span class="status-pill" :class="importStatusClass">
            {{ importStatusLabel }}
          </span>
        </div>

        <div class="info-row">
          <span class="label">Matching status</span>
          <span class="status-pill" :class="matchingStatusClass">
            {{ matchingStatusLabel }}
          </span>
        </div>

        <div class="info-row">
          <span class="label">Total rows</span>
          <span class="value">{{ event.participantsImport?.totalRows ?? 0 }}</span>
        </div>

        <div class="info-row">
          <span class="label">Processed rows</span>
          <span class="value">{{ event.participantsImport?.processedRows ?? 0 }}</span>
        </div>

        <div class="info-row">
          <span class="label">Failed rows</span>
          <span class="value">{{ event.participantsImport?.failedRows ?? 0 }}</span>
        </div>
      </div>
    </div>

    <div v-else class="participants-file-empty">
      <p>No participants file uploaded yet.</p>
      <p class="empty-subtitle">
        Start by uploading a CSV or Excel participants file.
      </p>
    </div>

    
  </section>
</template>

<style scoped>
.file-workflow-card {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.workflow-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.file-thumbnail {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: #f1f6f3;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-icon {
  font-size: 24px;
}

.workflow-header-text {
  flex: 1;
  min-width: 0;
}

.workflow-header-text h3 {
  margin: 0;
  color: #234532;
}

.workflow-subtitle {
  margin: 6px 0 0;
  color: #5f6f66;
  font-size: 0.95rem;
}

.file-name-row {
  margin-top: 10px;
}

.file-name {
  display: inline-block;
  font-weight: 700;
  color: #173524;
  word-break: break-word;
}

.workflow-top-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #eef4f0;
  color: #234532;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
}

.icon-btn:hover {
  background: #e1ece5;
}

.icon-btn.danger {
  background: #fde8e8;
  color: #991b1b;
}

.icon-btn.danger:hover {
  background: #f8d7d7;
}

.workflow-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 10px;
}

.step-chip {
  min-height: 48px;
  padding: 10px 14px;
  border: none;
  border-radius: 999px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s ease;
}

.step-chip.active {
  background: #2e8b57;
  color: white;
}

.step-chip.loading {
  background: #fff4cc;
  color: #8a6d00;
}

.step-chip.completed {
  background: #dcfce7;
  color: #166534;
}

.step-chip.disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.file-sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 20px;
}

.info-section {
  background: #f8faf8;
  border: 1px solid #e7ece8;
  border-radius: 18px;
  padding: 18px;
}

.info-section h4 {
  margin: 0 0 14px;
  color: #234532;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #edf1ee;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #6b7a71;
  font-size: 14px;
}

.value {
  color: #173524;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.status-pill {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-pill.neutral {
  background: #eef1ef;
  color: #5f6f65;
}

.status-pill.warning {
  background: #fff4cc;
  color: #8a6d00;
}

.status-pill.success {
  background: #dcfce7;
  color: #166534;
}

.status-pill.danger {
  background: #fee2e2;
  color: #991b1b;
}

.participants-file-empty {
  padding: 16px 18px;
  border-radius: 16px;
  background: #f8faf8;
  border: 1px dashed #d8e1db;
}

.participants-file-empty p {
  margin: 0;
  color: #5f6f66;
}

.empty-subtitle {
  margin-top: 6px !important;
  font-size: 0.92rem;
}

.workflow-footer {
  display: flex;
  justify-content: flex-start;
}

.secondary-link-btn {
  padding: 0.85rem 1.1rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  background: #eef4f0;
  color: #234532;
}

.secondary-link-btn:disabled,
.icon-btn:disabled,
.step-chip:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .file-sections {
    grid-template-columns: 1fr;
  }

  .workflow-steps {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .workflow-header {
    flex-direction: column;
  }

  .workflow-top-actions {
    align-self: flex-end;
  }

  .workflow-steps {
    grid-template-columns: 1fr;
  }
}
.workflow-secondary-actions {
  display: flex;
  justify-content: center;
  margin-top: -4px;
}
</style>