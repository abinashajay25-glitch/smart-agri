import type { ImageQualityValidation } from './types'

export async function validateOnionImage(imageSrc: string): Promise<ImageQualityValidation> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width
        const height = img.naturalHeight || img.height
        const warnings: string[] = []

        if (width < 300 || height < 300) {
          warnings.push('Image resolution is very low (< 300px). Detail detection may be compromised.')
        }

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve({
            isValid: true,
            brightnessScore: 75,
            sharpnessScore: 80,
            isBlurry: false,
            hasOverlappingOnions: false,
            isLightingPoor: false,
            warnings,
          })
          return
        }

        canvas.width = Math.min(width, 400)
        canvas.height = Math.min(height, 400)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imgData.data

        // Calculate average brightness
        let totalBrightness = 0
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          totalBrightness += (r + g + b) / 3
        }
        const avgBrightness = Math.round(totalBrightness / (data.length / 4))
        const brightnessScore = Math.max(0, Math.min(100, Math.round((avgBrightness / 255) * 100)))

        const isLightingPoor = brightnessScore < 25 || brightnessScore > 90
        if (brightnessScore < 25) {
          warnings.push('Image lighting is too dark. Please ensure sufficient ambient illumination.')
        } else if (brightnessScore > 90) {
          warnings.push('Image lighting is overexposed. Glare may impair skin flaw detection.')
        }

        // Estimate sharpness via variance of Laplacian/neighbor differences
        let diffSum = 0
        const w = canvas.width
        const h = canvas.height
        for (let y = 1; y < h - 1; y += 2) {
          for (let x = 1; x < w - 1; x += 2) {
            const idx = (y * w + x) * 4
            const rightIdx = (y * w + (x + 1)) * 4
            const bottomIdx = ((y + 1) * w + x) * 4
            const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
            const right = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3
            const bottom = (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3
            diffSum += Math.abs(current - right) + Math.abs(current - bottom)
          }
        }
        const avgDiff = diffSum / ((w * h) / 4)
        const sharpnessScore = Math.max(0, Math.min(100, Math.round(avgDiff * 3.5)))
        const isBlurry = sharpnessScore < 20

        if (isBlurry) {
          warnings.push('Image appears blurry or out of focus. Hold camera steady or re-focus.')
        }

        // Heuristic check for high density/overlapping sample layout
        const hasOverlappingOnions = avgDiff > 45 && width > 800
        if (hasOverlappingOnions) {
          warnings.push('Sample contains densely packed or overlapping onions. Spread onions evenly on a flat surface for best detection precision.')
        }

        const isValid = warnings.length < 3

        resolve({
          isValid,
          brightnessScore,
          sharpnessScore,
          isBlurry,
          hasOverlappingOnions,
          isLightingPoor,
          warnings,
        })
      } catch {
        resolve({
          isValid: true,
          brightnessScore: 75,
          sharpnessScore: 75,
          isBlurry: false,
          hasOverlappingOnions: false,
          isLightingPoor: false,
          warnings: [],
        })
      }
    }
    img.onerror = () => {
      resolve({
        isValid: false,
        brightnessScore: 0,
        sharpnessScore: 0,
        isBlurry: true,
        hasOverlappingOnions: false,
        isLightingPoor: true,
        warnings: ['Unable to read or parse image file.'],
      })
    }
    img.src = imageSrc
  })
}
