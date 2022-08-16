/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateMessageInput = {
  id?: string | null,
  conversationId: string,
  body: string,
  createdAt?: string | null,
  sender: string,
  receiver: string,
};

export type ModelMessageConditionInput = {
  conversationId?: ModelStringInput | null,
  body?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  sender?: ModelStringInput | null,
  receiver?: ModelStringInput | null,
  and?: Array< ModelMessageConditionInput | null > | null,
  or?: Array< ModelMessageConditionInput | null > | null,
  not?: ModelMessageConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type Message = {
  __typename: "Message",
  id: string,
  conversationId: string,
  body: string,
  createdAt: string,
  sender: string,
  receiver: string,
  updatedAt: string,
};

export type UpdateMessageInput = {
  id: string,
  conversationId?: string | null,
  body?: string | null,
  createdAt?: string | null,
  sender?: string | null,
  receiver?: string | null,
};

export type DeleteMessageInput = {
  id: string,
};

export type CreateConversationInput = {
  conversationId: string,
  participants: Array< string >,
  lastMessage?: string | null,
  lastUpdate?: string | null,
};

export type ModelConversationConditionInput = {
  participants?: ModelStringInput | null,
  lastMessage?: ModelStringInput | null,
  lastUpdate?: ModelStringInput | null,
  and?: Array< ModelConversationConditionInput | null > | null,
  or?: Array< ModelConversationConditionInput | null > | null,
  not?: ModelConversationConditionInput | null,
};

export type Conversation = {
  __typename: "Conversation",
  conversationId: string,
  participants: Array< string >,
  lastMessage?: string | null,
  lastUpdate?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateConversationInput = {
  conversationId: string,
  participants?: Array< string > | null,
  lastMessage?: string | null,
  lastUpdate?: string | null,
};

export type DeleteConversationInput = {
  conversationId: string,
};

export type ModelMessageFilterInput = {
  id?: ModelIDInput | null,
  conversationId?: ModelStringInput | null,
  body?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  sender?: ModelStringInput | null,
  receiver?: ModelStringInput | null,
  and?: Array< ModelMessageFilterInput | null > | null,
  or?: Array< ModelMessageFilterInput | null > | null,
  not?: ModelMessageFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelMessageConnection = {
  __typename: "ModelMessageConnection",
  items:  Array<Message | null >,
  nextToken?: string | null,
};

export type ModelConversationFilterInput = {
  conversationId?: ModelStringInput | null,
  participants?: ModelStringInput | null,
  lastMessage?: ModelStringInput | null,
  lastUpdate?: ModelStringInput | null,
  and?: Array< ModelConversationFilterInput | null > | null,
  or?: Array< ModelConversationFilterInput | null > | null,
  not?: ModelConversationFilterInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelConversationConnection = {
  __typename: "ModelConversationConnection",
  items:  Array<Conversation | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionMessageFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  conversationId?: ModelSubscriptionStringInput | null,
  body?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  sender?: ModelSubscriptionStringInput | null,
  receiver?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionMessageFilterInput | null > | null,
  or?: Array< ModelSubscriptionMessageFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionConversationFilterInput = {
  conversationId?: ModelSubscriptionStringInput | null,
  participants?: ModelSubscriptionStringInput | null,
  lastMessage?: ModelSubscriptionStringInput | null,
  lastUpdate?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionConversationFilterInput | null > | null,
  or?: Array< ModelSubscriptionConversationFilterInput | null > | null,
};

export type CreateMessageMutationVariables = {
  input: CreateMessageInput,
  condition?: ModelMessageConditionInput | null,
};

export type CreateMessageMutation = {
  createMessage?:  {
    __typename: "Message",
    id: string,
    conversationId: string,
    body: string,
    createdAt: string,
    sender: string,
    receiver: string,
    updatedAt: string,
  } | null,
};

export type UpdateMessageMutationVariables = {
  input: UpdateMessageInput,
  condition?: ModelMessageConditionInput | null,
};

export type UpdateMessageMutation = {
  updateMessage?:  {
    __typename: "Message",
    id: string,
    conversationId: string,
    body: string,
    createdAt: string,
    sender: string,
    receiver: string,
    updatedAt: string,
  } | null,
};

export type DeleteMessageMutationVariables = {
  input: DeleteMessageInput,
  condition?: ModelMessageConditionInput | null,
};

export type DeleteMessageMutation = {
  deleteMessage?:  {
    __typename: "Message",
    id: string,
    conversationId: string,
    body: string,
    createdAt: string,
    sender: string,
    receiver: string,
    updatedAt: string,
  } | null,
};

export type CreateConversationMutationVariables = {
  input: CreateConversationInput,
  condition?: ModelConversationConditionInput | null,
};

export type CreateConversationMutation = {
  createConversation?:  {
    __typename: "Conversation",
    conversationId: string,
    participants: Array< string >,
    lastMessage?: string | null,
    lastUpdate?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateConversationMutationVariables = {
  input: UpdateConversationInput,
  condition?: ModelConversationConditionInput | null,
};

export type UpdateConversationMutation = {
  updateConversation?:  {
    __typename: "Conversation",
    conversationId: string,
    participants: Array< string >,
    lastMessage?: string | null,
    lastUpdate?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteConversationMutationVariables = {
  input: DeleteConversationInput,
  condition?: ModelConversationConditionInput | null,
};

export type DeleteConversationMutation = {
  deleteConversation?:  {
    __typename: "Conversation",
    conversationId: string,
    participants: Array< string >,
    lastMessage?: string | null,
    lastUpdate?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetMessageQueryVariables = {
  id: string,
};

export type GetMessageQuery = {
  getMessage?:  {
    __typename: "Message",
    id: string,
    conversationId: string,
    body: string,
    createdAt: string,
    sender: string,
    receiver: string,
    updatedAt: string,
  } | null,
};

export type ListMessagesQueryVariables = {
  filter?: ModelMessageFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListMessagesQuery = {
  listMessages?:  {
    __typename: "ModelMessageConnection",
    items:  Array< {
      __typename: "Message",
      id: string,
      conversationId: string,
      body: string,
      createdAt: string,
      sender: string,
      receiver: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetConversationQueryVariables = {
  conversationId: string,
};

export type GetConversationQuery = {
  getConversation?:  {
    __typename: "Conversation",
    conversationId: string,
    participants: Array< string >,
    lastMessage?: string | null,
    lastUpdate?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListConversationsQueryVariables = {
  conversationId?: string | null,
  filter?: ModelConversationFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListConversationsQuery = {
  listConversations?:  {
    __typename: "ModelConversationConnection",
    items:  Array< {
      __typename: "Conversation",
      conversationId: string,
      participants: Array< string >,
      lastMessage?: string | null,
      lastUpdate?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateMessageByConversationIdSubscriptionVariables = {
  conversationId: string,
};

export type OnCreateMessageByConversationIdSubscription = {
  onCreateMessageByConversationId?:  {
    __typename: "Message",
    id: string,
    conversationId: string,
    body: string,
    createdAt: string,
    sender: string,
    receiver: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateConversationByConversationIdSubscriptionVariables = {
  conversationId: string,
};

export type OnUpdateConversationByConversationIdSubscription = {
  onUpdateConversationByConversationId?:  {
    __typename: "Conversation",
    conversationId: string,
    participants: Array< string >,
    lastMessage?: string | null,
    lastUpdate?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateMessageSubscriptionVariables = {
  filter?: ModelSubscriptionMessageFilterInput | null,
};

export type OnCreateMessageSubscription = {
  onCreateMessage?:  {
    __typename: "Message",
    id: string,
    conversationId: string,
    body: string,
    createdAt: string,
    sender: string,
    receiver: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateMessageSubscriptionVariables = {
  filter?: ModelSubscriptionMessageFilterInput | null,
};

export type OnUpdateMessageSubscription = {
  onUpdateMessage?:  {
    __typename: "Message",
    id: string,
    conversationId: string,
    body: string,
    createdAt: string,
    sender: string,
    receiver: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteMessageSubscriptionVariables = {
  filter?: ModelSubscriptionMessageFilterInput | null,
};

export type OnDeleteMessageSubscription = {
  onDeleteMessage?:  {
    __typename: "Message",
    id: string,
    conversationId: string,
    body: string,
    createdAt: string,
    sender: string,
    receiver: string,
    updatedAt: string,
  } | null,
};

export type OnCreateConversationSubscriptionVariables = {
  filter?: ModelSubscriptionConversationFilterInput | null,
};

export type OnCreateConversationSubscription = {
  onCreateConversation?:  {
    __typename: "Conversation",
    conversationId: string,
    participants: Array< string >,
    lastMessage?: string | null,
    lastUpdate?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateConversationSubscriptionVariables = {
  filter?: ModelSubscriptionConversationFilterInput | null,
};

export type OnUpdateConversationSubscription = {
  onUpdateConversation?:  {
    __typename: "Conversation",
    conversationId: string,
    participants: Array< string >,
    lastMessage?: string | null,
    lastUpdate?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteConversationSubscriptionVariables = {
  filter?: ModelSubscriptionConversationFilterInput | null,
};

export type OnDeleteConversationSubscription = {
  onDeleteConversation?:  {
    __typename: "Conversation",
    conversationId: string,
    participants: Array< string >,
    lastMessage?: string | null,
    lastUpdate?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
