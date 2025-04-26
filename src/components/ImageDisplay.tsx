interface ImageDisplayProps {
  imageUrl: string
  onSave: () => void
};

export function ImageDisplay({ imageUrl, onSave }: ImageDisplayProps): JSX.Element {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Generated Image:</h2>
      <div className="flex justify-center">
        <img
          src={imageUrl}
          alt="Generated"
          className="border border-gray-200 rounded-lg shadow-md"
          width={512}
          height={512}
          style={{ width: "512px", height: "512px", objectFit: "cover" }}
        />
      </div>
      <div className="flex justify-center py-4">
        <button
          onClick={onSave}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Image
        </button>
      </div>
    </div>
  );
};
