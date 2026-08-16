
import React from "react";

const MapMarkerStyles = () => {
  return (
    <style>
      {`
      .custom-marker {
        position: relative;
        width: 24px;
        height: 24px;
        cursor: pointer;
      }
      .marker-pin {
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        background: #003087;
        position: absolute;
        transform: rotate(-45deg);
        left: 50%;
        top: 50%;
        margin: -15px 0 0 -15px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .marker-pin::after {
        content: '';
        width: 16px;
        height: 16px;
        margin: 4px 0 0 4px;
        background: white;
        position: absolute;
        border-radius: 50%;
      }
      `}
    </style>
  );
};

export default MapMarkerStyles;
