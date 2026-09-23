export interface TreeMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  parent_id: string | null
  active_child_id: string | null
  created_at: string
  topic_path?: string[] | null
  doc_id?: string | null
  linked_doc_ids?: string[] | null
  stale_target_doc_id?: string | null
}

// rootId에서 active_child_id를 따라가며 "지금 화면에 보이는 한 줄"을 시간순으로 반환한다.
// 유저가 형제(버전) 사이를 넘나들며 바꾼 active_child_id 포인터를 그대로 따라가므로,
// 버려졌던 브랜치로 돌아가면 그 브랜치에서 이어졌던 대화가 그대로 다시 보인다.
export function buildActivePath<T extends TreeMessage>(messages: T[], rootId: string | null): T[] {
  const byId = new Map(messages.map((m) => [m.id, m]))
  const path: T[] = []
  let current = rootId ? byId.get(rootId) : undefined
  while (current) {
    path.push(current)
    current = current.active_child_id ? byId.get(current.active_child_id) : undefined
  }
  return path
}

// startId에서 parent_id를 거슬러 올라가 루트까지의 조상 체인을 시간순(루트가 맨 앞)으로 반환한다.
// active_child_id와 무관하게 그 메시지가 생성될 때 확정된 계보이므로, 지금 어떤 브랜치가
// 활성인지와 상관없이 "이 메시지 지점까지의 대화 맥락"을 정확히 재구성할 수 있다.
export function buildAncestorChain<T extends TreeMessage>(messages: T[], startId: string | null): T[] {
  const byId = new Map(messages.map((m) => [m.id, m]))
  const chain: T[] = []
  let current = startId ? byId.get(startId) : undefined
  while (current) {
    chain.push(current)
    current = current.parent_id ? byId.get(current.parent_id) : undefined
  }
  return chain.reverse()
}
