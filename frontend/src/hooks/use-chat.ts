import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Message, type Conversation } from "@shared/models/chat";
import { getApiUrl } from "@/lib/api";

// Define response types manually since they come from integration routes
// which might not be strictly typed in shared schema imports yet
type ConversationWithMessages = Conversation & { messages: Message[] };

export function useConversations() {
  return useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/conversations"));
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return await res.json() as Conversation[];
    },
  });
}

export function useConversation(id: number) {
  return useQuery({
    queryKey: ["/api/conversations", id],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/conversations/${id}`));
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return await res.json() as ConversationWithMessages;
    },
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string = "New Chat") => {
      const res = await fetch(getApiUrl("/api/conversations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return await res.json() as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(getApiUrl(`/api/conversations/${id}`), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete conversation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      content,
      language,
      onStreaming
    }: {
      id: number;
      content: string;
      language?: string;
      onStreaming?: (chunk: string) => void
    }) => {
      const res = await fetch(getApiUrl(`/api/conversations/${id}/messages`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, language }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          buffer += decoder.decode();
        } else {
          buffer += decoder.decode(value, { stream: true });
        }

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const line = event.split("\n").find((entry) => entry.startsWith("data: "));
          if (line) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.content && onStreaming) {
                onStreaming(data.content);
              }

              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error("Error parsing SSE data", e);
            }
          }
        }

        if (done) break;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
}
