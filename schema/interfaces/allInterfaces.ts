interface UserInterface {
  _id: String;
  username: String;
  password: String;
  name: String;
  email: String;
  position: String;
  admin: Boolean;
  avatar: String;
}

interface CaseInterface {
  _id: String;
  description: String;
  date: String;
  signature: String;
  attachments: [String];
  priority: Number;
  status: Number;
  categoryId: [String];
  senderId: String;
}

export { UserInterface, CaseInterface };
