
const MapStyles = () => {
  return (
    <style>{`
      .mapboxgl-ctrl-group {
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        border: 1px solid rgba(0,0,0,0.1) !important;
      }
      
      .mapboxgl-ctrl-group button {
        border-radius: 6px !important;
        transition: all 0.2s ease !important;
      }
      
      .mapboxgl-ctrl-group button:hover {
        background-color: #f8f9fa !important;
        transform: scale(1.05) !important;
      }
      
      .mapboxgl-ctrl-zoom-in,
      .mapboxgl-ctrl-zoom-out,
      .mapboxgl-ctrl-compass {
        background-color: white !important;
        color: #003087 !important;
        font-weight: bold !important;
      }
      
      .mapboxgl-ctrl-fullscreen-button {
        background-color: white !important;
      }
      
      .region-popup .mapboxgl-popup-content {
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
        border: 1px solid #ddd !important;
        padding: 0 !important;
        max-width: 250px !important;
        font-family: Arial, sans-serif !important;
      }
      
      .region-popup .mapboxgl-popup-tip {
        border-top-color: white !important;
      }
      
      .mapboxgl-popup-close-button {
        color: #666 !important;
        font-size: 16px !important;
        padding: 6px !important;
        border-radius: 50% !important;
        background-color: #f5f5f5 !important;
        margin: 4px !important;
        transition: all 0.2s ease !important;
      }
      
      .mapboxgl-popup-close-button:hover {
        background-color: #e0e0e0 !important;
        color: #333 !important;
      }
      
      .region-marker {
        cursor: pointer !important;
      }
      
      .mapboxgl-canvas-container {
        border-radius: 12px !important;
      }
      
      .mapboxgl-canvas {
        border-radius: 12px !important;
      }
      
      .mapboxgl-ctrl-attrib {
        border-radius: 0 0 12px 0 !important;
        background-color: rgba(255,255,255,0.9) !important;
        backdrop-filter: blur(10px) !important;
      }
      
      .mapboxgl-ctrl-scale {
        background-color: rgba(255,255,255,0.9) !important;
        backdrop-filter: blur(10px) !important;
        border-radius: 4px !important;
        border: 1px solid rgba(0,0,0,0.1) !important;
        padding: 4px 8px !important;
        font-weight: 500 !important;
        color: #003087 !important;
      }
    `}</style>
  );
};

export default MapStyles;
