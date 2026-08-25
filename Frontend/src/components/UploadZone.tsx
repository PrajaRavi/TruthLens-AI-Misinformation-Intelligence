import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatFileSize } from "@/lib/utils";
import axios from "axios";
export interface UploadedFile {
  file: File;
  url: string;
}

// Response schema from FastAPI /api/imagekit-auth
interface ImageKitAuthResponse {
  token: string;
  expire: number;
  signature: string;
  imagekit_id?: string;
}

// Response schema returned by ImageKit Upload API
interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
  filePath: string;
  fileType: string;
  isPrivateFile: boolean;
  customCoordinates: string | null;
}

interface UploadZoneProps {
  accept: string;
  formatsLabel: string;
  icon: React.ReactNode;
  onFile: (file: UploadedFile | null) => void;
  file: UploadedFile | null;
  preview?: (file: UploadedFile) => React.ReactNode;
}

const FASTAPI_BASE_URL = 'http://localhost:8000'; // Your FastAPI backend URL
const IMAGEKIT_PUBLIC_KEY = import.meta.env.IMAGEKIT_PUBLIC_KEY||"public_yP80Gt0Hdrw76WuuA2iHLaZCRxk="; // Replace with your ImageKit Public Key
const IMAGEKIT_UPLOAD_ENDPOINT = 'https://upload.imagekit.io/api/v1/files/upload';

export function UploadZone({
  accept,
  formatsLabel,
  icon,
  onFile,
  
  file,
  preview,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const [uploadedData, setUploadedData] = useState<ImageKitUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    // const url = URL.createObjectURL(f);
    // Simulate upload progress (frontend demo).
    setProgress(0);
    

    /*
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + 20;
      });
    }, 80);
    */
try {
      // Step A: Fetch authentication parameters from FastAPI backend
      const authResponse = await axios.get<ImageKitAuthResponse>(
        `${FASTAPI_BASE_URL}/api/imagekit-auth`
      );
      const { token, expire, signature } = authResponse.data;

      // Step B: Build FormData for ImageKit V1 API
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('fileName', files[0].name);
      formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
      formData.append('signature', signature);
      formData.append('token', token);
      formData.append('expire', expire.toString());
      formData.append('useUniqueFileName', 'true'); // Optional: appends unique suffix
      formData.append('folder', '/rag_documents');  // Optional: folder inside ImageKit

      // Step C: Send POST request to ImageKit with upload progress tracking
      const uploadResponse = await axios.post<ImageKitUploadResponse>(
        IMAGEKIT_UPLOAD_ENDPOINT,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          },
        }
      );
      // setUploadProgress(0)
      // Step D: Successfully set uploaded file details
      setUploadedData(uploadResponse.data);
      onFile({ file: f, url:uploadResponse.data.url });

      console.log(uploadResponse.data)
      
      
    } finally {
      setIsUploading(false);
    }
      
    
  }
  if (file && progress>90) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        {preview && <div className="mb-3">{preview(file)}</div>}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {file.file.name}
            </p>
            <p className="text-xs text-muted">
              {formatFileSize(file.file.size)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              URL.revokeObjectURL(file.url);
              onFile(null);
              setProgress(0);
            }}
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Upload file. Supported formats: ${formatsLabel}`}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        dragging
          ? "border-primary bg-primary/5"
          : "border-border-strong hover:border-primary/50 hover:bg-surface-2/50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-primary">
        {icon}
      </div>
      {progress > 0 && progress < 100 ? (
        <div className="mt-4 w-full max-w-xs">
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">Uploading… {progress}%</p>
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm font-medium text-foreground">
            <span className="text-primary">Browse files</span> or drop here
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <UploadCloud className="h-3.5 w-3.5" />
            Supported: {formatsLabel}
          </p>
        </>
      )}
    </div>
  );
}
