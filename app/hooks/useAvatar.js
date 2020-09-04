import { useState, useEffect } from 'react'
import useFetch from 'use-http'
import { apiUrl } from '../api-utils'

export const useAvatar = (name) => {
  const [data, setData] = useState()
  const [request, response] = useFetch(`${apiUrl}/avatars`)

  useEffect(() => {
    const storedDataUrl = window.localStorage.getItem(
      `PatternsII-avatar-${name}`
    )

    const fetchAvatar = async () => {
      const data = await request.get(`?names=${[name].join(',')}`)

      if (response.ok) {
        const dataUrl = data.find((entry) => entry.name === name).dataUrl || ''
        window.localStorage.setItem(`PatternsII-avatar-${name}`, dataUrl)
        setData(dataUrl)
      }
    }
    if (!storedDataUrl && name) {
      fetchAvatar()
    } else if (/data:image/.test(storedDataUrl)) {
      setData(storedDataUrl)
    }
  }, [data, name, request, response.ok])

  return data || ''
}
