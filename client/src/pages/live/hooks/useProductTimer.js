import { useState, useRef, useCallback, useEffect } from 'react'

export function useProductTimer(products) {
  const [currentProductIndex, setCurrentProductIndex] = useState(-1)
  const [productTime, setProductTime] = useState(0)
  const productTimerRef = useRef(null)

  const startProductTimer = useCallback(
    (index) => {
      if (productTimerRef.current) clearInterval(productTimerRef.current)

      setCurrentProductIndex(index)
      setProductTime(0)

      productTimerRef.current = setInterval(() => {
        setProductTime((prev) => {
          const timeSlot = products[index]?.timeSlot || 60
          if (prev >= timeSlot) {
            clearInterval(productTimerRef.current)
            return timeSlot
          }
          return prev + 1
        })
      }, 1000)
    },
    [products]
  )

  const stopProductTimer = useCallback(() => {
    if (productTimerRef.current) {
      clearInterval(productTimerRef.current)
      productTimerRef.current = null
    }
    setCurrentProductIndex(-1)
    setProductTime(0)
  }, [])

  useEffect(() => {
    return () => {
      if (productTimerRef.current) {
        clearInterval(productTimerRef.current)
      }
    }
  }, [])

  return {
    currentProductIndex,
    productTime,
    startProductTimer,
    stopProductTimer,
    currentProduct: currentProductIndex >= 0 ? products[currentProductIndex] : null,
  }
}
