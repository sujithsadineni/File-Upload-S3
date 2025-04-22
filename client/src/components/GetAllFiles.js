import React, { useEffect, useState } from "react";
import { Table, Button, message, Popconfirm } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";

function GetAllFiles({ refreshTrigger }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/files");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch files");
      setFiles(data);
    } catch (err) {
      console.error("Error fetching files:", err);
      message.error("Failed to fetch files.");
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/files/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete file");

      message.success("File deleted successfully!");
      fetchFiles();
    } catch (err) {
      console.error("Error deleting file:", err);
      message.error("Failed to delete file.");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const columns = [
    {
      title: "File Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "File Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Upload Date",
      dataIndex: "uploadDate",
      key: "uploadDate",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <a href={record.url} download target="" rel="noopener noreferrer">
            <Button type="default" icon={<CloudDownloadOutlined />}>
              Download
            </Button>
          </a>
          <Popconfirm
            title="Are you sure you want to delete this file?"
            onConfirm={() => deleteFile(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Files</h2>
      <Table
        dataSource={files.map((file) => ({
          id: file.id,
          name: file.filename,
          type: file.mimetype,
          uploadDate: file.uploaded_at,
          url: file.s3_url,
        }))}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}

export default GetAllFiles;
