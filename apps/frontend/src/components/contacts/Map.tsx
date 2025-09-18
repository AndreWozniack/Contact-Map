import { useEffect, useMemo, useState, useRef } from "react";
import { Box } from "@mui/material";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  Pin,
} from "@vis.gl/react-google-maps";
import { Tween, Easing, Group } from "@tweenjs/tween.js";



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
type ContactsMapProps = {
    contacts: Contact[];
    height?: number | string;
    width?: number | string;
    focus?: Focus | null;
};

/**
 * Componente de mapa interativo de contatos
 * 
 * Exibe contatos com coordenadas válidas em um mapa do Google Maps.
 * Permite visualizar localização dos contatos, focar em contato específico
 * e exibir informações em popup ao clicar nos marcadores.
 * 
 * @param props Propriedades do componente
 * @returns Mapa com marcadores dos contatos
 */
export default function ContactMap({
    contacts,
    height = "100%",
    width = "100%",
    focus = null,
}: ContactsMapProps) {
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

    const handleMarkerClick = (id: number) => {
        setActiveId(id);
    };

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
                    <FitOrPan 
                        points={markers.map((m) => m.pos)} 
                        focus={focus} 
                    />

                    {markers.map((m) => {
                        const selected = activeId === m.id;
                        return (
                            <AdvancedMarker
                                key={m.id}
                                position={m.pos}
                                title={m.name}
                                onClick={() => handleMarkerClick(m.id)}
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
  const groupRef = useRef<Group | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!groupRef.current) groupRef.current = new Group();

    let running = true;
    const loop = (time: number) => {
      if (!running) return;
      groupRef.current!.update(time);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      groupRef.current?.removeAll();
    };
  }, []);

  useEffect(() => {
    if (!map) return;
    if (!groupRef.current) groupRef.current = new Group();

    groupRef.current.removeAll();
    map.moveCamera({ center: map.getCenter()!.toJSON(), zoom: map.getZoom() ?? 14 });


    let targetCenter: google.maps.LatLngLiteral;
    let targetZoom: number;

    if (focus) {
      targetCenter = { lat: focus.lat, lng: focus.lng };
      targetZoom = 16;
    } else if (points.length > 1) {
      const { center, zoom } = getCenterAndZoomForPoints(map, points, 30);
      targetCenter = center;
      targetZoom = zoom;
    } else if (points.length === 1) {
      targetCenter = points[0];
      targetZoom = 15;
    } else {
      targetCenter = { lat: -25.4284, lng: -49.2733 };
      targetZoom = 13;
    }

    const currentCenter = map.getCenter()!;
    const state = {
      lat: currentCenter.lat(),
      lng: currentCenter.lng(),
      zoom: map.getZoom() ?? 14,
    };

    const dLat = Math.abs(targetCenter.lat - state.lat);
    const dLng = Math.abs(targetCenter.lng - state.lng);
    const dist = Math.hypot(dLat, dLng);

    const zoomDelta = Math.abs(targetZoom - state.zoom);
    const goingOut = targetZoom < state.zoom;
    const needsDolly = goingOut && dist > 0.05 && zoomDelta < 1.2;

    const midZoom = needsDolly
    ? Math.max(2, state.zoom - 2)
    : null;


    const duration = focus ? 750 : 900;

    const tweenPos =
      midZoom === null
        ? new Tween(state, groupRef.current)
            .to(
              { lat: targetCenter.lat, lng: targetCenter.lng, zoom: targetZoom },
              duration
            )
            .easing(Easing.Quadratic.InOut)
        :
          new Tween(state, groupRef.current)
            .to(
              { lat: targetCenter.lat, lng: targetCenter.lng },
              duration
            )
            .easing(Easing.Quadratic.InOut);

    if (midZoom !== null) {
      new Tween(state, groupRef.current)
        .to({ zoom: midZoom }, duration * 0.4)
        .easing(Easing.Cubic.InOut)
        .onUpdate(applyCamera)
        .start();

      new Tween(state, groupRef.current)
        .to({ zoom: targetZoom }, duration * 0.6)
        .delay(duration * 0.4)
        .easing(Easing.Cubic.InOut)
        .onUpdate(applyCamera)
        .start();
    }

    tweenPos.onUpdate(applyCamera).start();

    function applyCamera() {
      map!.moveCamera({
        center: { lat: state.lat, lng: state.lng },
        zoom: state.zoom,
      });
    }
  }, [map, points, focus]);

  return null;
}

/** Calcula center e zoom alvo p/ um conjunto de pontos com padding, sem fitBounds no final */
function getCenterAndZoomForPoints(
  map: google.maps.Map,
  points: google.maps.LatLngLiteral[],
  paddingPx: number
) {
  const bounds = new google.maps.LatLngBounds();
  points.forEach((p) => bounds.extend(p));

  const center = bounds.getCenter();
  const centerLiteral = { lat: center.lat(), lng: center.lng() };

  const div = map.getDiv() as HTMLElement;
  const width = div.clientWidth || 1;
  const height = div.clientHeight || 1;

  const zoom = getZoomForBounds(bounds, width, height, paddingPx);
  return { center: centerLiteral, zoom };
}

function getZoomForBounds(
  bounds: google.maps.LatLngBounds,
  mapWidth: number,
  mapHeight: number,
  padding: number
): number {
  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = 21;

  function latRad(lat: number) {
    const sin = Math.sin((lat * Math.PI) / 180);
    const clamped = Math.min(Math.max(sin, -0.9999), 0.9999);
    return Math.log((1 + clamped) / (1 - clamped)) / 2;
  }
  function zoom(mapPx: number, worldPx: number, fraction: number) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  const latFraction = Math.max(
    (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI,
    1e-9
  );
  const lngDiff = ne.lng() - sw.lng();
  const lngFraction = Math.max((lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360, 1e-9);

  const padW = Math.max(0, mapWidth - 2 * padding);
  const padH = Math.max(0, mapHeight - 2 * padding);

  const latZoom = zoom(padH, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(padW, WORLD_DIM.width, lngFraction);

  const target = Math.min(latZoom, lngZoom, ZOOM_MAX);
  return Math.max(2, target);
}