import { useState } from 'react'
import { generateText } from 'ai';
import { systemPromptForEnhancement } from '../assets/prompt'
import { createTogetherClient, createCerebrasClient } from '../utils'

const model = 'black-forest-labs/FLUX.1-schnell-Free'
const steps = 4
const imageWidth = 1024
const imageHeight = 1024

interface UseImageGeneratorResult {
  prompt: string
  setPrompt: (prompt: string) => void
  generatedImage: string | null
  isLoading: boolean
  error: string | null
  generateImage: () => Promise<void>
}

export const useImageGenerator = (enhancement: boolean): UseImageGeneratorResult => {
  const [prompt, setPrompt] = useState<string>('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const together = createTogetherClient()
  const cerebras = createCerebrasClient()

  const generatePrompt = async(): Promise<void> => {
    const { text } = await generateText({
      model: cerebras('llama3.3-70b'),
      system: systemPromptForEnhancement,
      prompt,
    })

    setPrompt(text.replace('Revised prompt: ', ''))

  }

  const generateImage = async () => {
    if(enhancement) {
      console.log('Enhancing prompt...')
      await generatePrompt()
    }

    const trimmedPrompt = prompt.trim()

    if (!together) {
      setError('API Key is missing. Cannot make requests.')
      return
    }

    if (isLoading || !trimmedPrompt) {
      if (!trimmedPrompt) {
        setError('Please enter a prompt.')
      }
      return
    }

    setIsLoading(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const response = await together.images.create({
        model,
        prompt: trimmedPrompt,
        steps,
        width: imageWidth,
        height: imageHeight,
      })

      const imageUrl = response?.data?.[0]?.url

      if (!imageUrl) {
        throw new Error('Failed to get image URL from the API response.')
      }

      setGeneratedImage(imageUrl)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Failed to generate image: ${err.message}`)
      } else {
        setError('An unknown error occurred during image generation.')
      }
    } finally {
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
