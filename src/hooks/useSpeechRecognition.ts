import { useState, useEffect, useCallback } from "react";

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  browserSupportsSpeechRecognition: boolean;
}

// Web Speech APIの型定義を確認 (ブラウザによってプレフィックスが異なる場合がある)
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );

  const browserSupportsSpeechRecognition = !!SpeechRecognition;

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false; // 話し終えたら認識終了
    recog.interimResults = false; // 確定した結果のみ取得
    recog.lang = "en-US"; // 必要に応じて言語を変更

    recog.onresult = (event) => {
      const currentTranscript = event.results[0][0].transcript;
      setTranscript(currentTranscript);
      setError(null); // Clear previous errors on new result
      // Optional: Automatically stop listening after a result
      // stopListening(); // これを有効にすると話し終えたら即座に処理開始
    };

    recog.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recog.onend = () => {
      // Automatically stop listening state when recognition ends
      // This might happen due to silence or explicit stop
      console.log('Speech recognition before', isListening);
        setIsListening(false);
    //   if (isListening) {
    //     // Avoid setting state if already stopped manually
    //     console.log('Speech recognition before', isListening);
    //     setIsListening(false);
    //     // ここで認識完了後の処理（generateImage呼び出しなど）をトリガーすることも可能
    //     console.log("Speech recognition ended.");
    //     console.log('Speech recognition after', isListening);
    //   }
    };

    recog.onspeechend = () => {
      console.log("Speech has stopped being detected.");
      // ユーザーが話すのをやめたと判断された場合に停止
      recog.stop();
    };
    

     // --- ★デバッグ用ログ追加 ---
  recog.onaudiostart = () => console.log('Audio capturing started.');
  recog.onaudioend = () => console.log('Audio capturing ended.');
  recog.onsoundstart = () => console.log('Sound detected.');
  recog.onsoundend = () => console.log('Sound stopped being detected.');
  recog.onspeechstart = () => console.log('Speech detected.');
  recog.onnomatch = (event) => console.log("Speech could not be recognized:", event);
  // --- デバッグ用ログ追加ここまで ---

    setRecognition(recog);

    // クリーンアップ関数
    return () => {
      recog.stop();
    };
  }, [browserSupportsSpeechRecognition, isListening]); // isListeningを依存配列に追加して再起動を防ぐ

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript(""); // 開始時に前のテキストをクリア
      setError(null);
      try {
        console.log('Attempting to start recognition...');
        recognition.start();
        console.log('Recognition started.');
        setIsListening(true);
      } catch (err) {
        console.error("Error starting recognition:", err);
        // iOS Safariなどではユーザーインタラクション直後でないとエラーになることがある
        setError("Could not start speech recognition. Please try again.");
        setIsListening(false);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false); // Explicitly set listening to false
    }
  }, [recognition, isListening]);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    error,
    browserSupportsSpeechRecognition,
  };
};
