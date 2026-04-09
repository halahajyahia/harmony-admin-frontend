<script setup>
const props = defineProps({
  show: Boolean,
  selectedParticipant: Object,
  participantEditForm: {
    type: Object,
    required: true,
  },
  participantFormErrors: {
    type: Object,
    required: true,
  },
  participantFormGeneralError: {
    type: String,
    default: "",
  },
  isSavingParticipant: Boolean,
  isCreatingParticipant: Boolean,
});

const emit = defineEmits([
  "close",
  "save",
  "update:name",
  "update:phoneNumber",
  "update:jobTitle",
  "update:academicResume",
  "update:professionalResume",
  "update:personalResume",
  "update:iWantToMeet",
  "update:photoUrl",
]);
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-card edit-participant-modal">
      <h3>{{ selectedParticipant ? "Edit Participant" : "Add Participant" }}</h3>

      <div class="edit-participant-form">
        <label>
          Name *
          <input
            :value="participantEditForm.name"
            type="text"
            :class="{ 'input-error': participantFormErrors.name }"
            @input="$emit('update:name', $event.target.value)"
          />
          <span v-if="participantFormErrors.name" class="field-error">
            {{ participantFormErrors.name }}
          </span>
        </label>

        <label>
          Phone Number *
          <input
            :value="participantEditForm.phoneNumber"
            type="text"
            :class="{ 'input-error': participantFormErrors.phoneNumber }"
            @input="$emit('update:phoneNumber', $event.target.value)"
          />
          <span v-if="participantFormErrors.phoneNumber" class="field-error">
            {{ participantFormErrors.phoneNumber }}
          </span>
        </label>

        <label>
          Job Title *
          <input
            :value="participantEditForm.jobTitle"
            type="text"
            :class="{ 'input-error': participantFormErrors.jobTitle }"
            @input="$emit('update:jobTitle', $event.target.value)"
          />
          <span v-if="participantFormErrors.jobTitle" class="field-error">
            {{ participantFormErrors.jobTitle }}
          </span>
        </label>


        <label>
          Professional Resume *
          <input
            :value="participantEditForm.professionalResume"
            type="text"
            :class="{ 'input-error': participantFormErrors.professionalResume }"
            @input="$emit('update:professionalResume', $event.target.value)"
          />
          <span v-if="participantFormErrors.professionalResume" class="field-error">
            {{ participantFormErrors.professionalResume }}
          </span>
        </label>

          <label>
          Academic Resume *
          <input
            :value="participantEditForm.academicResume"
            type="text"
            :class="{ 'input-error': participantFormErrors.academicResume }"
            @input="$emit('update:academicResume', $event.target.value)"
          />
          <span v-if="participantFormErrors.academicResume" class="field-error">
            {{ participantFormErrors.academicResume }}
          </span>
        </label>


        <label>
          Personal Resume *
         <input
            :value="participantEditForm.personalResume"
            type="text"
            :class="{ 'input-error': participantFormErrors.personalResume }"
            @input="$emit('update:personalResume', $event.target.value)"
          />
          <span v-if="participantFormErrors.personalResume" class="field-error">
            {{ participantFormErrors.personalResume }}
          </span>
        </label>


        <label>
          I Want to Meet *
          <input
            :value="participantEditForm.iWantToMeet"
            type="text"
            :class="{ 'input-error': participantFormErrors.iWantToMeet }"
            @input="$emit('update:iWantToMeet', $event.target.value)"
          />
          <span v-if="participantFormErrors.iWantToMeet" class="field-error">
            {{ participantFormErrors.iWantToMeet }}
          </span>
        </label>

        <label>
          Photo URL
          <input
            :value="participantEditForm.photoUrl"
            type="text"
            @input="$emit('update:photoUrl', $event.target.value)"
          />
        </label>
      </div>

      <p v-if="participantFormGeneralError" class="form-general-error">
        {{ participantFormGeneralError }}
      </p>

      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('close')">
          Cancel
        </button>

        <button
          class="save-btn"
          @click="$emit('save')"
          :disabled="isSavingParticipant || isCreatingParticipant"
        >
          {{
            isSavingParticipant || isCreatingParticipant
              ? "Saving..."
              : "Save"
          }}
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
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}
.edit-participant-modal {
  max-width: 760px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
}
.edit-participant-form {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}
.edit-participant-form label {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-weight: 600;
  color: #234532;
}
.edit-participant-form input,
.edit-participant-form textarea {
  padding: 0.85rem 1rem;
  border: 1px solid #d5ddd8;
  border-radius: 12px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
  outline: none;
}
.edit-participant-form textarea {
  min-height: 110px;
  resize: vertical;
}
.field-error {
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 500;
}
.form-general-error {
  color: #dc2626;
  font-weight: 600;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.input-error {
  border-color: #dc2626 !important;
}
.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.save-btn,
.cancel-btn {
  padding: 0.85rem 1.1rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.save-btn {
  background: #2e8b57;
  color: white;
}
.cancel-btn {
  background: #e7ece9;
  color: #234532;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>