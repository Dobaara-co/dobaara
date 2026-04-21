import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, MessageCircle } from 'lucide-react'
import type { Message } from '@/types/database'

type Thread = {
  otherId: string
  lastMessage: Message
  unreadCount: number
}

const Messages = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeThread, setActiveThread] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  if (!user) {
    navigate('/auth', { state: { from: '/messages' } })
    return null
  }

  // Fetch all messages involving the current user
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Message[]
    },
    refetchInterval: 10_000,
  })

  // Build threads (grouped by conversation partner)
  const threadMap = new Map<string, Thread>()
  for (const msg of messages) {
    const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
    const existing = threadMap.get(otherId)
    if (!existing || msg.created_at > existing.lastMessage.created_at) {
      threadMap.set(otherId, {
        otherId,
        otherProfile: null,
        lastMessage: msg,
        unreadCount: !existing ? 0 : existing.unreadCount,
        listing: null,
      })
    }
    if (!msg.is_read && msg.recipient_id === user.id) {
      const t = threadMap.get(otherId)!
      t.unreadCount += 1
    }
  }
  const threads = Array.from(threadMap.values()).sort(
    (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
  )

  const activeMessages = messages.filter((m) =>
    m.sender_id === activeThread || m.recipient_id === activeThread
  )

  const sendMutation = useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: activeThread!,
        body,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setDraft('')
      queryClient.invalidateQueries({ queryKey: ['messages', user.id] })
    },
  })

  function handleSend() {
    if (!draft.trim() || !activeThread) return
    sendMutation.mutate(draft.trim())
  }

  if (isLoading) {
    return <div className="container py-20 text-center text-muted-foreground">Loading messages…</div>
  }

  return (
    <div className="container py-6 pb-24 md:pb-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      {threads.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-semibold">No messages yet</p>
          <p className="text-sm text-muted-foreground mt-1">When you contact a seller or get an offer, it'll appear here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-[280px,1fr] gap-4 h-[calc(100vh-200px)]">
          {/* Thread list */}
          <div className="rounded-lg border border-border bg-card overflow-y-auto">
            {threads.map((thread) => (
              <button
                key={thread.otherId}
                onClick={() => setActiveThread(thread.otherId)}
                className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors ${activeThread === thread.otherId ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{thread.otherId.slice(0, 8)}…</p>
                  {thread.unreadCount > 0 && (
                    <span className="rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5">{thread.unreadCount}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{thread.lastMessage.body}</p>
              </button>
            ))}
          </div>

          {/* Message pane */}
          <div className="rounded-lg border border-border bg-card flex flex-col">
            {activeThread ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${msg.sender_id === user.id ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'}`}>
                        {msg.body}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border p-3 flex gap-2">
                  <Textarea
                    rows={2}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message…"
                    className="resize-none"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  />
                  <Button variant="hero" size="icon" onClick={handleSend} disabled={!draft.trim() || sendMutation.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages
