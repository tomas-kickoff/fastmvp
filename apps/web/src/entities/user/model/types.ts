export type User = {
  id: string;
  email: string;
  name: string;
};

export type Session = {
  token: string;
  user: User;
};
