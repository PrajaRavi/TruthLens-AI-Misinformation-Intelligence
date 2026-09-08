import React, { useState} from 'react';
import axios, { AxiosError } from 'axios';
import { X } from 'lucide-react';

// -------------------------------------------------------------------
// TypeScript Interfaces
// -------------------------------------------------------------------

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

const FASTAPI_BASE_URL = 'http://localhost:8000'; // Your FastAPI backend URL
const IMAGEKIT_PUBLIC_KEY = import.meta.env.IMAGEKIT_PUBLIC_KEY||"public_yP80Gt0Hdrw76WuuA2iHLaZCRxk="; // Replace with your ImageKit Public Key
const IMAGEKIT_UPLOAD_ENDPOINT = 'https://upload.imagekit.io/api/v1/files/upload';

export const DocumentUploader = ({setIsDocUpload}:{setIsDocUpload:React.Dispatch<React.SetStateAction<boolean>>}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedData, setUploadedData] = useState<ImageKitUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Handle File Selection
  const handleFileChange = (e:any): void => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadProgress(0);
      setError(null);
      setUploadedData(null);
    }
  };

  // 2. Main Upload Function
  const uploadDocumentToImageKit = async (): Promise<void> => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step A: Fetch authentication parameters from FastAPI backend
      const authResponse = await axios.get<ImageKitAuthResponse>(
        `${FASTAPI_BASE_URL}/api/imagekit-auth`
      );
      const { token, expire, signature } = authResponse.data;

      // Step B: Build FormData for ImageKit V1 API
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', selectedFile.name);
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
              setUploadProgress(percentCompleted);
            }
          },
        }
      );
      setUploadProgress(0)
      // Step D: Successfully set uploaded file details
      setUploadedData(uploadResponse.data);
      let processing_RAG_pipeline=await axios.post(`${FASTAPI_BASE_URL}/api/RAG_process_delete_file_pipeline?file_id=${String(uploadResponse.data.fileId)}&path=${String(uploadResponse.data.url)}&signature=${String(signature)}&token=${token}&expire=${expire}`,{},{onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },})

    if(processing_RAG_pipeline?.data.success){
      // toast.success(processing_RAG_pipeline?.data?.message)
      setIsDocUpload(false)

    }
    else{
      // toast.error("error during document upload")
      console.log(processing_RAG_pipeline?.data)
    }

      
    } catch (err: unknown) {
      console.error('Upload Error:', err);
      if (axios.isAxiosError(err)) {
        const serverError = err as AxiosError<{ message?: string }>;
        setError(
          serverError.response?.data?.message ||
            serverError.message ||
            'An error occurred during file upload.'
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button className='absolute top-3 right-3 text-xl' onClick={()=>{
        setIsDocUpload(false)
      }}><X/></button>
      <h2>Upload RAG Document</h2>

      <input
        type="file"
        accept='application/pdf, .pdf'
        onChange={handleFileChange}
        disabled={isUploading}
        style={styles.fileInput}
      />

      {selectedFile && (
        <button
          onClick={uploadDocumentToImageKit}
          disabled={isUploading}
          style={styles.button}
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      )}

      {/* Upload Progress Bar */}
      {isUploading && (
        <div style={styles.progressContainer}>
          <div style={styles.progressBarWrapper}>
            <div
              style={{
                ...styles.progressBarFill,
                width: `${uploadProgress}%`,
              }}
            />
          </div>
          <span style={styles.progressText}>{uploadProgress}%</span>
        </div>
      )}

      {/* Error Message Display */}
      {error && <div style={styles.error}>{error}</div>}

      {/* Success Details Display */}
      {uploadedData && (
        <div style={styles.successContainer}>
          <h3>File Uploaded Successfully!</h3>
          </div>
      )}
    </div>
  );
};

// CSS Properties mapping for inline styling
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '500px',
    margin: '2rem auto',
    padding: '1.5rem',
    zIndex:20,
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor:"white",
    
    fontFamily: 'sans-serif',
  },
  fileInput: { display: 'block', marginBottom: '1rem' },
  button: {
    padding: '10px 16px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  progressContainer: {
    marginTop: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  progressBarWrapper: {
    flexGrow: 1,
    height: '12px',
    backgroundColor: '#e0e0e0',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0070f3',
    transition: 'width 0.2s ease-in-out',
  },
  progressText: { fontWeight: 'bold', minWidth: '40px' },
  error: { marginTop: '1rem', color: '#d93025' },
  successContainer: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#e6f4ea',
    borderRadius: '4px',
  },
};

export default DocumentUploader;