import { Box, Alert } from '@mui/material'
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api'

export default function TestMap() {
    const key = import.meta.env.VITE_GMAPS_KEY as string | undefined
    const center = { lat: -25.4284, lng: -49.2733 }

    if (!key) {
        return <Alert severity="error">VITE_GMAPS_KEY não definida em .env.local</Alert>
    }

    const containerStyle = { width: '100%', height: '100%' }

    return (
        <Box sx={{ height: '100dvh', p: 2 }}>
            <LoadScript
                id="gmaps-test"
                googleMapsApiKey={key}
                onLoad={() => console.log('Maps JS loaded')}
                onError={(e) => console.error('Maps JS load error', e)}
            >
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={12}
                    options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
                >
                    <MarkerF position={center} />
                </GoogleMap>
            </LoadScript>
        </Box>
    )
}
