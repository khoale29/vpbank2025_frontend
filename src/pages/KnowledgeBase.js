import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  Download,
  File,
  BookOpen,
  MoveRight,
  Play,
} from "lucide-react";

const KnowledgeBase = () => {
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem("financial_report"); //financial_report englishAI_knowledgeBase
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Save files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("financial_report", JSON.stringify(files));
  }, [files]);

  // Drag Handler
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileUpload = async (fileList) => {
    setUploading(true);

    const LAMBDA_URL =
      "https://oierktg9ae.execute-api.ap-southeast-1.amazonaws.com/bctc/upload";

    // 1️⃣ Create metadata first and show as "processing"
    const newFileMetas = Array.from(fileList).map((file) => {
      return {
        id: Date.now() + Math.random(),
        file, // keep the raw File object for later
        name: file.name,
        type: file.name.split(".").pop().toLowerCase(),
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        uploadDate: new Date().toISOString().split("T")[0],
        status: "processing",
      };
    });

    // Show all files in UI immediately
    setFiles((prev) => [...newFileMetas, ...prev]);

    // 2️⃣ Process each file async and update status
    for (const fileMeta of newFileMetas) {
      try {
        const res = await fetch(
          `${LAMBDA_URL}?filename=${encodeURIComponent(fileMeta.name)}`
        );
        if (!res.ok) throw new Error("Failed to get presigned URL");

        const { url } = await res.json();

        const upload = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/pdf",
          },
          body: fileMeta.file,
        });

        if (!upload.ok) throw new Error("Upload failed");

        // 3️⃣ Update status to "processed"
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileMeta.id ? { ...f, status: "processed" } : f
          )
        );
      } catch (err) {
        console.error(`❌ Error uploading ${fileMeta.name}`, err);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileMeta.id ? { ...f, status: "failed" } : f
          )
        );
      }
    }

    setUploading(false);
  };

  // const handleFileUpload = async (fileList) => {
  //   setUploading(true);

  //   const LAMBDA_URL =
  //     "https://ywyp18dj6c.execute-api.us-east-1.amazonaws.com/ulala/upload";

  //   const newFiles = await Promise.all(
  //     Array.from(fileList).map(async (file) => {
  //       const id = Date.now() + Math.random();
  //       const fileMeta = {
  //         id,
  //         name: file.name,
  //         type: file.name.split(".").pop().toLowerCase(),
  //         size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
  //         uploadDate: new Date().toISOString().split("T")[0],
  //         status: "processing",
  //       };

  //       try {
  //         // Step 1: Get presigned URL from Lambda
  //         const res = await fetch(
  //           `${LAMBDA_URL}?filename=${encodeURIComponent(file.name)}`
  //         );
  //         if (!res.ok)
  //           throw new Error(`Failed to get presigned URL for ${file.name}`);
  //         const { url } = await res.json();

  //         // Step 2: Upload to S3
  //         const upload = await fetch(url, {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type": "application/pdf",
  //           },
  //           body: file,
  //         });

  //         if (!upload.ok) {
  //           const error = await upload.text();
  //           console.error(`Upload failed for ${file.name}: ${error}`);
  //           return { ...fileMeta, status: "failed" };
  //         }

  //         console.log(`✅ Uploaded ${file.name}`);
  //         return { ...fileMeta, status: "processed" };
  //       } catch (err) {
  //         console.error(`❌ Error uploading ${file.name}`, err);
  //         return { ...fileMeta, status: "failed" };
  //       }
  //     })
  //   );

  //   // Update state with all uploaded files
  //   setFiles((prev) => [...newFiles, ...prev]);
  //   setUploading(false);
  // };

  const deleteFile = (fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const getFileIcon = (type) => {
    if (type === "pdf") return <FileText className="h-5 w-5 text-red-500" />;
    if (type === "docx" || type === "doc")
      return <File className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    if (status === "processed") {
      return (
        <div className="flex items-center gap-[10px]">
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Ready
          </span>
        </div>
      );
    }
    if (status === "processing") {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          Processing
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
        Unknown
      </span>
    );
  };
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Multi-Agent Workflow
              </h1>
            </div>
          </div>
        </div>

        {/* Agent monitor */}
        <div className="border-2 rounded-2xl border-gray-400 p-6 w-full flex justify-center items-center min-h-[300px] bg-white mb-8">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="w-60 h-24 border-2 border-black rounded-2xl flex justify-center items-center font-medium mb-2">
                🤖 Document Extractor
              </div>
              <button className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                success
              </button>
            </div>
            <div className="text-2xl font-bold">
              <MoveRight />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-60 h-24 border-2 border-black rounded-2xl flex justify-center items-center font-medium mb-2">
                🤖 Information Checking
              </div>
              <button className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                failed
              </button>
            </div>
            <div className="text-2xl font-bold">
              <MoveRight />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-60 h-24 border-2 border-black rounded-2xl flex justify-center items-center font-medium mb-2">
                🤖 Financial Analyst
              </div>
              <button className="px-2 py-1 text-xs font-medium bg-gray-100 text-black-800 rounded-full">
                waiting
              </button>
            </div>
            <div className="text-2xl font-bold">
              <MoveRight />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-60 h-24 border-2 border-black rounded-2xl flex justify-center items-center font-medium mb-2">
                🤖 Risk Evaluator
              </div>
              <button className="px-2 py-1 text-xs font-medium bg-gray-100 text-black-800 rounded-full">
                waiting
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white mb-8">
            <Play className="w-6 h-6" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 bg-white"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                  Upload your Báo cáo tài chính
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-2xl">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600 font-medium">
                    Uploading files...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}

        {/* Files List */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Uploaded Documents
            </h2>
          </div>

          {files.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents yet
              </h3>
              <p className="text-gray-600">
                Upload your first Báo cáo tài chính to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">{file.size}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded {file.uploadDate}
                          </p>
                          {getStatusBadge(file.status)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
