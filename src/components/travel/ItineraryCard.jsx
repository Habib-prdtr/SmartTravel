// File disengaja dikosongkan dengan skeleton karena komponen sebenarnya 
// sudah diekspor dari src/pages/Itinerary.jsx sesuai arsitektur sebelumnya.
// File ini dapat digunakan kelak sebagai wrapper khusus atau root index.
import React from 'react';
import { ItineraryActivity, ItineraryDay } from '../../pages/Itinerary';

export { ItineraryActivity, ItineraryDay };

export default function GenericItineraryWrapper({ children }) {
  return (
    <div className="itinerary-wrapper">
      {children}
    </div>
  );
}
