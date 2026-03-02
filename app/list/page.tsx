'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ListPage() {
  const [items, setItems] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

    useEffect(() => {
        getUser()
        fetchData()
    }, [])

    async function getUser() {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
    }
     
    async function fetchData() {
        const { data, error } = await supabase
            .from('captions')
            .select('*')
        if (error) {
            console.error('Supabase error:', error.message || error)
            return
        }

        setItems(data || [])
    }

    async function handleVote(postId: number, voteValue: number) {
        const { data } = await supabase.auth.getUser()
        const currentUser = data.user
        
        if(!currentUser){
            alert('You must be logged in to vote')
            return
        }

        const { error } = await supabase
            .from('caption_votes')
            .insert([
                {
                    caption_id: postId,
                    user_id: currentUser.id,
                    vote: voteValue,
                }
            ])
        if (error) {
            console.error('Vote error:', error.message)
            alert('Error submitting vote')
        } else {
            alert('Vote submitted!')
        }
    }
    

    return (
        <>
            <h1>Captions</h1>
            {!user && <p>Login to rate captions</p>}
            {items.length === 0 && <p>No data found.</p>}
            {items.map((item) => (
                <div
                    key={item.id}
                    style={{
                        border: "1px solid #ddd",
                        padding: "1rem",
                        marginBottom: "1rem",
                        borderRadius: "8px"
                    }}
                >
                    <p><strong>{item.content}</strong></p>
                    <p>Likes: {item.like_count}</p>

                    {user && (
                        <>

                            <button 
                                onClick={() => handleVote(item.id, 1)}
                                style={{ marginRight: '10px' }}
                            >
                                👍 Like
                            </button>

                            <button onClick={() => handleVote(item.id, -1)}>
                                👎 Dislike
                            </button>
                        </>
                    )}
                </div>
            ))}
        </>
    )
}