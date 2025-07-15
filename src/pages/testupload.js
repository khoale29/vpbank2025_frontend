import React, { useState } from "react";

const UploadPdfButton = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const LAMBDA_URL =
    "https://ywyp18dj6c.execute-api.us-east-1.amazonaws.com/ulala/upload";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("⚠️ Please select a PDF file first.");
      return;
    }

    try {
      setStatus("🔄 Requesting presigned URL...");

      // Step 1: Get presigned URL from Lambda
      const response = await fetch(
        `${LAMBDA_URL}?filename=${encodeURIComponent(file.name)}`
      );
      if (!response.ok) throw new Error("Failed to get presigned URL");
      const data = await response.json();
      const presignedUrl = data.url;

      // Step 2: Upload to S3 via presigned URL
      setStatus("⬆️ Uploading...");
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/pdf", // VERY important
        },
        body: file, // This must be the File object (raw binary)
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Upload failed: ${uploadRes.status} - ${errorText}`);
      }

      setStatus("✅ Upload successful!");
    } catch (err) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Upload PDF
      </button>
      <div>{status}</div>
    </div>
  );
};

export default UploadPdfButton;
