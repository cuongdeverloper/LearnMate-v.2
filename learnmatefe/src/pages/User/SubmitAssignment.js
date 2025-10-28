import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, File, X, Upload, Download, FileText } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { toast } from "react-toastify";
import Textarea from "../../components/ui/TextArea";
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "../../lib/assignments";

import { submitAssignment } from "../../redux/action/courseActions";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

const SubmitAssignment = () => {
  const { id: assignmentId, courseId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    selectedAssignment: assignment,
    submitting,
    loading,
    feedback,
    error,
  } = useSelector((state) => state.assignments);

  const dispatch = useDispatch();

  if (!courseId || !assignmentId) {
    return <div>Invalid assignment Id</div>;
  }

  const validateFile = (selectedFile) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than 10MB. Your file is ${(
          selectedFile.size /
          1024 /
          1024
        ).toFixed(2)}MB.`,
      };
    }

    const hasValidType = ALLOWED_TYPES.includes(selectedFile.type);
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidType || !hasValidExtension) {
      return {
        valid: false,
        error: `Only PDF and DOCX files are allowed.`,
      };
    }

    return { valid: true, error: null };
  };

  const handleFileChange = (selectedFile) => {
    const validation = validateFile(selectedFile);
    if (validation.valid) {
      setFile(selectedFile);
      toast.success(`File "${selectedFile.name}" selected successfully`);
    } else {
      toast.error(validation.error || "Invalid file");
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileChange(droppedFiles[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = e.currentTarget.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileChange(selectedFiles[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file to submit");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("note", notes);
    formData.append("assignmentId", assignmentId);

    setIsSubmitting(true);

    try {
      dispatch(submitAssignment(formData));
      toast.success("Assignment submitted successfully!");
      navigate(`/user/my-courses/${courseId}`);
    } catch (err) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/user/my-courses/${courseId}`);
  };

  const getFileType = (url) => {
    if (url.toLowerCase().endsWith(".pdf")) {
      return "pdf";
    }
    if (url.toLowerCase().endsWith(".docx")) {
      return "docx";
    }
    return "unknown";
  };

  const getFileName = (url) => {
    return url.split("/").pop() || "assignment";
  };

  console.log(assignment);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={handleCancel} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-foreground mb-10">
            Submit Assignment
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {assignment.title}
          </p>

          <div className="space-y-6">
            <div className="border border-border rounded-lg p-3 bg-muted/30 ">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Description
              </h3>
              <p className="text-foreground bg-muted/30 p-2 rounded-lg">
                {assignment.description}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Due Date
              </h3>
              <p>{formatDate(assignment.deadline, "yyyy-MM-dd")}</p>
            </div>

            {assignment.fileUrl && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Assignment File
                </h3>
                {getFileType(assignment.fileUrl) === "pdf" ? (
                  <div className="border border-border rounded-lg overflow-hidden bg-white">
                    <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-foreground">
                          {getFileName(assignment.fileUrl)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = assignment.fileUrl;
                          link.download = getFileName(assignment.fileUrl);
                          link.click();
                        }}
                        className="gap-2 text-white"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                    <iframe
                      src={`${assignment.fileUrl}#toolbar=0`}
                      className="w-full h-96 border-none"
                      title="Assignment PDF"
                    />
                  </div>
                ) : (
                  <div className="border border-border rounded-lg p-4 bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-foreground">
                          {getFileName(assignment.fileUrl)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          DOCX file - Download to view
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = assignment.fileUrl;
                        link.download = getFileName(assignment.fileUrl);
                        link.click();
                      }}
                      className="gap-2 text-white"
                    >
                      <Download className="w-4 h-4 text-white" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Upload File
              </h3>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : file
                    ? "border-green-300 bg-green-50/30"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <File className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {file.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p>Drop your file here or click to browse</p>
                      <p className="text-sm text-muted-foreground">
                        PDF or DOCX files only, max 10MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
              {file && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="mt-2 gap-2 text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                  Remove file
                </Button>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Notes (Optional)
              </h3>
              <Textarea
                placeholder="Add any notes about your submission..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!file || isSubmitting}
                className="flex-1 text-white"
              >
                {isSubmitting ? "Submitting..." : "Submit Assignment"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SubmitAssignment;
