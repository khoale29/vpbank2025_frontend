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

import Popup from "reactjs-popup";

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

  const getStatusprocess = (responsea, errora, loadinga) => {
    if (responsea) {
      return (
        <button className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          success
        </button>
      );
    }
    if (loadinga) {
      return (
        <button className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          proccessing
        </button>
      );
    }
    if (errora) {
      return (
        <button className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          failed
        </button>
      );
    }
    return (
      <button className="px-2 py-1 text-xs font-medium bg-gray-100 text-black-800 rounded-full">
        waiting
      </button>
    );
  };

  const [responseagent1, setResponseagent1] = useState(null);
  const [erroragent1, setErroragent1] = useState(null);
  const [loadingagent1, setLoadingagent1] = useState(false);
  const [elapsedagent1, setElapsedagent1] = useState(0);

  const [responseagent2, setResponseagent2] = useState(null);
  const [erroragent2, setErroragent2] = useState(null);
  const [loadingagent2, setLoadingagent2] = useState(false);
  const [elapsedagent2, setElapsedagent2] = useState(0);

  const [responseagent3, setResponseagent3] = useState(null);
  const [erroragent3, setErroragent3] = useState(null);
  const [loadingagent3, setLoadingagent3] = useState(false);
  const [elapsedagent3, setElapsedagent3] = useState(0);

  const [responseagent4, setResponseagent4] = useState(null);
  const [erroragent4, setErroragent4] = useState(null);
  const [loadingagent4, setLoadingagent4] = useState(false);
  const [elapsedagent4, setElapsedagent4] = useState(0);

  useEffect(() => {
    let timer;
    if (loadingagent1) {
      timer = setInterval(() => {
        setElapsedagent1((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setElapsedagent1(0);
    }
    return () => clearInterval(timer);
  }, [loadingagent1]);

  const handlePostagent1 = async () => {
    setLoadingagent1(true);
    setErroragent1(false);
    setResponseagent1(null);

    try {
      const res = await fetch(
        "https://lkmx3bab63lkjzo7n2oixnjb3m0xzytp.lambda-url.ap-southeast-1.on.aws/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bucket: "testworkflow123",
            prefix: "pdf/vlg",
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Lambda Response:", data);
      setResponseagent1(data);
      setLoadingagent1(false);
      // ✅ Call Agent 2 only if Agent 1 succeeded
      await handlePostagent2();
    } catch (err) {
      console.error("Error posting to Lambda:", err);
      setErroragent1(err.message);
    } finally {
      setLoadingagent1(false);
    }
  };

  useEffect(() => {
    let timer;
    if (loadingagent2) {
      timer = setInterval(() => {
        setElapsedagent2((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setElapsedagent2(0);
    }
    return () => clearInterval(timer);
  }, [loadingagent2]);

  const handlePostagent2 = async () => {
    setLoadingagent2(true);
    setErroragent2(false);
    setResponseagent2(null);

    try {
      const res = await fetch(
        "https://5dt355crrhr3vvinnhpg2dcrgq0kzqfu.lambda-url.ap-southeast-1.on.aws/"
      );

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Lambda Response:", data);
      setResponseagent2(data);

      setLoadingagent2(false);
    } catch (err) {
      console.error("Error posting to Lambda:", err);
      setErroragent2(err.message);
    } finally {
      setLoadingagent2(false);
    }
  };

  useEffect(() => {
    let timer;
    if (loadingagent3) {
      timer = setInterval(() => {
        setElapsedagent3((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setElapsedagent3(0);
    }
    return () => clearInterval(timer);
  }, [loadingagent3]);

  const handlePostagent3 = async () => {
    setLoadingagent3(true);
    setErroragent3(false);
    setResponseagent3(null);

    try {
      const res = await fetch(
        "https://qhm4h4igpznxtnastypdugohna0zlbxv.lambda-url.ap-southeast-1.on.aws/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bucket: "testworkflow123",
            prefix: "pdf/vlg",
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Lambda Response:", data);
      setResponseagent3(data);
      setLoadingagent3(false);
      // ✅ Call Agent 4 only if Agent 3 succeeded
      await handlePostagent4();
    } catch (err) {
      console.error("Error posting to Lambda:", err);
      setErroragent3(err.message);
    } finally {
      setLoadingagent3(false);
    }
  };

  useEffect(() => {
    let timer;
    if (loadingagent4) {
      timer = setInterval(() => {
        setElapsedagent4((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setElapsedagent4(0);
    }
    return () => clearInterval(timer);
  }, [loadingagent4]);

  const handlePostagent4 = async () => {
    setLoadingagent4(true);
    setErroragent4(false);
    setResponseagent4(null);

    try {
      const res = await fetch(
        "https://lkmx3bab63lkjzo7n2oixnjb3m0xzytp.lambda-url.ap-southeast-1.on.aws/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bucket: "testworkflow123",
            prefix: "pdf/vlg",
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Lambda Response:", data);
      setResponseagent4(data);
      setLoadingagent4(false);
    } catch (err) {
      console.error("Error posting to Lambda:", err);
      setErroragent4(err.message);
    } finally {
      setLoadingagent4(false);
    }
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

              <Popup
                modal
                trigger={getStatusprocess(
                  responseagent1,
                  erroragent1,
                  loadingagent1
                )}
              >
                {responseagent1 && (
                  <div className="mt-4 p-2 bg-green-100 border border-green-300 rounded w-[600px] h-[400px] overflow-auto">
                    <pre>{JSON.stringify(responseagent1, null, 2)}</pre>
                  </div>
                )}
                {loadingagent1 && (
                  <div className="mt-4 p-2 bg-gray-100 border border-gray-300 rounded w-[600px] h-[400px] overflow-auto">
                    Waiting for response... ({elapsedagent1}s)
                    {elapsedagent1 > 60 && (
                      <div className="text-yellow-600">⚠️ Still running...</div>
                    )}
                  </div>
                )}
                {erroragent1 && (
                  <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded w-[600px] h-[400px] overflow-auto">
                    <strong>Error:</strong> {erroragent1}
                  </div>
                )}
              </Popup>
            </div>
            <div className="text-2xl font-bold">
              <MoveRight />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-60 h-24 border-2 border-black rounded-2xl flex justify-center items-center font-medium mb-2">
                🤖 Information Checking
              </div>
              <Popup
                modal
                trigger={getStatusprocess(
                  responseagent2,
                  erroragent2,
                  loadingagent2
                )}
              >
                {responseagent2 && (
                  <div className="mt-4 p-2 bg-green-100 border border-green-300 rounded w-[600px] h-[400px] overflow-auto">
                    <pre>{JSON.stringify(responseagent2, null, 2)}</pre>
                  </div>
                )}
                {loadingagent2 && (
                  <div className="mt-4 p-2 bg-gray-100 border border-gray-300 rounded w-[600px] h-[400px] overflow-auto">
                    Waiting for response... ({elapsedagent2}s)
                    {elapsedagent2 > 60 && (
                      <div className="text-yellow-600">⚠️ Still running...</div>
                    )}
                  </div>
                )}
                {erroragent2 && (
                  <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded w-[600px] h-[400px] overflow-auto">
                    <strong>Error:</strong> {erroragent2}
                  </div>
                )}
              </Popup>
            </div>
            <div className="text-2xl font-bold">
              <MoveRight />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-60 h-24 border-2 border-black rounded-2xl flex justify-center items-center font-medium mb-2">
                🤖 Financial Analyst
              </div>

              <Popup
                modal
                trigger={getStatusprocess(
                  responseagent3,
                  erroragent3,
                  loadingagent3
                )}
              >
                {responseagent3 && (
                  <div className="mt-4 p-2 bg-green-100 border border-green-300 rounded w-[600px] h-[400px] overflow-auto">
                    <pre>{JSON.stringify(responseagent3, null, 2)}</pre>
                  </div>
                )}
                {loadingagent3 && (
                  <div className="mt-4 p-2 bg-gray-100 border border-gray-300 rounded w-[600px] h-[400px] overflow-auto">
                    Waiting for response... ({elapsedagent3}s)
                    {elapsedagent3 > 60 && (
                      <div className="text-yellow-600">⚠️ Still running...</div>
                    )}
                  </div>
                )}
                {erroragent3 && (
                  <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded w-[600px] h-[400px] overflow-auto">
                    <strong>Error:</strong> {erroragent3}
                  </div>
                )}
              </Popup>
            </div>
            <div className="text-2xl font-bold">
              <MoveRight />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-60 h-24 border-2 border-black rounded-2xl flex justify-center items-center font-medium mb-2">
                🤖 Risk Evaluator
              </div>
              <Popup
                modal
                trigger={getStatusprocess(
                  responseagent4,
                  erroragent4,
                  loadingagent4
                )}
              >
                {responseagent4 && (
                  <div className="mt-4 p-2 bg-green-100 border border-green-300 rounded w-[600px] h-[400px] overflow-auto">
                    <pre>{JSON.stringify(responseagent4, null, 2)}</pre>
                  </div>
                )}
                {loadingagent4 && (
                  <div className="mt-4 p-2 bg-gray-100 border border-gray-300 rounded w-[600px] h-[400px] overflow-auto">
                    Waiting for response... ({elapsedagent4}s)
                    {elapsedagent4 > 60 && (
                      <div className="text-yellow-600">⚠️ Still running...</div>
                    )}
                  </div>
                )}
                {erroragent4 && (
                  <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded w-[600px] h-[400px] overflow-auto">
                    <strong>Error:</strong> {erroragent4}
                  </div>
                )}
              </Popup>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white mb-8"
            onClick={handlePostagent1}
          >
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
