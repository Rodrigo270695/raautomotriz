/**
 * Datos de contacto de RA AUTOMOTRIZ — única fuente de verdad para footer y página Contacto
 */
export const CONTACT = {
    address: 'El Ayllu 267 - La Victoria - Lambayeque - Chiclayo',
    coordinates: {
        lat: -6.792135952183168,
        lng: -79.84532009492094,
    },
    /** URL para abrir en Google Maps (cómo llegar) */
    googleMapsUrl:
        'https://www.google.com/maps/place/6%C2%B047\'32.0%22S+79%C2%B050\'42.7%22W/@-6.7922211,-79.8477745,17z/data=!3m1!4b1!4m4!3m3!8m2!3d-6.7922211!4d-79.8451996?hl=es&entry=ttu',
    /** URL para iframe embed del mapa (coordenadas) */
    mapEmbedUrl: 'https://www.google.com/maps?q=-6.792135952183168,-79.84532009492094&z=17&output=embed',
    phone: null as string | null,
    schedule: 'Lun – Sáb (consultar)',
} as const;
