import { useState } from 'react'
import {
  ImageDisplay, PromptInput, ImageGallery
} from './components'
import { useImageGenerator, useImageStorage } from "./hooks";

function App() {
  const [enhancement, setEnhancement] = useState(false);

  const {
    prompt,
    setPrompt,
    generatedImage,
    isLoading,
    error,
    generateImage,
  } = useImageGenerator(enhancement);

  const {
    imageList,
    saveImage,
  } = useImageStorage(prompt, generatedImage);

  return (
    // Use Tailwind classes for layout and styling
    <div className="container mx-auto p-4 md:p-8 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
        Together AI Image Generator
      </h1>
      <h2 className="text-lg font-semibold mb-4 text-gray-800"><a className="hover:text-blue-500" href="https://cloud.cerebras.ai/">Cerebras API for enhancing prompt</a></h2>
      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        onGenerate={generateImage}
        isLoading={isLoading}
        enhancement={enhancement}
        setEnhancement={setEnhancement}
      />

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
        <ImageDisplay imageUrl={generatedImage} onSave={saveImage} />
      )}

      <ImageGallery images={imageList} />
    </div >
  );
}

export default App;
