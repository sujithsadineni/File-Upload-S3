import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import GetAllFiles from "./components/GetAllFiles";

function App() {
  const [refreshFiles, setRefreshFiles] = useState(false);

  const triggerRefresh = () => {
    setRefreshFiles((prev) => !prev);
  };

  return (
    <div>
      <FileUpload onUploadSuccess={triggerRefresh} />
      <GetAllFiles refreshTrigger={refreshFiles} />
    </div>
  );
}

export default App;
