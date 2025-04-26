import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
};

export function ImageGallery({ images }: ImageGalleryProps): JSX.Element {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">Generated Images</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="aspect-square overflow-hidden rounded-lg shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => setSelectedImage(imageUrl)}
          >
            <img
              src={imageUrl}
              alt={`Generated ${index}`}
              className="w-full h-full object-cover"
              width={128}
              height={128}
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white p-4 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Selected"
              width={512}
              height={512}
              style={{ width: 512, height: 512, objectFit: "cover" }}
              className="rounded"
            />
            <button
              className="mt-4 block mx-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded"
              onClick={() => setSelectedImage(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
