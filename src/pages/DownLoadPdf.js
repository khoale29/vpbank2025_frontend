import React, { useState } from "react";
import { Download } from "lucide-react";

const DownloadPDF = () => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://tnu4ciir22.execute-api.ap-southeast-1.amazonaws.com/down/totrinh"
      );
      const data = await response.json();

      if (!data.url) throw new Error("No presigned URL returned");

      const fileResponse = await fetch(data.url);
      const blob = await fileResponse.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "totrinh.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download PDF.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Download PDF"
      style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      {loading ? (
        <span style={{ fontSize: 20 }}>⏳</span>
      ) : (
        <Download size={28} strokeWidth={2.5} />
      )}
    </button>
  );
};

export default DownloadPDF;
