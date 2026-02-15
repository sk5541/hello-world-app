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
            .from('posts')
            .select('*')
        if (error) {
            console.error('Supabase error:', error.message || error)
            return
        }

        setItems(data || [])
    }

    async function handleVote(postId: number, voteValue: number) {
        if(!user){
            alert('You must be logged in to vote')
            return
        }

        const { error } = await supabase
            .from('caption_votes')
            .insert([
                {
                    caption_id: postId,
                    user_id: user.id,
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
        <div style={{ padding: '2rem' }}>
            <h1>Supabase Data</h1>
            {!user && <p>Login to rate captions</p>}
            {items.length === 0 && <p>No data found.</p>}

            <ul>
                {items.map((item) => (
                    <li key={item.id} style={{ marginBottom: '1.5rem' }}>
                        <pre>{JSON.stringify(item, null, 2)}</pre>

                        <button onClick={() => handleVote(item.id, 1)}>
                            👍 Like
                        </button>

                        <button onClick={() => handleVote(item.id, -1)}>
                            👎 Dislike
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}