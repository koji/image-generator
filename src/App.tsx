// import { useState } from 'react'
// import {
//   ImageDisplay, PromptInput, ImageGallery
// } from './components'
// import { useImageGenerator, useImageStorage } from "./hooks";

// function App() {
//   const [enhancement, setEnhancement] = useState(false);

//   const {
//     prompt,
//     setPrompt,
//     generatedImage,
//     isLoading,
//     error,
//     generateImage,
//   } = useImageGenerator(enhancement);

//   const {
//     imageList,
//     saveImage,
//   } = useImageStorage(prompt, generatedImage);

//   return (
//     // Use Tailwind classes for layout and styling
//     <div className="container mx-auto p-4 md:p-8 font-sans">
//       <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
//         Together AI Image Generator
//       </h1>
//       <h2 className="text-lg font-semibold mb-4 text-gray-800"><a className="hover:text-blue-500" href="https://cloud.cerebras.ai/">Cerebras API for enhancing prompt</a></h2>
//       <PromptInput
//         prompt={prompt}
//         setPrompt={setPrompt}
//         onGenerate={generateImage}
//         isLoading={isLoading}
//         enhancement={enhancement}
//         setEnhancement={setEnhancement}
//       />

//       {isLoading && (
//         <p className="my-4 text-center text-gray-600">Loading image, please wait...</p>
//       )}

//       {error && (
//         // Use Tailwind classes for error message styling
//         <p className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center font-semibold">
//           Error: {error}
//         </p>
//       )}


//       {generatedImage && !isLoading && !error && (
//         <ImageDisplay imageUrl={generatedImage} onSave={saveImage} />
//       )}

//       <ImageGallery images={imageList} />
//     </div >
//   );
// }

// export default App;

import { useState, useEffect } from 'react';
import { ImageDisplay, ImageGallery } from './components';
import { useImageGenerator, useImageStorage, useSpeechRecognition } from "./hooks"; // useSpeechRecognition をインポート

