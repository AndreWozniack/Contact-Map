import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import {
    APIProvider,
    Map,
    AdvancedMarker,
    InfoWindow,
    useMap,
    Pin,
} from "@vis.gl/react-google-maps";

type Contact = {
    id: number;
    name: string;
    lat?: number | null;
    lng?: number | null;
    street?: string | null;
    number?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    phone?: string | null;
    cpf?: string | null;
};
type Focus = { id: number; name: string; lat: number; lng: number };

export default function ContactsMap({
    contacts,
    height = "100%",
    width = "100%",
    focus = null,
}: {
    contacts: Contact[];
    height?: number | string;
    width?: number | string;
    focus?: Focus | null;
}) {
    const apiKey = import.meta.env.VITE_GMAPS_KEY as string;
    const mapId = import.meta.env.VITE_GMAPS_MAP_ID as string;
    const h = typeof height === "number" ? `${height}px` : height;
    const w = typeof width === "number" ? `${width}px` : width;

    const markers = useMemo(
        () =>
            contacts
                .filter((c) => typeof c.lat === "number" && typeof c.lng === "number")
                .map((c) => ({
                    id: c.id,
                    name: c.name,
                    pos: { lat: c.lat as number, lng: c.lng as number },
                    address: [c.street, c.number, c.neighborhood, c.city, c.state]
                        .filter(Boolean)
                        .join(", "),
                    phone: c.phone ?? undefined,
                })),
        [contacts]
    );

    const [activeId, setActiveId] = useState<number | null>(null);
    useEffect(() => {
        setActiveId(focus?.id ?? null);
    }, [focus?.id]);

    return (
        <Box sx={{ height: h, width: w, borderRadius: 2, overflow: "hidden" }}>
            <APIProvider apiKey={apiKey}>
                <Map
                    id="contacts-map"
                    mapId={mapId}
                    defaultCenter={
                        markers[0] ? markers[0].pos : { lat: -25.4284, lng: -49.2733 }
                    }
                    defaultZoom={markers[0] ? 10 : 15}
                    style={{ width: "100%", height: "100%" }}
                    disableDefaultUI
                >
                    <FitOrPan points={markers.map((m) => m.pos)} focus={focus} />

                    {markers.map((m) => {
                        const selected = activeId === m.id;
                        return (
                            <AdvancedMarker
                                key={m.id}
                                position={m.pos}
                                title={m.name}
                                onClick={() => setActiveId(m.id)}
                            >
                                <Pin
                                    scale={selected ? 1.3 : 1}
                                    background="#6200ee"
                                    borderColor="#2d1163"
                                    glyphColor="#fff"
                                />
                            </AdvancedMarker>
                        );
                    })}

                    {(() => {
                        const m = markers.find((x) => x.id === activeId);
                        if (!m) return null;
                        return (
                            <InfoWindow
                                position={m.pos}
                                onCloseClick={() => setActiveId(null)}
                            >
                                <div style={{ minWidth: 220 }}>
                                    <div style={{ fontWeight: 700, marginBottom: 2 }}>
                                        {m.name}
                                    </div>
                                    {m.address && (
                                        <div style={{ fontSize: 12, color: "#555" }}>
                                            {m.address}
                                        </div>
                                    )}
                                    {m.phone && (
                                        <div style={{ fontSize: 12, marginTop: 4 }}>
                                            📞 {m.phone}
                                        </div>
                                    )}
                                    <div style={{ marginTop: 8 }}>
                                        <a
                                            href={`https://www.google.com/maps?q=${m.pos.lat},${m.pos.lng}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ fontSize: 12 }}
                                        >
                                            Abrir no Google Maps
                                        </a>
                                    </div>
                                </div>
                            </InfoWindow>
                        );
                    })()}
                </Map>
            </APIProvider>
        </Box>
    );
}

function FitOrPan({
    points,
    focus,
}: {
    points: google.maps.LatLngLiteral[];
    focus: Focus | null;
}) {
    const map = useMap("contacts-map");

    useEffect(() => {
        if (!map) return;

        if (focus) {
            smoothPanZoom(map, { lat: focus.lat, lng: focus.lng }, 16, {
                steps: 150,
                ease: (t) => 1 - Math.pow(1 - t, 3),
            });
            return;
        }

        if (points.length) {
            const b = new google.maps.LatLngBounds();
            points.forEach((p) => b.extend(p));
            map.fitBounds(b, 30);
            return;
        }

        map.setCenter({ lat: -25.4284, lng: -49.2733 });
        map.setZoom(15);
    }, [map, points, focus]);

    return null;
}

function smoothPanZoom(
    map: google.maps.Map,
    target: google.maps.LatLngLiteral,
    finalZoom: number,
    opts?: { duration?: number; steps?: number; ease?: (t: number) => number }
): Promise<void> {
    const steps = opts?.steps ?? 150;
    const ease = opts?.ease ?? ((t: number) => t);

    const start = map.getCenter()!;
    const startZoom = map.getZoom() ?? 5;

    const from = { lat: start.lat(), lng: start.lng() };
    const to = target;

    let i = 0;
    return new Promise<void>((resolve) => {
        const tick = () => {
            i++;
            const t = ease(Math.min(1, i / steps));
            const lat = from.lat + (to.lat - from.lat) * t;
            const lng = from.lng + (to.lng - from.lng) * t;
            const zoom = startZoom + (finalZoom - startZoom) * t;

            map.setCenter({ lat, lng });
            map.setZoom(zoom);

            if (i < steps) {
                requestAnimationFrame(tick);
            } else {
                resolve();
            }
        };
        requestAnimationFrame(tick);
    });
}