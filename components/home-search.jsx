"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "./ui/input";
import { Camera, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();



  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if(!searchTerm.trim()){
     toast.error('please enter the search term'); 
    }
    router.push(`/cars?search=${encodeURIComponent(searchTerm)}`)
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if(!searchImage){
      toast.error("Please upload the image first.")
      return; 
    }
  };

  // Define onDrop before using it in useDropzone
  const onDrop = (acceptedFiles) => {
    const file= acceptedFiles[0];
    if(file){
      if(file.size > 5*1024*1024){
        toast.error("Image must be less than 5MB")
        return;
      }
      setIsUploading(true);
      setSearchImage(file);

      const reader = new FileReader();
      reader.onloadend = ()=>{
        setImagePreview(reader.result);
        setIsUploading(false);
        toast.success("Image Uploaded Successfully")
      };

      reader.onerror=()=>{
        setIsUploading(false);
        toast.error("Failed to read the image")
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png"],
      },
      maxFiles: 1,
    });

  

  return (
    <div>
      <form onSubmit={handleTextSubmit}>
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Enter make, model, or use our AI Image Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-12 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm"
          />

          <div className="absolute right-[100px]">
            <Camera
              size={35}
              className="cursor-pointer rounded-xl p-1.5"
              onClick={() => setIsImageSearchActive(!isImageSearchActive)}
              style={{
                background: isImageSearchActive ? "black" : "",
                color: isImageSearchActive ? "white" : "",
              }}
            />
          </div>
          <Button type="submit" className="absolute right-2 rounded-full">
            Search
          </Button>
        </div>
      </form>

      {isImageSearchActive && (
        <div className="mt-4">
          <form onSubmit={handleImageSubmit}>
            <div>
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img src={imagePreview} alt="Car preview" className="h-40 object-contain rounded-md" />
                  <Button
                    variant='outline'
                    className="mt-2"
                    onClick={() => {
                      setImagePreview("");
                      setSearchImage(null);
                      toast.info("Image removed")
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-400 p-6 text-center cursor-pointer rounded-lg"
                >
                  <input {...getInputProps()} />
                 <div className="flex flex-col items-center">
                 <Upload className="h-12 w-12 text-gray-400 mb-2"/>
                  <p className="text-gray-400 mb-2">
                    {isDragActive && !isDragReject
                      ? "Leave the file here to upload"
                      : "Drag & drop a car image or click to select"}
                  </p>
                  {isDragReject && <p className="text-red-500 mb-2">Invalid image type</p>}
                  <p className="text-gray-400 text-sm">Supports: JPG, PNG (max 5MB)</p>
                 </div>
                </div>
              )}
            </div>

            {imagePreview && <Button
            type='submit'
            className='w-full mt-2'
            disabled={isUploading}
            >
              {isUploading ? "Uploading...": 'Search with this Image'}
              
              </Button>}
          </form>
        </div>
      )}
    </div>
  );
};

export default HomeSearch;
