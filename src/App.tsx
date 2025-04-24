import { useState, useMemo } from "react"; // Added useMemo
import Together from "together-ai";

const model = "black-forest-labs/FLUX.1-schnell-Free";
const steps = 4;
const imageWidth = 1024;
const imageHeight = 1024;

function App() {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use useMemo to initialize the client only once, unless the API key changes (unlikely here)
  const together = useMemo(() => {
    const apiKey = import.meta.env.VITE_TOGETHER_API_KEY;
    if (!apiKey) {
      console.error("VITE_TOGETHER_API_KEY is not defined in environment variables.");
      // Optionally set an error state here to inform the user
      setError("API Key is missing. Please configure environment variables.");
    }
    return new Together({
      apiKey: apiKey,
    });
  }, []); // Empty dependency array means it runs once on mount

  const handleClick = async () => {
    const trimmedPrompt = prompt.trim();
    if (isLoading || !trimmedPrompt) {
      if (!trimmedPrompt) {
        setError("Please enter a prompt.");
      }
      return;
    }

    // Check if API key is missing before proceeding
    if (!import.meta.env.VITE_TOGETHER_API_KEY) {
      setError("API Key is missing. Cannot make requests.");
      return;
    }


    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      console.log("Requesting image generation...");
      const response = await together.images.create({
        model,
        prompt: trimmedPrompt, // Use trimmed prompt
        steps,
        width: imageWidth,
        height: imageHeight,
      });
      console.log("Response received:", response);

      const imageUrl = response?.data?.[0]?.url;

      if (!imageUrl) {
        console.error("Invalid response structure or missing URL:", response);
        throw new Error("Failed to get image URL from the API response.");
      }

      setGeneratedImage(imageUrl);

    } catch (err: unknown) {
      console.error("Error generating image:", err);

      if (err instanceof Error) {
        // Check for specific API errors if possible, otherwise show generic message
        setError(`Failed to generate image: ${err.message}`);
      } else {
        setError("An unknown error occurred during image generation.");
      }
      setGeneratedImage(null);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Use Tailwind classes for layout and styling
    <div className="container mx-auto p-4 md:p-8 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
        Together AI Image Generator
      </h1>
      <div className="flex flex-col sm:flex-row items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Enter text prompt here..."
          // Use Tailwind classes for input styling
          className="flex-grow w-full sm:w-auto border border-gray-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
        <button
          // Use Tailwind classes for button styling, including hover, focus, and disabled states
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-white font-medium py-2 px-5 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          onClick={handleClick}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            // Simple loading spinner/text
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Image"
          )}
        </button>
      </div>

      {isLoading && (
        <p className="my-4 text-center text-gray-600">Loading image, please wait...</p>
      )}

      {error && (
        // Use Tailwind classes for error message styling
        <p className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center font-semibold">
          Error: {error}
        </p>
      )}

      {generatedImage && !isLoading && !error && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Generated Image:</h2>
          <div className="flex justify-center">
            <img
              src={generatedImage}
              alt="Generated based on prompt"
              // Use Tailwind classes for image styling
              className="max-w-full h-auto border border-gray-200 rounded-lg shadow-md"
            // You might want to set explicit width/height based on generation params for layout stability
            // width={imageWidth}
            // height={imageHeight}
            />
          </div>

        </div>
      )}
    </div>
    // Removed the outer fragment <></> as the div now serves as the single root element
  );
}

export default App;
