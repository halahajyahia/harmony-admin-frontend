<script setup>
const props = defineProps({
  show: Boolean,
  participant: {
    type: Object,
    default: null,
  },
  isDeletingParticipant: Boolean,
});

const emit = defineEmits(["close", "confirm"]);
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-card delete-modal">
      <h3>Delete Participant</h3>
      <p>
        Are you sure you want to delete
        <strong>{{ participant?.name || "this participant" }}</strong>?
        This action cannot be undone.
      </p>

      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('close')">
          Cancel
        </button>

        <button
          class="delete-btn"
          @click="$emit('confirm')"
          :disabled="isDeletingParticipant"
        >
          {{ isDeletingParticipant ? "Deleting..." : "Delete" }}
        </button>
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
  max-width: 420px;
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}
.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.cancel-btn,
.delete-btn {
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
.delete-btn {
  background: #991b1b;
  color: white;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>