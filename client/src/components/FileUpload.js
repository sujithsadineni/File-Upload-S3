import React, { useState } from "react";
import { Upload, Button, message, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./FileUpload.css";

const { Paragraph } = Typography;

function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  const handleUpload = async (file, onSuccess, onError) => {
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      message.success("✅ File uploaded successfully!");
      setFileUrl(data.s3_url);

      onSuccess("ok"); // tell AntD it's done
    } catch (err) {
      console.error("Upload error:", err);
      message.error("❌ Upload failed.");
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload File to S3</h2>

      <Upload
        customRequest={({ file, onSuccess, onError }) =>
          handleUpload(file, onSuccess, onError)
        }
        showUploadList={false}
        accept="*"
      >
        <Button
          icon={<UploadOutlined />}
          loading={uploading}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Select File"}
        </Button>
      </Upload>

      {fileUrl && (
        <Paragraph copyable className="file-link">
          ✅ File uploaded:{" "}
          <a href={fileUrl} target="_blank" rel="noreferrer">
            {fileUrl}
          </a>
        </Paragraph>
      )}
    </div>
  );
}

export default FileUpload;
