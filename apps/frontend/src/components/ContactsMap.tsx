import { useEffect, useMemo } from 'react'
import { Box } from '@mui/material'
import {
    APIProvider, Map, AdvancedMarker, InfoWindow, useMap
} from '@vis.gl/react-google-maps'

type Contact = { id: number; name: string; lat?: number|null; lng?: number|null }
type Focus   = { id: number; name: string; lat: number; lng: number }

export default function ContactsMap({
    contacts,
    height = '100%',
    width = '100%',
    focus = null,
}: {
    contacts: Contact[]
    height?: number | string
    width?: number | string
    focus?: Focus | null
}) {
    const apiKey = import.meta.env.VITE_GMAPS_KEY as string
    const mapId  = import.meta.env.VITE_GMAPS_MAP_ID as string
    const h = typeof height === 'number' ? `${height}px` : height
    const w = typeof width === 'number' ? `${width}px` : width

    const points = useMemo(
        () => contacts
            .filter(c => typeof c.lat === 'number' && typeof c.lng === 'number')
            .map(c => ({ id: c.id, name: c.name, pos: { lat: c.lat as number, lng: c.lng as number } })),
        [contacts]
    )

    return (
        <Box sx={{ height: h, width: w,borderRadius: 2, overflow: 'hidden' }}>
            <APIProvider apiKey={apiKey}>
                <Map
                    id="contacts-map"
                    mapId={mapId}
                    defaultCenter={points[0] ? points[0].pos : { lat: -25.4284, lng: -49.2733 }}
                    defaultZoom={points[0] ? 12 : 5}
                    style={{ width: '100%', height: '100%' }}
                    disableDefaultUI
                >
                    <FitOrPan points={points.map(p => p.pos)} focus={focus} />
                    {points.map(p => (
                        <AdvancedMarker key={p.id} position={p.pos} title={p.name} />
                    ))}
                    {focus && (
                        <>
                            <AdvancedMarker position={{ lat: focus.lat, lng: focus.lng }} title={focus.name} />
                            <InfoWindow position={{ lat: focus.lat, lng: focus.lng }}>
                                <div style={{ fontWeight: 600 }}>{focus.name}</div>
                            </InfoWindow>
                        </>
                    )}
                </Map>
            </APIProvider>
        </Box>
    )
}

function FitOrPan({
                      points,
                      focus
                  }: {
    points: google.maps.LatLngLiteral[]
    focus: Focus | null
}) {
    const map = useMap('contacts-map')

    useEffect(() => {
        if (!map) return
        if (focus) {
            map.panTo({ lat: focus.lat, lng: focus.lng })
            map.setZoom(16)
            return
        }
        if (points.length) {
            const b = new google.maps.LatLngBounds()
            points.forEach(p => b.extend(p))
            map.fitBounds(b, 30)
        } else {
            map.setCenter({ lat: -25.4284, lng: -49.2733 })
            map.setZoom(5)
        }
    }, [map, points, focus])

    return null
}