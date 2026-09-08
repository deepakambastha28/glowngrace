import Link from "next/link";
import type { EventItem } from "@/lib/data";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      data-testid="event-tile"
      className="event-card"
    >
      <div
        className="event-photo"
        style={{ background: event.gradient }}
      >
        <span className="event-emoji">{event.emoji}</span>
        <span className="event-cat">{event.category}</span>
        <span className="event-price">{event.price}</span>
      </div>
      <div className="event-body">
        <div
          className="event-date"
          data-testid="event-date"
        >
          🗓️ {formatDate(event.date)}
        </div>
        <h3 className="event-title">{event.title}</h3>
        <div
          className="event-meta"
          data-testid="event-loc"
        >
          📍 {event.loc} · {event.time}
        </div>
        <div className="event-spots">
          {event.spotsLeft > 0 ? (
            <>
              <span className="bullet" /> {event.spotsLeft} seats left
            </>
          ) : (
            <>
              <span className="sold" /> Sold out
            </>
          )}
        </div>
        <span className="event-arrow">View details →</span>
      </div>
    </Link>
  );
}