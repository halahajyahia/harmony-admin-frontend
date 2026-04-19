<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from "vue";
import AdminLayout from "@/components/admin/AdminLayout.vue";
import { getAdminAccessToken } from "@/utils/getAdminAccessToken";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import EventAnalyticsSection from "@/components/admin/EventAnalyticsSection.vue";
import { getEventAnalytics as getEventAnalyticsApi } from "@/services/adminEventsService";

const events = ref([]);
const selectedEventId = ref("all");
const selectedEventAnalytics = ref(null);
const selectedEventAnalyticsLoading = ref(true);
const totalEvents = computed(() => events.value.length);
const exportSection = ref(null);
const publishedEvents = computed(
  () => events.value.filter((event) => event.status === "published").length
);

const archivedEvents = computed(
  () => events.value.filter((event) => event.status === "archived").length
);

const draftEvents = computed(
  () => events.value.filter((event) => event.status === "draft").length
);
const participantCountsByEvent = ref({});
const allParticipantsByEvent = ref({});


const selectedEvent = computed(() => {
  return events.value.find(
    (event) => event.id === selectedEventId.value
  );
});

async function loadEvents() {
  try {
    const token = await getAdminAccessToken();

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/admin/events`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    console.log("dashboard events status:", res.status);
    console.log("dashboard events data:", data);

    events.value = data;
    await loadParticipantCounts();
  } catch (error) {
    console.error("Load dashboard events failed:", error);
  }
}

async function loadParticipantCounts() {
  try {
    const token = await getAdminAccessToken();

    const counts = {};
    const participantsMap = {};

    console.log("events before participant count load:", events.value);
    console.log("first event item:", events.value[0]);
    console.log("event keys:", Object.keys(events.value[0] || {}));

   for (const event of events.value || []) {
  if (!event) {
    console.warn("Invalid event:", event);
    continue;
  }

  const eventId = event.id;

  if (!eventId) {
    console.warn("Missing eventId:", event);
    continue;
  }

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${eventId}/participants`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  counts[eventId] =
    typeof data.count === "number"
      ? data.count
      : Array.isArray(data.participants)
      ? data.participants.length
      : 0;

  participantsMap[eventId] = data.participants || [];
}

    participantCountsByEvent.value = counts;
    allParticipantsByEvent.value = participantsMap;
  } catch (error) {
    console.error("Load participant counts failed:", error);
  }
}

