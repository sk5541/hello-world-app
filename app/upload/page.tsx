'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [captions, setCaptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function handleUpload() {
    if (!file) {
      alert("Please select an image")
      return
    }

    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token

    if (!accessToken) {
      alert("You must be logged in first")
      return
    }
    setLoading(true)
    try {
      const presignedRes = await fetch(
        "https://api.almostcrackd.ai/pipeline/generate-presigned-url",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contentType: file.type
          })
        }
      )
      if(!presignedRes.ok){
        throw new Error("Failed to generate presigned URL")
      }
      const { presignedUrl, cdnUrl } = await presignedRes.json()
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type
        },
        body: file
      })
      if (!uploadRes.ok){
        throw new Error("Failed to upload image")
      }

      const registerRes = await fetch(
        "https://api.almostcrackd.ai/pipeline/upload-image-from-url",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            imageUrl: cdnUrl,
            isCommonUse: false
          })
        }
      )

      if (!registerRes.ok){
        throw new Error("Failed to register image")
      }

      const { imageId } = await registerRes.json()
      const captionsRes = await fetch (
        "https://api.almostcrackd.ai/pipeline/generate-captions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            imageId
          })
        }
      )

      if (!captionsRes.ok){
        throw new Error("Failed to generate captions")
      }

      const captionData = await captionsRes.json()
      console.log("CAPTION RESPONSE:", captionData)
      setCaptions(captionData)
    } catch (error) {
      console.error(error)
      alert("Something went wrong")
    }
    setLoading(false)
  }
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Upload Image</h1>

      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Generating..." : "Generate Captions"}
      </button>

      <div style={{ marginTop: "2rem" }}>
        {captions.map((cap: any, index: number) => (
          <p key={index}>
            {cap.content}
          </p>
        ))}
      </div>
    </div>
  )
}