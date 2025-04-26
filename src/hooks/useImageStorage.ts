import { useState, useEffect } from 'react' // Added useMemo
import { supabase } from '../utils/supabase'

const expiredDuration = 60

export const useImageStorage = (
  prompt: string,
  generatedImage: string | null
) => {
  const [imageList, setImageList] = useState<string[]>([])

  const fetchImageList = async () => {
    const { data, error } = await supabase.storage
      .from('generated-images')
      .list()

    if (error) {
      console.error('Failed to list images:', error)
      return
    }

    const imageUrls = await Promise.all(
      (data ?? []).map(async (image) => {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from('generated-images')
            .createSignedUrl(image.name, expiredDuration)

        if (signedUrlError) {
          console.error('Signed URL error', signedUrlError)
          return ''
        }

        return signedUrlData?.signedUrl ?? ''
      })
    )

    setImageList(
      imageUrls.filter((url) => !url.includes('.emptyFolderPlaceholder'))
    )
  }

  useEffect(() => {
    fetchImageList()
  }, [])

  const saveImage = async () => {
    if (!generatedImage) {
      console.error('No image to save')
      return
    }

    const endPoint =
      'https://wrjbhpwqhvwdxsfnvfcg.supabase.co/functions/v1/dynamic-endpoint'
    try {
      const response = await fetch(
        `${endPoint}?url=${encodeURIComponent(generatedImage)}`
      )
      if (!response.ok) throw new Error('Failed to fetch image from URL')

      const blob = await response.blob()
      const fileExt = 'jpg'
      const uuid = crypto.randomUUID()
      const maxTotalLength = 50
      const safePrompt = prompt
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '_')
        .slice(
          0,
          Math.max(0, maxTotalLength - uuid.length - fileExt.length - 2)
        )

      const fileName = `${safePrompt}_${uuid}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('generated-images')
        .upload(fileName, blob, {
          contentType: blob.type,
          upsert: true,
          headers: {
            'x-up-meta-generatedImage': generatedImage,
          },
        })

      if (error) {
        console.error('Error uploading image:', error)
      } else {
        console.log('Image uploaded:', data)
        fetchImageList() // Refresh the list
      }
    } catch (error) {
      console.error('Error saving image:', error)
    }
  }

  return {
    imageList,
    saveImage,
    refreshImages: fetchImageList,
  }
}
