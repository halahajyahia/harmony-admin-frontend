<script setup>
const props = defineProps({
  event: {
    type: Object,
    default: null,
  },
  analytics: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
});
</script>
<template>
  <section class="event-secondary-card analytics-card">
    <div v-if="showHeader" class="analytics-header">
      <div>
        <h3>Event Analytics</h3>
        <p>Analytics overview for this event.</p>
      </div>

      <span
        v-if="event?.status"
        class="event-status-pill"
        :class="event.status"
      >
        {{ event.status }}
      </span>
    </div>

    <div v-if="loading" class="analytics-loading">
      Loading analytics...
    </div>

<div v-else-if="!analytics && !loading" class="analytics-empty">
          No analytics available yet.
    </div>

    <div v-else class="kpi-grid">
      <div class="kpi-card">
        <p class="kpi-label">Participants</p>
        <h2 class="kpi-value">{{ analytics.totalParticipants }}</h2>
      </div>

      <div class="kpi-card">
        <p class="kpi-label">Arrived Participants</p>
        <h2 class="kpi-value">{{ analytics.arrivedParticipants }}</h2>
      </div>

      <div class="kpi-card circle-kpi-card">
        <p class="kpi-label">Arrival Rate</p>

        <div
          class="progress-circle"
          :style="{
            background: `conic-gradient(#2f8f5b ${analytics.arrivalRate}%, #eef2ef 0%)`
          }"
        >
          <div class="progress-circle-inner">
            {{ analytics.arrivalRate }}%
          </div>
        </div>
      </div>

      <div class="kpi-card">
        <p class="kpi-label">Active Users</p>
        <h2 class="kpi-value">{{ analytics.activeUsersCount }}</h2>

        <div class="rate-bar">
          <div
            class="rate-fill online"
            :style="{ width: `${analytics.activeUsersRate}%` }"
          ></div>
        </div>

        <p class="kpi-sub">
          {{ analytics.activeUsersRate }}% of arrived participants
        </p>
      </div>

      <div class="kpi-card engagement-card full-span">
        <p class="kpi-label">Engagement Breakdown</p>

        <p class="engagement-section-title">Average per arrived participant</p>

        <div class="engagement-item">
          <div class="engagement-head">
            <span>Saved</span>
            <strong>{{ analytics.averages.savedPerParticipant }}</strong>
          </div>
          <div class="rate-bar">
            <div
              class="rate-fill saved"
              :style="{ width: `${Math.min(analytics.averages.savedPerParticipant * 20, 100)}%` }"
            ></div>
          </div>
        </div>

        <div class="engagement-item">
          <div class="engagement-head">
            <span>Met</span>
            <strong>{{ analytics.averages.metPerParticipant }}</strong>
          </div>
          <div class="rate-bar">
            <div
              class="rate-fill met"
              :style="{ width: `${Math.min(analytics.averages.metPerParticipant * 20, 100)}%` }"
            ></div>
          </div>
        </div>

        <div class="engagement-item">
          <div class="engagement-head">
            <span>Skipped</span>
            <strong>{{ analytics.averages.skippedPerParticipant }}</strong>
          </div>
          <div class="rate-bar">
            <div
              class="rate-fill skipped"
              :style="{ width: `${Math.min(analytics.averages.skippedPerParticipant * 20, 100)}%` }"
            ></div>
          </div>
        </div>

        <div class="engagement-item">
          <div class="engagement-head">
            <span>Total Interactions</span>
            <strong>{{ analytics.averages.totalInteractionsPerParticipant }}</strong>
          </div>
          <div class="rate-bar">
            <div
              class="rate-fill online"
              :style="{ width: `${Math.min(analytics.averages.totalInteractionsPerParticipant * 20, 100)}%` }"
            ></div>
          </div>
        </div>

        <div class="engagement-divider"></div>

        <p class="engagement-section-title">Total interactions</p>

        <div class="engagement-totals">
          <span class="engagement-total-pill saved-pill">
            Saved {{ analytics.totals.saved }}
          </span>
          <span class="engagement-total-pill met-pill">
            Met {{ analytics.totals.met }}
          </span>
          <span class="engagement-total-pill skipped-pill">
            Skipped {{ analytics.totals.skipped }}
          </span>
          <span class="engagement-total-pill neutral-pill">
            Total {{ analytics.totals.totalInteractions }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.analytics-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.analytics-header h3 {
  margin: 0;
  color: #234532;
}

.analytics-header p {
  margin: 0.35rem 0 0;
  color: #5f6f66;
}

.event-status-pill {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
}

.event-status-pill.draft {
  background: #fff4cc;
  color: #b38f00;
}

.event-status-pill.published {
  background: #d9f7e6;
  color: #1f7a4d;
}

.event-status-pill.archived {
  background: #eef1ef;
  color: #6b7a71;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 18px;
}

.kpi-card {
  background: white;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
}

.full-span {
  grid-column: 1 / -1;
}

.kpi-label {
  margin: 0 0 10px;
  color: #6b7a71;
  font-size: 14px;
  font-weight: 600;
}

.kpi-value {
  margin: 0;
  color: #173524;
  font-size: 32px;
  font-weight: 700;
}

.kpi-sub {
  margin-top: 12px;
  color: #7a8c81;
  font-size: 13px;
}

.rate-bar {
  margin-top: 16px;
  width: 100%;
  height: 10px;
  background: #eef2ef;
  border-radius: 999px;
  overflow: hidden;
}

.rate-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.rate-fill.online {
  background: linear-gradient(90deg, #8fd3a8, #2f8f5b);
}

.rate-fill.saved {
  background: linear-gradient(90deg, #c8e6ff, #4d9de0);
}

.rate-fill.met {
  background: linear-gradient(90deg, #cfeccf, #3aa76d);
}

.rate-fill.skipped {
  background: linear-gradient(90deg, #ffd4d4, #d96b6b);
}

.circle-kpi-card {
  display: flex;
  flex-direction: column;
}

.progress-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
  align-self: center;
}

.progress-circle-inner {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: #173524;
}

.engagement-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.engagement-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.engagement-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  color: #173524;
}

.engagement-head strong {
  font-size: 22px;
  font-weight: 700;
}

.engagement-section-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #6b7a71;
}

.engagement-divider {
  height: 1px;
  background: #e7ece8;
  margin: 4px 0 2px;
}

.engagement-totals {
  margin-top: 8px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.engagement-total-pill {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.saved-pill {
  background: #e8f3ff;
  color: #4d9de0;
}

.met-pill {
  background: #e3f5e8;
  color: #3aa76d;
}

.skipped-pill {
  background: #fde8e8;
  color: #d96b6b;
}

.neutral-pill {
  background: #eef1ef;
  color: #516057;
}

@media (max-width: 900px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .full-span {
    grid-column: auto;
  }
}

.analytics-loading,
.analytics-empty {
  padding: 40px;
  text-align: center;
  color: #6b7a71;
  font-weight: 600;
}
</style>