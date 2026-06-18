export class Message {
  public id: string;
  public senderId: string;
  public receiverId: string;
  public content: string;
  public read: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    senderId: string,
    receiverId: string,
    content: string,
    read: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.read = read;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export class Conversation {
  public id: string;
  public participant1Id: string;
  public participant2Id: string;
  public lastMessageId: string | null;
  public lastMessage: {
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    participant1Id: string,
    participant2Id: string,
    lastMessageId: string | null,
    lastMessage: {
      content: string;
      senderId: string;
      createdAt: Date;
    } | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.participant1Id = participant1Id;
    this.participant2Id = participant2Id;
    this.lastMessageId = lastMessageId;
    this.lastMessage = lastMessage;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
