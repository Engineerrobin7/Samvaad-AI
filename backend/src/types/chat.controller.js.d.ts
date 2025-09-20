declare module "chat.controller.js" {
  export function getChatHistory(req: any, res: any): any;
  export function deleteMessage(req: any, res: any): any;
  export function editMessage(req: any, res: any): any;
  export function searchMessages(req: any, res: any): any;
  export function getUnreadCount(req: any, res: any): any;
  export function setTyping(req: any, res: any): any;
  export function createChatRoom(req: any, res: any): any;
  export function uploadAttachment(req: any, res: any): any;
}