async function exportDashboardToPDF() {
  try {
    await nextTick();

    if (!exportSection.value) return;

    const canvas = await html2canvas(exportSection.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f6f8f7",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let y = 10;

    if (imgHeight <= pageHeight - 20) {
      pdf.addImage(imgData, "PNG", 10, y, imgWidth, imgHeight);
    } else {
      let remainingHeight = imgHeight;
      let position = 0;

      while (remainingHeight > 0) {
        pdf.addImage(imgData, "PNG", 10, y - position, imgWidth, imgHeight);
        remainingHeight -= pageHeight - 20;
        position += pageHeight - 20;

        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    }

    const fileName =
      selectedEventId.value === "all"
        ? "all-events-dashboard.pdf"
        : `event-dashboard-${selectedEventId.value}.pdf`;

    pdf.save(fileName);
  } catch (error) {
    console.error("Export PDF failed:", error);
  }
}

function getSelectedEventName() {
  if (selectedEventId.value === "all") return "All Events";

  const selectedEvent = events.value.find(
    (event) => event.id === selectedEventId.value
  );

  return selectedEvent?.name || selectedEventId.value;
}

function addSectionTitle(pdf, title, y) {
  pdf.setFillColor(35, 69, 50);
  pdf.roundedRect(20, y - 6, 170, 10, 2, 2, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text(title, 24, y);
}

function addMetricLine(pdf, label, value, y) {
  pdf.setTextColor(40, 40, 40);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text(`${label}: ${value}`, 25, y);
}

function addSummaryBox(pdf, x, y, w, h, title, value) {
  pdf.setFillColor(248, 249, 247);
  pdf.setDrawColor(225, 230, 226);
  pdf.roundedRect(x, y, w, h, 3, 3, "FD");

  pdf.setTextColor(95, 111, 101);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(title, x + 4, y + 8);

  pdf.setTextColor(23, 53, 36);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(String(value), x + 4, y + 18);
}

function exportDashboardReport() {
 const pdf = new jsPDF("p", "mm", "a4");
let y = 20;

const reportTitle = "Harmony Dashboard Report";
const reportScope = getSelectedEventName();
const generatedAt = new Date().toLocaleString();

pdf.setFillColor(35, 69, 50);
pdf.rect(0, 0, 210, 28, "F");

pdf.setTextColor(255, 255, 255);
pdf.setFont("helvetica", "bold");
pdf.setFontSize(20);
pdf.text(reportTitle, 20, 16);

pdf.setFont("helvetica", "normal");
pdf.setFontSize(10);
pdf.text(`Generated: ${generatedAt}`, 20, 23);
pdf.text(`Scope: ${reportScope}`, 120, 23);

y = 40;

  if (selectedEventId.value === "all") {
       pdf.setDrawColor(225, 230, 226);
    pdf.line(20, y + 4, 190, y + 4);
    y += 10;
    addSectionTitle(pdf, "Participants Overview", y);

    y += 10;
    addMetricLine(pdf, "Total Participants", totalParticipants.value, y);

    y += 8;
    addMetricLine(pdf, "Unique Participants", uniqueParticipantsCount.value, y);

    y += 8;
    addMetricLine(
      pdf,
      "Average Per Active Event",
      averageParticipantsPerActiveEvent.value,
      y
    );

    y += 8;
    addMetricLine(pdf, "Events With Participants", eventsWithParticipants.value, y);

    y += 15;
    addSectionTitle(pdf, "Event Status", y);

    y += 10;
    addMetricLine(pdf, "Total Events", totalEvents.value, y);

    y += 8;
    addMetricLine(pdf, "Draft Events", draftEvents.value, y);

    y += 8;
    addMetricLine(pdf, "Published Events", publishedEvents.value, y);

    y += 8;
    addMetricLine(pdf, "Archived Events", archivedEvents.value, y);

    y += 15;
       pdf.setDrawColor(225, 230, 226);
    pdf.line(20, y + 4, 190, y + 4);
    y += 10;
    addSectionTitle(pdf, "Engagement Analytics", y);

    y += 10;
    addMetricLine(pdf, "Arrival Rate", `${averageOnlineRate.value}%`, y);

y += 8;
addMetricLine(pdf, "Active Users", `${activeUsersRate.value}%`, y);

y += 8;
addMetricLine(
  pdf,
  "Avg Saved per Active Online User",
  averageSavedPerActiveOnlineUser.value,
  y
);

y += 8;
addMetricLine(
  pdf,
  "Avg Met per Active Online User",
  averageMetPerActiveOnlineUser.value,
  y
);

y += 8;
addMetricLine(
  pdf,
  "Avg Skipped per Active Online User",
  averageSkippedPerActiveOnlineUser.value,
  y
);
       pdf.setDrawColor(225, 230, 226);
    pdf.line(20, y + 4, 190, y + 4);
    y += 10;
    addSummaryBox(pdf, 20, y, 40, 24, "Participants", totalParticipants.value);
    addSummaryBox(pdf, 65, y, 40, 24, "Unique", uniqueParticipantsCount.value);
    addSummaryBox(pdf, 110, y, 40, 24, "Active Avg", averageParticipantsPerActiveEvent.value);
    addSummaryBox(pdf, 155, y, 35, 24, "Events", totalEvents.value);

    y += 34;
  } else {
  const eventId = selectedEventId.value;
  const selectedEvent = events.value.find((event) => event.id === eventId);
  const analytics = selectedEventAnalytics.value;

  if (!analytics) {
    addSectionTitle(pdf, "Event Information", y);

    y += 10;
    addMetricLine(pdf, "Event Name", selectedEvent?.name || "N/A", y);

    y += 8;
    addMetricLine(pdf, "Event Date", selectedEvent?.date || "N/A", y);

    y += 8;
    addMetricLine(pdf, "Event Status", selectedEvent?.status || "N/A", y);

    y += 15;
    addMetricLine(pdf, "Analytics", "No analytics available", y);
  } else {
    addSectionTitle(pdf, "Event Information", y);

    y += 10;
    addMetricLine(pdf, "Event Name", selectedEvent?.name || "N/A", y);

    y += 8;
    addMetricLine(pdf, "Event Date", selectedEvent?.date || "N/A", y);

    y += 8;
    addMetricLine(pdf, "Event Status", selectedEvent?.status || "N/A", y);

    y += 15;
    pdf.setDrawColor(225, 230, 226);
    pdf.line(20, y + 4, 190, y + 4);
    y += 10;
    addSectionTitle(pdf, "Participants Overview", y);

    y += 10;
    addMetricLine(pdf, "Total Participants", analytics.totalParticipants, y);

    y += 8;
    addMetricLine(pdf, "Arrived Participants", analytics.arrivedParticipants, y);

    y += 8;
    addMetricLine(pdf, "Arrival Rate", `${analytics.arrivalRate}%`, y);

    y += 15;
    pdf.setDrawColor(225, 230, 226);
    pdf.line(20, y + 4, 190, y + 4);
    y += 10;
    addSectionTitle(pdf, "Engagement Analytics", y);

    y += 10;
    addMetricLine(pdf, "Active Users", analytics.activeUsersCount, y);

    y += 8;
    addMetricLine(
      pdf,
      "Active Users Rate",
      `${analytics.activeUsersRate}%`,
      y
    );

    y += 8;
    addMetricLine(
      pdf,
      "Avg Saved per Participant",
      analytics.averages.savedPerParticipant,
      y
    );

    y += 8;
    addMetricLine(
      pdf,
      "Avg Met per Participant",
      analytics.averages.metPerParticipant,
      y
    );

    y += 8;
    addMetricLine(
      pdf,
      "Avg Skipped per Participant",
      analytics.averages.skippedPerParticipant,
      y
    );

    y += 15;
    pdf.setDrawColor(225, 230, 226);
    pdf.line(20, y + 4, 190, y + 4);
    y += 10;
    addSectionTitle(pdf, "Interaction Totals", y);

    y += 10;
    addMetricLine(
      pdf,
      "Total Saved Interactions",
      analytics.totals.saved,
      y
    );

    y += 8;
    addMetricLine(
      pdf,
      "Total Met Interactions",
      analytics.totals.met,
      y
    );

    y += 8;
    addMetricLine(
      pdf,
      "Total Skipped Interactions",
      analytics.totals.skipped,
      y
    );

    y += 8;
    addMetricLine(
      pdf,
      "Total Interactions",
      analytics.totals.totalInteractions,
      y
    );

    y += 8;
    addMetricLine(
      pdf,
      "Avg Interactions per Participant",
      analytics.averages.totalInteractionsPerParticipant,
      y
    );

    y += 15;
    pdf.setDrawColor(225, 230, 226);
    pdf.line(20, y + 4, 190, y + 4);
    y += 10;

    addSummaryBox(pdf, 20, y, 40, 24, "Participants", analytics.totalParticipants);
    addSummaryBox(pdf, 65, y, 40, 24, "Arrived", analytics.arrivedParticipants);
    addSummaryBox(pdf, 110, y, 40, 24, "Active", analytics.activeUsersCount);
    addSummaryBox(pdf, 155, y, 35, 24, "Arrival", `${analytics.arrivalRate}%`);

    y += 34;
  }
}

  const fileName =
    selectedEventId.value === "all"
      ? "dashboard-report-all-events.pdf"
      : `dashboard-report-${selectedEventId.value}.pdf`;

  pdf.save(fileName);
}

const totalParticipants = computed(() => {
  return Object.values(participantCountsByEvent.value).reduce(
    (sum, count) => sum + count,
    0
  );
});

const uniqueParticipantsCount = computed(() => {
  const phoneSet = new Set();

  for (const eventId in allParticipantsByEvent.value) {
    const participants = allParticipantsByEvent.value[eventId] || [];

    participants.forEach((participant) => {
      const phone = participant.phoneNumber?.trim?.();
      if (phone) {
        phoneSet.add(phone);
      }
    });
  }

  return phoneSet.size;
});

const eventsWithParticipants = computed(() => {
  return Object.values(participantCountsByEvent.value).filter(
    (count) => count > 0
  ).length;
});

const averageParticipantsPerActiveEvent = computed(() => {
  const activeCounts = Object.values(participantCountsByEvent.value).filter(
    (count) => count > 0
  );

  if (!activeCounts.length) return 0;

  const total = activeCounts.reduce((sum, count) => sum + count, 0);
  return Math.round(total / activeCounts.length);
});

const averageOnlineRate = computed(() => {
  let totalRate = 0;
  let countedEvents = 0;

  for (const eventId in allParticipantsByEvent.value) {
    const participants = allParticipantsByEvent.value[eventId] || [];

    if (participants.length === 0) continue; // ❗ מדלגים על ריקים

    const onlineCount = participants.filter((p) => p.isOnline).length;

    const rate = onlineCount / participants.length;

    totalRate += rate;
    countedEvents++;
  }

  if (countedEvents === 0) return 0;

  return Math.round((totalRate / countedEvents) * 100);
});

const averageSavedPerActiveOnlineUser = computed(() => {
  let totalEventAverages = 0;
  let countedEvents = 0;

  for (const eventId in allParticipantsByEvent.value) {
    const participants = allParticipantsByEvent.value[eventId] || [];

    const onlineParticipants = participants.filter((p) => p.isOnline === true);

    const activeOnlineSavedUsers = onlineParticipants.filter(
      (p) => (p.interactions?.saved?.length || 0) > 0
    );

    if (activeOnlineSavedUsers.length === 0) continue;

    const totalSaved = activeOnlineSavedUsers.reduce(
      (sum, participant) => sum + (participant.interactions?.saved?.length || 0),
      0
    );

    const eventAverage = totalSaved / activeOnlineSavedUsers.length;

    totalEventAverages += eventAverage;
    countedEvents++;
  }

  if (countedEvents === 0) return 0;

  return Math.ceil(totalEventAverages / countedEvents);
});

const averageMetPerActiveOnlineUser = computed(() => {
  let totalEventAverages = 0;
  let countedEvents = 0;

  for (const eventId in allParticipantsByEvent.value) {
    const participants = allParticipantsByEvent.value[eventId] || [];

    const onlineParticipants = participants.filter((p) => p.isOnline === true);

    const activeOnlineMetUsers = onlineParticipants.filter(
      (p) => (p.interactions?.met?.length || 0) > 0
    );

    if (activeOnlineMetUsers.length === 0) continue;

    const totalMet = activeOnlineMetUsers.reduce(
      (sum, participant) => sum + (participant.interactions?.met?.length || 0),
      0
    );

    const eventAverage = totalMet / activeOnlineMetUsers.length;

    totalEventAverages += eventAverage;
    countedEvents++;
  }

  if (countedEvents === 0) return 0;

  return Math.ceil(totalEventAverages / countedEvents);
});

const averageSkippedPerActiveOnlineUser = computed(() => {
  let totalEventAverages = 0;
  let countedEvents = 0;

  for (const eventId in allParticipantsByEvent.value) {
    const participants = allParticipantsByEvent.value[eventId] || [];

    const onlineParticipants = participants.filter((p) => p.isOnline === true);

    const activeOnlineSkippedUsers = onlineParticipants.filter(
      (p) => (p.interactions?.skipped?.length || 0) > 0
    );

    if (activeOnlineSkippedUsers.length === 0) continue;

    const totalSkipped = activeOnlineSkippedUsers.reduce(
      (sum, participant) =>
        sum + (participant.interactions?.skipped?.length || 0),
      0
    );

    const eventAverage = totalSkipped / activeOnlineSkippedUsers.length;

    totalEventAverages += eventAverage;
    countedEvents++;
  }

  if (countedEvents === 0) return 0;

  return Math.ceil(totalEventAverages / countedEvents);
});

const activeUsersRate = computed(() => {
  let totalRate = 0;
  let countedEvents = 0;

  for (const eventId in allParticipantsByEvent.value) {
    const participants = allParticipantsByEvent.value[eventId] || [];

    const onlineParticipants = participants.filter(p => p.isOnline === true);

    if (onlineParticipants.length === 0) continue;

    const activeUsers = onlineParticipants.filter(p => {
      const interactions = p.interactions || {};
      return (
        (interactions.saved?.length || 0) > 0 ||
        (interactions.met?.length || 0) > 0 ||
        (interactions.skipped?.length || 0) > 0
      );
    });

    const rate = activeUsers.length / onlineParticipants.length;

    totalRate += rate;
    countedEvents++;
  }

  if (countedEvents === 0) return 0;

  return Math.round((totalRate / countedEvents) * 100);
});

const eventArrivedParticipants = computed(() => {
  return selectedEventParticipants.value.filter((p) => p.isOnline).length;
});

const eventTotalInteractions = computed(() => {
  return (
    eventTotalSaved.value +
    eventTotalMet.value +
    eventTotalSkipped.value
  );
});

const eventAvgSavedPerParticipant = computed(() => {
  if (eventArrivedParticipants.value === 0) return 0;
  return Math.ceil(eventTotalSaved.value / eventArrivedParticipants.value);
});

const eventAvgMetPerParticipant = computed(() => {
  if (eventArrivedParticipants.value === 0) return 0;
  return Math.ceil(eventTotalMet.value / eventArrivedParticipants.value);
});

const eventAvgSkippedPerParticipant = computed(() => {
  if (eventArrivedParticipants.value === 0) return 0;
  return Math.ceil(eventTotalSkipped.value / eventArrivedParticipants.value);
});

const eventAvgTotalInteractionsPerParticipant = computed(() => {
  if (eventArrivedParticipants.value === 0) return 0;
  return Math.ceil(
    eventTotalInteractions.value / eventArrivedParticipants.value
  );
});
const isLive = ref(true);
const lastUpdatedAt = ref(null);
const livePulse = ref(false);
let dashboardInterval = null;
async function refreshDashboardData() {
  await loadEvents();
  await loadSelectedEventAnalytics();
  lastUpdatedAt.value = new Date();

  livePulse.value = true;
  setTimeout(() => {
    livePulse.value = false;
  }, 700);
}
const formattedLastUpdated = computed(() => {
  if (!lastUpdatedAt.value) return "Not updated yet";

  return lastUpdatedAt.value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
});
async function loadSelectedEventAnalytics() {
  if (selectedEventId.value === "all") {
    selectedEventAnalytics.value = null;
    selectedEventAnalyticsLoading.value = false;
    return;
  }

  try {
    // loading מלא רק אם עדיין אין נתונים
    if (!selectedEventAnalytics.value) {
      selectedEventAnalyticsLoading.value = true;
    }

    const data = await getEventAnalyticsApi(selectedEventId.value);
    selectedEventAnalytics.value = data.analytics || null;
  } catch (error) {
    console.error("Load selected event analytics failed:", error);

    // רק אם אין בכלל נתונים, נאפס
    if (!selectedEventAnalytics.value) {
      selectedEventAnalytics.value = null;
    }
  } finally {
    selectedEventAnalyticsLoading.value = false;
  }
}
onMounted(async () => {
  await refreshDashboardData();

  dashboardInterval = setInterval(async () => {
    if (document.visibilityState === "visible") {
      await refreshDashboardData();
    }
  }, 5000);
});

onUnmounted(() => {
  if (dashboardInterval) {
    clearInterval(dashboardInterval);
  }
});

watch(selectedEventId, async () => {
  await loadSelectedEventAnalytics();
});

</script>



<template>
  <AdminLayout>
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      <p class="dashboard-subtitle">
        View overall admin statistics or inspect a specific event.
      </p>

      <div class="top-bar">
        <select v-model="selectedEventId" class="event-select">
          <option value="all">All Events</option>

          <option
            v-for="event in events"
            :key="event.id"
            :value="event.id"
          >
            {{ event.name }}
          </option>
        </select>
        <button class="export-btn" @click="exportDashboardReport">
    Export PDF
  </button>
  <div class="dashboard-live-row">
<span class="live-badge" :class="{ offline: !isLive, pulse: livePulse }">
  {{ isLive ? "● Live updates" : "● Paused" }}
  </span>

  <span class="last-updated">
    Last updated: {{ formattedLastUpdated }}
  </span>
</div>
      </div>

<div class="dashboard-content" ref="exportSection">
    <div v-if="selectedEventId === 'all'" class="dashboard-section">
      <div class="kpi-grid">
        <div class="kpi-card">
          <p class="kpi-label">Total Participants</p>
          <h2 class="kpi-value">{{ totalParticipants }}</h2>
        </div>

        <div class="kpi-card">
          <p class="kpi-label">Unique Participants</p>
          <h2 class="kpi-value">{{ uniqueParticipantsCount }}</h2>
        </div>

        <div class="kpi-card">
          <p class="kpi-label">Average Per Active Event</p>
          <h2 class="kpi-value">{{ averageParticipantsPerActiveEvent }}</h2>
        </div>

        <div class="kpi-card">
          <p class="kpi-label">Events With Participants</p>
          <h2 class="kpi-value">{{ eventsWithParticipants }}</h2>
        </div>
    <div class="kpi-card">
      <p class="kpi-sub">Total Events</p>

      <h2 class="kpi-value">{{ totalEvents }}</h2>

      <div class="status-row">
        <span class="status draft">Draft {{ draftEvents }}</span>
        <span class="status published">Published {{ publishedEvents }}</span>
        <span class="status archived">Archived {{ archivedEvents }}</span>
      </div>
    </div>
        <div class="kpi-card circle-kpi-card">
          <p class="kpi-label">Arrival Rate</p>

          <div
            class="progress-circle"
            :style="{
              background: `conic-gradient(#2f8f5b ${averageOnlineRate}%, #eef2ef 0%)`
            }"
          >
            <div class="progress-circle-inner">
              {{ averageOnlineRate }}%
            </div>
          </div>
        </div>
    <div class="kpi-card engagement-card">
      <p class="kpi-label">Engagement Breakdown</p>

    <div class="engagement-item">
      <div class="engagement-head">
        <span>Saved</span>
        <strong>{{ averageSavedPerActiveOnlineUser }}</strong>
      </div>
      <div class="rate-bar">
        <div
          class="rate-fill saved"
          :style="{ width: `${Math.min(averageSavedPerActiveOnlineUser * 20, 100)}%` }"
        ></div>
      </div>
    </div>

    <div class="engagement-item">
      <div class="engagement-head">
        <span>Met</span>
        <strong>{{ averageMetPerActiveOnlineUser }}</strong>
      </div>
      <div class="rate-bar">
        <div
          class="rate-fill met"
          :style="{ width: `${Math.min(averageMetPerActiveOnlineUser * 20, 100)}%` }"
        ></div>
      </div>
    </div>

    <div class="engagement-item">
      <div class="engagement-head">
        <span>Skipped</span>
        <strong>{{ averageSkippedPerActiveOnlineUser }}</strong>
      </div>
      <div class="rate-bar">
        <div
          class="rate-fill skipped"
          :style="{ width: `${Math.min(averageSkippedPerActiveOnlineUser * 20, 100)}%` }"
        ></div>
      </div>
    </div>
    </div>
    <div class="kpi-card">
      <p class="kpi-label">Active Users</p>
      <h2 class="kpi-value">{{ activeUsersRate }}%</h2>

      <div class="rate-bar">
        <div
          class="rate-fill online"
          :style="{ width: `${activeUsersRate}%` }"
        ></div>
      </div>
    </div>
      </div>
    </div>       
    <div v-if="selectedEventId !== 'all'" class="dashboard-section">
  <div class="event-hero-card">
    <div class="event-hero-text">
      <p class="event-hero-eyebrow">Event Dashboard</p>
      <h2 class="event-hero-title">{{ selectedEvent?.name }}</h2>
      <p class="event-hero-subtitle">Event Analytics Overview</p>
    </div>

    <span
      class="event-status-pill"
      :class="selectedEvent?.status"
    >
      {{ selectedEvent?.status }}
    </span>
  </div>

  <EventAnalyticsSection
  :event="selectedEvent"
  :analytics="selectedEventAnalytics"
  :loading="selectedEventAnalyticsLoading"  
  :showHeader="false"
    />
</div>
      </div>
    </div>
  </AdminLayout>
</template>


<style scoped>
.dashboard-container {
  padding: 24px;
}

.dashboard-subtitle {
  margin-top: 8px;
  color: #5f6f65;
}

.top-bar {
  margin: 24px 0;
}

.event-select {
  min-width: 220px;
  padding: 10px 14px;
  border: 1px solid #d8e1db;
  border-radius: 10px;
  background: white;
  font-size: 15px;
}

.dashboard-content {
  margin-top: 24px;
}

.dashboard-placeholder {
  background: white;
  border-radius: 18px;
  padding: 32px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  margin-top: -6px;
  color: #7a8c81;
  font-size: 13px;
}

.status-row {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.status {
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.status.draft {
  background: #fff4cc;
  color: #b38f00;
}

.status.published {
  background: #d9f7e6;
  color: #1f7a4d;
}

.status.archived {
  background: #eef1ef;
  color: #6b7a71;
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

  /* 👇 זה החשוב */
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

.export-btn {
  margin-left: 12px;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: #234532;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.export-btn:hover {
  opacity: 0.92;
}

.event-hero-card {
  background: white;
  border-radius: 24px;
  padding: 28px 32px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
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
.event-hero-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-hero-eyebrow {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7a71;
}

.event-hero-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #173524;
  line-height: 1.15;
}

.event-hero-subtitle {
  margin: 0;
  font-size: 16px;
  color: #5f6f65;
}

.event-hero-card {
  background: white;
  border-radius: 24px;
  padding: 28px 32px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.event-hero-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-hero-eyebrow {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7a71;
}

.event-hero-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #173524;
  line-height: 1.15;
}

.event-hero-subtitle {
  margin: 0;
  font-size: 16px;
  color: #5f6f65;
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

.dashboard-live-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 10px 0 18px;
  flex-wrap: wrap;
}

.live-badge {
  font-size: 13px;
  font-weight: 700;
  color: #2f8f5b;
}

.live-badge.offline {
  color: #b38f00;
}

.last-updated {
  font-size: 13px;
  color: #6b7a71;
}

.live-badge.pulse {
  animation: livePulseAnim 0.7s ease;
}

@keyframes livePulseAnim {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.06);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>