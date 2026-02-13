'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default funtion ListPage () {
  const [items, setItems] = useState<any[]>([])

    useEffect(() => {
        fetchData()
    }, [])
     
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

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Spabase Data</h1>
            {items.length === 0 && <p>No data found.</p>}

            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        <prev>{JSON.stringify(items, null, 2)}</prev>
                    </li>
                ))}
            </ul>
        </div>
    )
}