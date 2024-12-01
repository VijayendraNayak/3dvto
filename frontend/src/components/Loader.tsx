import React from "react";
import { BallTriangle } from "react-loader-spinner";

type LoaderProps = {
  color?: string;
};

const Loader = ({ color = "#800080" }: LoaderProps) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.8)", // White background with opacity
        display: "flex",
        flexDirection: "column", // Stack spinner and text vertically
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999, // Ensure it is above all other components
      }}
    >
      <BallTriangle
        height={100}
        width={100}
        radius={5}
        color={color}
        ariaLabel="ball-triangle-loading"
        visible={true}
      />
      <p
        style={{
          marginTop: "20px", // Add some space between spinner and text
          fontSize: "18px",
          color: "#333", // Text color
          fontWeight: "500",
          textAlign: "center",
        }}
      >
        Be patient, it may take a while...
      </p>
    </div>
  );
};

export default Loader;