function App() {
  const [enhancement, setEnhancement] = useState(false);
  const [appState, setAppState] = useState<'idle' | 'listening' | 'processingSpeech' | 'enhancingPrompt' | 'generatingImage' | 'displayingImage' | 'error'>('idle');

  // 音声認識フックを使用
  const {
    transcript,
    isListening,
    startListening,
    stopListening, // stopListeningも使う可能性あり
    error: speechError,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const {
    prompt,
    setPrompt,
    generatedImage,
    isLoading: isGenerating, // useImageGeneratorのisLoadingを改名
    error: generationError,
    generateImage,
  } = useImageGenerator(enhancement);

  const { imageList, saveImage } = useImageStorage(prompt, generatedImage);

  // 音声認識が完了したらプロンプトを設定し、画像生成を開始
  useEffect(() => {
    if (!isListening && transcript && appState === 'listening') { // 認識が終了し、トランスクリプトがあり、前の状態がlisteningなら
      console.log('Speech recognized:', transcript);
      setAppState('processingSpeech');
      setPrompt(transcript); // 認識結果をプロンプトに設定
    }
  }, [isListening, transcript, appState, setPrompt]);

  // プロンプトが設定されたら画像生成を開始
  useEffect(() => {
      // promptが空でなく、前の処理（音声処理またはアイドル）が終わったら生成開始
    if (prompt && (appState === 'processingSpeech' || appState === 'idle') && !isGenerating) {
       const generate = async () => {
           if (enhancement) {
               setAppState('enhancingPrompt');
           } else {
               setAppState('generatingImage');
           }
           await generateImage(); // useImageGenerator内のenhancement処理に依存
           // generateImageの完了はuseImageGenerator内のisLoadingとgeneratedImageで検知
       }
       generate();
    }
  }, [prompt, appState, enhancement, generateImage, isGenerating]);

  // 画像生成の状態を監視
   useEffect(() => {
      if (isGenerating) {
          // generateImageが呼ばれたら自動的にisLoading=trueになるので、
          // appStateがまだgeneratingImageでなければ設定
          if (appState !== 'generatingImage' && appState !== 'enhancingPrompt') {
             setAppState(enhancement ? 'enhancingPrompt' : 'generatingImage');
          }
      } else if (generatedImage && appState === 'generatingImage') {
          setAppState('displayingImage');
      } else if (generationError && (appState === 'generatingImage' || appState === 'enhancingPrompt')) {
          setAppState('error');
      } else if (!isGenerating && !generatedImage && appState === 'generatingImage') {
          // 画像生成が完了したが、画像がない場合（エラーケースなど）
          setAppState('idle'); // または 'error' 状態へ
      }

   }, [isGenerating, generatedImage, generationError, appState, enhancement]);

   // エラー状態の集約
   const currentError = speechError || generationError;
   useEffect(() => {
       if (currentError) {
           setAppState('error');
       }
   }, [currentError]);


  const handleStartTalking = () => {
    if (!isListening) {
      // setGeneratedImage(null); // 新しい認識開始時に前の画像をクリア
      // 他の状態もリセットする必要があるか検討
      setPrompt('');
      setAppState('listening');
      startListening();
    } else {
      // すでに聞いている場合、停止する（オプション）
      // stopListening();
      // setAppState('processingSpeech'); // 手動停止の場合
    }
  };

  // ボタンのテキストと無効化状態を決定
  const getButtonState = (): { text: string; disabled: boolean } => {
    if (!browserSupportsSpeechRecognition) {
      return { text: 'Speech Recognition Not Supported', disabled: true };
    }
    switch (appState) {
      case 'listening':
        return { text: 'Listening...', disabled: false }; // 聞いている最中でも停止できるようにするなら false
      case 'processingSpeech':
        return { text: 'Processing Speech...', disabled: true };
      case 'enhancingPrompt':
        return { text: 'Enhancing Prompt...', disabled: true };
      case 'generatingImage':
        return { text: 'Generating Image...', disabled: true };
      case 'error':
      case 'idle':
      case 'displayingImage':
      default:
        return { text: 'Start Talking', disabled: false };
    }
  };

  const buttonState = getButtonState();

  return (
    <div className="container mx-auto p-4 md:p-8 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
        Voice Image Generator
      </h1>
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Speak your prompt after clicking the button. Uses{' '}
          <a className="hover:text-blue-500" href="https://together.ai/">Together AI</a>
          {enhancement && (
              <> and <a className="hover:text-blue-500" href="https://cloud.cerebras.ai/">Cerebras API for enhancement</a></>
          )}
          .
      </h2>

      {/* 音声入力ボタン */}
      <div className="flex flex-col items-center mb-4 gap-2">
         <button
            className={`w-full sm:w-auto px-6 py-3 rounded shadow-sm text-white font-medium transition duration-150 ease-in-out ${
              buttonState.disabled || !browserSupportsSpeechRecognition
                ? 'bg-gray-400 cursor-not-allowed'
                : appState === 'listening'
                ? 'bg-red-600 hover:bg-red-700' // Listening中は停止ボタンのように見せることも可能
                : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${appState === 'listening' ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            onClick={handleStartTalking}
            disabled={buttonState.disabled}
          >
             {/* ローディングスピナーを追加 */}
              {(appState === 'processingSpeech' || appState === 'enhancingPrompt' || appState === 'generatingImage') && (
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              )}
            {buttonState.text}
          </button>
          {!browserSupportsSpeechRecognition && (
              <p className="text-red-500 text-sm mt-1">Your browser does not support speech recognition.</p>
          )}

         {/* Enhancement Checkbox */}
          <div className="flex items-center mt-2 sm:mt-0">
            <input
              type="checkbox"
              id="enhancement"
              checked={enhancement}
              onChange={(e) => setEnhancement(e.target.checked)}
              className="mr-2"
              disabled={appState !== 'idle' && appState !== 'displayingImage' && appState !== 'error'} // 処理中は変更不可
            />
            <label htmlFor="enhancement" className="text-gray-700 text-sm">
              Enhance Prompt (uses Cerebras API)
            </label>
          </div>
      </div>

       {/* 認識されたテキストを表示（デバッグ用） */}
        {transcript && (
            <p className="my-2 text-center text-gray-600 text-sm italic">Recognized: "{transcript}"</p>
        )}
        {/* 強化されたプロンプトを表示（デバッグ用） */}
        {enhancement && prompt !== transcript && prompt && (
             <p className="my-2 text-center text-gray-500 text-sm italic">Enhanced: "{prompt}"</p>
        )}


      {/* ローディング/エラー表示 */}
      {appState === 'generatingImage' && !isGenerating && (
          <p className="my-4 text-center text-gray-600">Starting image generation...</p> /* 開始直後の表示 */
      )}
      {currentError && (
        <p className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center font-semibold">
          Error: {currentError}
        </p>
      )}

      {/* 画像表示 */}
      {generatedImage && (appState === 'displayingImage' || appState === 'idle' || appState === 'error') && ( // 表示状態、アイドル、エラー時に画像を表示し続ける
        <ImageDisplay imageUrl={generatedImage} onSave={saveImage} />
      )}

      <ImageGallery images={imageList} />
    </div>
  );
}

export default App;