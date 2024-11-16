// Schema:
import { User } from '../../generated/schema';

export function getUser(address: string, type: string): User {
  let user = User.load(address);

  if (!user) {
    user = new User(address);
    user.type = type;

    user.save();
  }

  return user;
}
