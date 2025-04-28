// import { useState } from 'react'
// import { generateText } from 'ai'
// import { systemPromptForEnhancement } from '../assets/prompt'
// import { createTogetherClient, createCerebrasClient } from '../utils'

// const model = 'black-forest-labs/FLUX.1-schnell-Free'
// const steps = 4
// const imageWidth = 1024
// const imageHeight = 1024

// interface UseImageGeneratorResult {
//   prompt: string
//   setPrompt: (prompt: string) => void
//   generatedImage: string | null
//   isLoading: boolean
//   error: string | null
//   generateImage: () => Promise<void>
// }

// export const useImageGenerator = (
//   enhancement: boolean
// ): UseImageGeneratorResult => {
//   const [prompt, setPrompt] = useState<string>('')
//   const [generatedImage, setGeneratedImage] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)

//   const together = createTogetherClient()
//   const cerebras = createCerebrasClient()

//   const generatePrompt = async (): Promise<void> => {
//     const { text } = await generateText({
//       model: cerebras('llama3.3-70b'),
//       system: systemPromptForEnhancement,
//       prompt,
//     })

//     setPrompt(text.replace('Revised prompt: ', ''))
//   }

//   const generateImage = async () => {
//     if (enhancement) {
//       console.log('Enhancing prompt...')
//       await generatePrompt()
//     }

//     const trimmedPrompt = prompt.trim()

//     if (!together) {
//       setError('API Key is missing. Cannot make requests.')
//       return
//     }

//     if (isLoading || !trimmedPrompt) {
//       if (!trimmedPrompt) {
//         setError('Please enter a prompt.')
//       }
//       return
//     }

//     setIsLoading(true)
//     setError(null)
//     setGeneratedImage(null)

//     try {
//       const response = await together.images.create({
//         model,
//         prompt: trimmedPrompt,
//         steps,
//         width: imageWidth,
//         height: imageHeight,
//       })

//       const imageUrl = response?.data?.[0]?.url

//       if (!imageUrl) {
//         throw new Error('Failed to get image URL from the API response.')
//       }

//       setGeneratedImage(imageUrl)
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(`Failed to generate image: ${err.message}`)
//       } else {
//         setError('An unknown error occurred during image generation.')
//       }
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return {
//     prompt,
//     setPrompt,
//     generatedImage,
//     isLoading,
//     error,
//     generateImage,
//   }
// }

import { useState } from 'react'
import { generateText } from 'ai'
import { systemPromptForEnhancement } from '../assets/prompt'
import { createTogetherClient, createCerebrasClient } from '../utils'

const model = 'black-forest-labs/FLUX.1-schnell-Free'
const steps = 4
const imageWidth = 1024
const imageHeight = 1024

interface UseImageGeneratorResult {
  prompt: string // 表示用のプロンプト (強化後もここに反映される)
  setPrompt: (prompt: string) => void // App.tsxから初期プロンプトを設定するために必要
  generatedImage: string | null
  isLoading: boolean // generateImage プロセス全体の実行中を示す
  error: string | null
  generateImage: () => Promise<void>
}

export const useImageGenerator = (
  enhancement: boolean
): UseImageGeneratorResult => {
  const [prompt, setPrompt] = useState<string>('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const together = createTogetherClient()
  const cerebras = createCerebrasClient()

  // ★★★ 戻り値を Promise<string> に変更 ★★★
  const generatePrompt = async (): Promise<string> => {
    // Cerebras クライアントが初期化されているか確認
    if (!cerebras) {
      // エラーを投げるか、デフォルトプロンプトを返すかなどの処理
      throw new Error('Cerebras client is not available. Check API Key.')
    }
    console.log(`Starting prompt enhancement for: "${prompt}"`)
    const { text } = await generateText({
      model: cerebras('llama3.3-70b'), // モデル名が正しいか確認
      system: systemPromptForEnhancement,
      prompt, // この時点でのプロンプトを使用
    })

    // "Revised prompt:" 部分を除去し、前後の空白をトリム
    const enhancedPromptText = text.replace(/^Revised prompt:\s*/i, '').trim()
    console.log('Enhanced prompt generated:', enhancedPromptText)

    // ★★★ 強化後のテキストを返す ★★★
    return enhancedPromptText
  }

  const generateImage = async () => {
    // ★ プロセス開始時に状態を初期化
    console.log('generateImage called. Setting initial state...')
    setIsLoading(true)
    setError(null)
    setGeneratedImage(null)

    // ★ APIに渡すプロンプトを格納する変数。まず現在のstateを代入。
    let promptForApi = prompt

    try {
      // Enhancementが有効ならプロンプトを強化
      if (enhancement) {
        console.log('Enhancement enabled. Calling generatePrompt...')
        // ★★★ generatePrompt の戻り値（強化後プロンプト）を受け取る ★★★
        promptForApi = await generatePrompt()
        // ★★★ 表示用の state も強化後プロンプトで更新 ★★★
        setPrompt(promptForApi)
        console.log('Prompt enhancement successful. Updated prompt state.')
      }

      // ★ APIに渡すプロンプト（強化後または元のまま）をトリム
      const trimmedPrompt = promptForApi.trim()
      console.log(`Using final prompt for Together AI: "${trimmedPrompt}"`)

      // Together クライアントとプロンプトの有効性をチェック
      if (!together) {
        throw new Error('Together AI client is not available. Check API Key.')
      }
      if (!trimmedPrompt) {
        console.error('Prompt is empty after potential enhancement.')
        throw new Error('Prompt cannot be empty for image generation.')
      }

      // ★ Together AI 呼び出し
      console.log('Calling Together AI images.create...')
      const response = await together.images.create({
        model,
        prompt: trimmedPrompt, // ★ 確定したプロンプトを使用
        steps,
        width: imageWidth,
        height: imageHeight,
      })

      const imageUrl = response?.data?.[0]?.url

      if (!imageUrl) {
        throw new Error('Failed to get image URL from Together AI response.')
      }

      console.log('Image generated successfully:', imageUrl)
      setGeneratedImage(imageUrl) // ★ 成功時に画像 state を更新
    } catch (err: unknown) {
      // ★ 包括的なエラーハンドリング
      console.error('Error during the image generation process:', err)
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred'
      setError(`Operation failed: ${message}`) // より汎用的なエラーメッセージに
      setGeneratedImage(null) // エラー時は画像をクリア
    } finally {
      // ★ プロセス完了後（成功・失敗問わず）にローディング解除
      console.log('generateImage process finished.')
      setIsLoading(false)
    }
  }

  return {
    prompt,
    setPrompt,
    generatedImage,
    isLoading,
    error,
    generateImage,
  }
}
