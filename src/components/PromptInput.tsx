interface PromptInputProps {
  prompt: string
  setPrompt: (value: string) => void
  onGenerate: () => void
  isLoading: boolean
  enhancement: boolean
  setEnhancement: (value: boolean) => void
};

export function PromptInput({ prompt, setPrompt, onGenerate, isLoading,enhancement, setEnhancement }: PromptInputProps): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row items-center mb-4 gap-2">
      <input
        type="text"
        placeholder="Enter text prompt here..."
        className="flex-grow w-full sm:w-auto border border-gray-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isLoading}
      />
      <button
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-white font-medium py-2 px-5 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        onClick={onGenerate}
        disabled={isLoading || !prompt.trim()}
      >
        {isLoading ? (
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
      <div className="flex items-center mt-2 sm:mt-0">
        <input
          type="checkbox"
          id="enhancement"
          checked={enhancement}
          onChange={(e) => setEnhancement(e.target.checked)}
          className="mr-2"
          disabled={isLoading}
        />
        <label htmlFor="enhancement" className="text-gray-700 text-sm">Enhancement</label>
      </div>
    </div>
  )
}
