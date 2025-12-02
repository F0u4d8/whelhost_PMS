'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UnitVisibilityToggleProps {
  unitId: string
  currentVisibility: boolean
}

export function UnitVisibilityToggle({ unitId, currentVisibility }: UnitVisibilityToggleProps) {
  const [isVisible, setIsVisible] = useState(currentVisibility)
  const [isPending, setIsPending] = useState(false)

  const toggleVisibility = async () => {
    setIsPending(true)
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('units')
        .update({ is_visible: !isVisible })
        .eq('id', unitId)

      if (error) throw error

      setIsVisible(!isVisible)
    } catch (error) {
      console.error('Error toggling unit visibility:', error)
      alert('Failed to update visibility')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleVisibility}
      disabled={isPending}
      aria-label={isVisible ? 'Hide unit' : 'Show unit'}
    >
      {isPending ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isVisible ? (
        <>
          <Eye className="mr-1 h-4 w-4" />
          Shown
        </>
      ) : (
        <>
          <EyeOff className="mr-1 h-4 w-4" />
          Hidden
        </>
      )}
    </Button>
  )
}