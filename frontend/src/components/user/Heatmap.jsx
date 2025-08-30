import React, { useEffect, useState } from "react";
import HeatMap from "@uiw/react-heat-map";

// Function to generate random activity data
const generateActivityData = (startDate, endDate) => {
  const data = [];
  let currentDate = new Date(startDate);
  let end = new Date(endDate);

  while (currentDate <= end) {
    const count = Math.floor(Math.random() * 20); // random contribution count
    data.push({
      date: currentDate.toISOString().split("T")[0],
      count: count,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
};

// Function to generate panel colors
const getPanelColors = maxCount => {
  const colors = {};
  for (let i = 0; i <= maxCount; i++) {
    const greenValue = Math.floor((i / maxCount) * 255);
    colors[i] = `rgb(0, ${greenValue}, 0)`; // gradient from dark to bright green
  }
  return colors;
};

const HeatMapProfile = () => {
  const [activityData, setActivityData] = useState([]);
  const [panelColors, setPanelColors] = useState({});

  useEffect(() => {
    // Start = 1 year ago, End = today
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const data = generateActivityData(startDate, endDate);
    setActivityData(data);

    const maxCount = Math.max(...data.map(d => d.count));
    setPanelColors(getPanelColors(maxCount));
  }, []);

  return (
    <div>
      <h4 style={{ color: "white", marginBottom: "20px" }}>
        Recent Contributions
      </h4>
      <HeatMap
        className="HeatMapProfile"
        style={{
          width: "100%",
          maxWidth: "1200px",
          height: "280px", // 👈 increased height
          color: "white",
        }}
        value={activityData}
        weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
        startDate={
          new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        }
        endDate={new Date()}
        rectSize={15} // 👈 bigger squares (was 11 before)
        space={3} // 👈 slightly more spacing
        rectProps={{
          rx: 3, // 👈 little more rounded
        }}
        panelColors={panelColors}
      />
    </div>
  );
};

export default HeatMapProfile;
