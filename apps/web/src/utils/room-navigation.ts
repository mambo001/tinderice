const LAST_VISITED_ROOM_ID_KEY = "last_visited_room_id";

export function getLastVisitedRoomId() {
  return localStorage.getItem(LAST_VISITED_ROOM_ID_KEY);
}

export function setLastVisitedRoomId(roomId: string) {
  localStorage.setItem(LAST_VISITED_ROOM_ID_KEY, roomId);
}

export function clearLastVisitedRoomId() {
  localStorage.removeItem(LAST_VISITED_ROOM_ID_KEY);
}
