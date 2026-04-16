import { getAdminAccessToken } from "@/utils/getAdminAccessToken";
const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/admin/events`;

async function authHeaders(isJson = false) {
  const token = await getAdminAccessToken();

  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
}

export async function getEventById(eventId) {
  const res = await fetch(`${API_BASE}/${eventId}`, {
    headers: await authHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to load event");
  }

  return data;
}

export async function updateEvent(eventId, body) {
  const res = await fetch(`${API_BASE}/${eventId}`, {
    method: "PUT",
    headers: await authHeaders(true),
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Update failed");
  }

  return data;
}

export async function deleteEventById(eventId) {
  const res = await fetch(`${API_BASE}/${eventId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Delete failed");
  }
}

export async function uploadParticipantsFile(eventId, file) {
  const token = await getAdminAccessToken();

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/${eventId}/participants-file`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Upload failed");
  }

  return data;
}

export async function processParticipantsFile(eventId) {
  const res = await fetch(`${API_BASE}/${eventId}/process-participants`, {
    method: "POST",
    headers: await authHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Process failed");
  }

  return data;
}

export async function deleteParticipantsFile(eventId) {
  const res = await fetch(`${API_BASE}/${eventId}/participants-file`, {
    method: "DELETE",
    headers: await authHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Delete failed");
  }

  return data;
}

export async function getParticipants(eventId) {
  const res = await fetch(`${API_BASE}/${eventId}/participants`, {
    headers: await authHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load participants");
  }

  return data;
}

export async function createParticipant(eventId, body) {
  const res = await fetch(`${API_BASE}/${eventId}/participants`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Create failed");
  }

  return data;
}

export async function updateParticipant(eventId, participantId, body) {
  const res = await fetch(
    `${API_BASE}/${eventId}/participants/${participantId}`,
    {
      method: "PUT",
      headers: await authHeaders(true),
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Update failed");
  }

  return data;
}

export async function deleteParticipant(eventId, participantId) {
  const res = await fetch(
    `${API_BASE}/${eventId}/participants/${participantId}`,
    {
      method: "DELETE",
      headers: await authHeaders(),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Delete failed");
  }

  return data;
}

export async function calculateMatchesForEvent(eventId) {
  const token = await getAdminAccessToken();

  const res = await fetch(
`${import.meta.env.VITE_API_BASE_URL}/api/match/admin/rebuild-all/${eventId}`
    , {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "Failed to calculate matches");
  }

  return data;
}
export async function recalculateAddedParticipantMatches(eventId, participantId) {
  const token = await getAdminAccessToken();

  const res = await fetch(
`${import.meta.env.VITE_API_BASE_URL}/api/match/admin/add/${eventId}/${participantId}`
    , {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || data.message || "Failed to recalculate matches for added participant"
    );
  }

  return data;
}

export async function recalculateUpdatedParticipantMatches(eventId, participantId) {
  const token = await getAdminAccessToken();

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/match/admin/update/${eventId}/${participantId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || data.message || "Failed to recalculate matches for updated participant"
    );
  }

  return data;
}
export async function downloadParticipantsOriginalFile(eventId, originalFileName = "participants-file") {
  const token = await getAdminAccessToken();

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${eventId}/participants-file/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to download original file");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = originalFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  window.URL.revokeObjectURL(url);
}
export async function getEventAnalytics(eventId) {
  const token = await getAdminAccessToken();

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${eventId}/analytics`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load event analytics");
  }

  return data;
}
