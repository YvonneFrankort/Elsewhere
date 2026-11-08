
import type { Feature } from "geojson";

interface PlaceDetailsPopupProps {
  selectedPlace: Feature | null;
  popupPos: { x: number; y: number };
  onClose: () => void;
}

export default function PlaceDetailsPopup({
  selectedPlace,
  popupPos,
  onClose
}: PlaceDetailsPopupProps) {
  if (!selectedPlace) return null;

  const props = selectedPlace.properties || {};

  const getImageUrl = (url: string) => {
    if (url.includes("commons.wikimedia.org/wiki/File:")) {
      const filename = url.split("File:").pop();
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename ?? "")}`;
    }
    return url;
  };

  const isNPS = props.source === "nps";

  const npsImages = Array.isArray(props.images)
    ? props.images
    : [];

  const mainImage =
    props.image?.url ||
    props.imageUrl ||
    npsImages[0]?.url;

  const contacts = props.contacts?.[0];

  const address = props.addresses?.find(
    (item: any) => item.type === "Physical"
  ) || props.addresses?.[0];

  const addressLines = address
    ? [
      address.line1,
      address.line2,
      address.line3,
      [address.city, address.stateCode, address.postalCode]
        .filter(Boolean)
        .join(", ")
    ].filter(Boolean)
    : [];

  return (
    <div
      className="info-popup"
      style={{ left: popupPos.x, top: popupPos.y }}
    >
      <button className="menu-close" onClick={onClose}>
        ✕
      </button>

      <h3>{props.name}</h3>

      {/* Main image */}
      {mainImage && (
        <div className="popup-image-container">
          <img
            src={getImageUrl(mainImage)}
            alt={npsImages[0]?.altText || props.name || "Place image"}
            className="popup-image"
          />

          {(npsImages[0]?.caption || props.image?.name) && (
            <p className="popup-image-caption">
              {npsImages[0]?.caption || props.image?.name}
            </p>
          )}

          {npsImages[0]?.credit && (
            <p className="popup-image-credit">
              Photo: {npsImages[0].credit}
            </p>
          )}
        </div>
      )}

      {props.subcategory && (
        <p>Category: {props.subcategory}</p>
      )}

      {props.designation && (
        <p>Designation: {props.designation}</p>
      )}

      {props.description && (
        <p>{props.description}</p>
      )}

      {/* NPS information */}
      {isNPS && (
        <>
          {/* Park Alerts */}
          {props.alerts?.length > 0 && (
            <section className="popup-alerts">
              <h4>⚠️ Park Alerts</h4>

              {props.alerts.map((alert: any) => (
                <div key={alert.id} className="popup-alert">
                  <strong>{alert.title}</strong>

                  {alert.type && <p>Type: {alert.type}</p>}

                  {alert.description && (
                    <p>{alert.description}</p>
                  )}

                  {alert.url && (
                    <a
                      href={alert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      More information ↗
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Upcoming Events */}
          {props.events?.length > 0 && (
            <section className="popup-events">
              <h4>📅 Upcoming Events</h4>

              {props.events.map((event: any) => (
                <div key={event.id} className="popup-event">
                  <strong>{event.title}</strong>

                  {event.dateStart && (
                    <p>
                      Start: {event.dateStart}
                    </p>
                  )}

                  {event.dateEnd && (
                    <p>
                      End: {event.dateEnd}
                    </p>
                  )}

                  {event.location && (
                    <p>Location: {event.location}</p>
                  )}

                  {event.description && (
                    <p>{event.description}</p>
                  )}

                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Event details ↗
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}


          {/* Park Tours */}
          {props.tours?.length > 0 && (
            <section className="popup-tours">
              <h4>🧭 Park Tours</h4>

              {props.tours.map((tour: any) => (
                <div key={tour.id} className="popup-tour">
                  <strong>{tour.name || tour.title}</strong>

                  {tour.description && (
                    <p>{tour.description}</p>
                  )}

                  {tour.duration && (
                    <p>Duration: {tour.duration}</p>
                  )}

                  {tour.url && (
                    <a
                      href={tour.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tour details ↗
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Visitor Center Address */}
          {addressLines.length > 0 && (
            <section>
              <h4>📍 Address</h4>
              {addressLines.map((line: string, index: number) => (
                <p key={index}>{line}</p>
              ))}
            </section>
          )}

          {props.states && (
            <p>States: {props.states}</p>
          )}

          {props.operatingHours?.length > 0 && (
            <section>
              <h4>Operating Hours</h4>
              {props.operatingHours.map((item: any, index: number) => (
                <div key={index}>
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                </div>
              ))}
            </section>
          )}

          {props.entranceFees?.length > 0 && (
            <section>
              <h4>Entrance Fees</h4>
              {props.entranceFees.map((fee: any, index: number) => (
                <div key={index}>
                  <strong>{fee.title}</strong>
                  <p>{fee.cost}</p>
                  <p>{fee.description}</p>
                </div>
              ))}
            </section>
          )}

          {props.activities?.length > 0 && (
            <section>
              <h4>Activities</h4>
              <ul>
                {props.activities.map((activity: any, index: number) => (
                  <li key={index}>{activity.name}</li>
                ))}
              </ul>
            </section>
          )}

          {props.directionsInfo && (
            <section>
              <h4>Directions</h4>
              <p>{props.directionsInfo}</p>
            </section>
          )}

          {contacts?.phoneNumbers?.length > 0 && (
            <section>
              <h4>Contact</h4>
              {contacts.phoneNumbers.map((phone: any, index: number) => (
                <p key={index}>
                  {phone.type}:{" "}
                  <a href={`tel:${phone.phoneNumber}`}>
                    {phone.phoneNumber}
                  </a>
                </p>
              ))}
              {contacts.emailAddresses?.map((email: any, index: number) => (
                <p key={index}>
                  Email: {email.emailAddress}
                </p>
              ))}
            </section>
          )}
        </>
      )}

      {/* Existing information for other places */}
      {props.duration && <p>Duration: {props.duration}</p>}
      {props.fee && <p>Fee: {props.fee}</p>}
      {props.best_time && <p>Best Time: {props.best_time}</p>}
      {props.best_time_to_visit && (
        <p>Best Time to Visit: {props.best_time_to_visit}</p>
      )}
      {props.access && <p>Access: {props.access}</p>}
      {props.parking && <p>Parking: {props.parking}</p>}

      {props.directionsUrl && (
        <p>
          <a href={props.directionsUrl} target="_blank" rel="noopener noreferrer">
            Directions ↗
          </a>
        </p>
      )}

      {(props.website || props.url) && (
        <p>
          <a
            href={props.website || props.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Official Website ↗
          </a>
        </p>
      )}

      {/* Additional NPS photos */}
      {isNPS && npsImages.length > 1 && (
        <section>
          <h4>More Photos</h4>
          <div className="popup-gallery">
            {npsImages.slice(1).map((image: any, index: number) => (
              <div key={index}>
                <img
                  src={image.url}
                  alt={image.altText || props.name}
                  className="popup-gallery-image"
                />
                {image.caption && <p>{image.caption}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
