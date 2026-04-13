<script setup>
import { computed, ref, watch } from "vue";
import QRCode from "qrcode";

const props = defineProps({
  show: Boolean,
  event: Object,
});

const emit = defineEmits(["close"]);

const qrData = ref("");
const baseUrl = import.meta.env.VITE_PARTICIPANT_APP_BASE_URL;

const eventLink = computed(() => {
  if (!props.event?.id) return "";
  return `${baseUrl}/event/${props.event.id}/login`;
});

watch(
  () => props.show,
  async (val) => {
    if (val && eventLink.value) {
      qrData.value = await QRCode.toDataURL(eventLink.value);
    }
  }
);

function copyLink() {
  navigator.clipboard.writeText(eventLink.value);
}

function downloadQr() {
  const a = document.createElement("a");
  a.href = qrData.value;
  a.download = `event-${props.event.id}-qr.png`;
  a.click();
}
</script>

<template>
    
  <div v-if="show" class="modal-overlay">
    <div class="modal-card">
       <div class="header">
        <h3>Create Event QR</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
        </div> 
      <img :src="qrData" class="qr-image" />

      <input :value="eventLink" readonly />

      <div class="actions">
        <button @click="copyLink">Copy Link</button>
        <button @click="downloadQr">Download QR</button>
        <button @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 999;
}

.modal-card {
  background: white;
  padding: 1.5rem;
  border-radius: 18px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-card h3 {
  margin: 0;
  color: #1f3b2d;
}

.qr-image {
  width: 240px;
  height: 240px;
  margin: 0 auto;
  display: block;
  background: #f7faf8;
  padding: 10px;
  border-radius: 14px;
}

.modal-card input {
  width: 100%;
  padding: 0.75rem 0.85rem;
  border: 1px solid #d7e2db;
  border-radius: 10px;
  font-size: 0.9rem;
  background: #fcfdfc;

  box-sizing: border-box;   /* זה החשוב */
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.actions button {
  flex: 1;
  border: none;
  border-radius: 10px;
  padding: 0.65rem;
  cursor: pointer;
  font-weight: 600;
}

.actions button:nth-child(1) {
  background: #234532;
  color: white;
}

.actions button:nth-child(2) {
  background: #e8f1ec;
  color: #234532;
}

.actions button:nth-child(3) {
  background: #eef2f0;
  color: #334155;
}

.actions button:hover {
  opacity: 0.9;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}
</style>