"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "./ui/input";
import { Camera, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

      const reader = FileReader();
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

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    console.log("Search Term:", searchTerm);
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    console.log("Uploading Image...");
  };

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
                <div>
                  <img src={imagePreview} alt="Uploaded preview" className="w-32 h-32 object-cover rounded-md" />
                  <Button
                    type="button"
                    className="mt-2"
                    onClick={() => {
                      setImagePreview("");
                      setSearchImage(null);
                    }}
                  >
                    Remove
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
                  <p>
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
          </form>
        </div>
      )}
    </div>
  );
};

export default HomeSearch;
