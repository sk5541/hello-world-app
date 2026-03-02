'use client'

import { useState, useEffect} from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [captions, setCaptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  function nextCaption(){
    if(captions.length === 0) return
    setCurrentCaptionIndex((prev) => (prev + 1) % captions.length) 
  }


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

  if(!user) {
    return(
      <div style={{ padding: "2rem" }}>
        <h2>Log in to upload images.</h2>
      </div>
    )
  }
  return (
    <div
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem"
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>Upload Image</h2>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
        onChange={(e) => {
          const selected = e.target.files?.[0] || null
        setFile(selected)
        if (selected) setImagePreview(URL.createObjectURL(selected))
      }}
      style={{ marginBottom: "1rem" }}
    />

    <button
      onClick={handleUpload}
      disabled={loading}
      style={{
        background: "#4CAF50",
        color: "white",
        padding: "0.6rem 1.5rem",
        border: "none",
        borderRadius: "20px",
        cursor: "pointer",
        marginBottom: "2rem"
      }}
    >
      {loading ? "Generating..." : "Generate Captions"}
    </button>

    {imagePreview && captions.length > 0 && (
      <div style={{ position: "relative", maxWidth: "500px", marginBottom: "80px" }}>
        <img
          src={imagePreview}
          alt="preview"
          style={{
            width: "100%",
            borderRadius: "10px"
          }}
        />

        <div
          style={{
            background: "rgba(0,0,0,0.7)",
            padding: "0.8rem 1rem",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "500px",
            marginTop: "1rem"
          }}
        >
          {captions[currentCaptionIndex]?.content}
        </div>
    
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginTop: "1rem"
          }}
        >
          <button
            onClick={nextCaption}
            style={{
              background: "#333",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              cursor: "pointer",
            }}
          >
            👎
          </button> 

          <button
            onClick={nextCaption}
            style={{
              background: "#FFD400",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              cursor: "pointer",
            }}
          >
            👍
          </button>
        </div>
      </div>
    )}
  </div>
)
}