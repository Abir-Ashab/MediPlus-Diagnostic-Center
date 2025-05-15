// src/components/RevenueDistribution.js
import React from "react";

const RevenueDistribution = ({ 
  totalAmount, 
  hospitalRevenue, 
  doctorRevenue, 
  brokerRevenue = 0, 
  hospitalPercentage = "90%", 
  doctorPercentage = "5%", 
  brokerPercentage = "5%",
  showBroker = true 
}) => {
  return (
    <div>
      <label>Revenue Distribution</label>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <div style={{ flex: 1, backgroundColor: "#f0f9ff", padding: "10px", borderRadius: "4px", textAlign: "center" }}>
          <div style={{ fontWeight: "bold", fontSize: "14px", color: "#3498db" }}>Hospital</div>
          <div style={{ fontSize: "16px" }}>{hospitalRevenue.toFixed(0)} Taka</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{hospitalPercentage}</div>
        </div>
        
        <div style={{ flex: 1, backgroundColor: "#f0fff9", padding: "10px", borderRadius: "4px", textAlign: "center" }}>
          <div style={{ fontWeight: "bold", fontSize: "14px", color: "#2ecc71" }}>Doctor</div>
          <div style={{ fontSize: "16px" }}>{doctorRevenue.toFixed(0)} Taka</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{doctorPercentage}</div>
        </div>
        
        {showBroker && (
          <div style={{ flex: 1, backgroundColor: "#fff9f0", padding: "10px", borderRadius: "4px", textAlign: "center" }}>
            <div style={{ fontWeight: "bold", fontSize: "14px", color: "#e67e22" }}>Broker</div>
            <div style={{ fontSize: "16px" }}>{brokerRevenue.toFixed(0)} Taka</div>
            <div style={{ fontSize: "12px", color: "#666" }}>{brokerPercentage}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueDistribution;
